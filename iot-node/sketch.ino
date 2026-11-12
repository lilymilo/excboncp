#include <WiFi.h>
#include <PubSubClient.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <time.h>
#include <mbedtls/md.h>

#define PIN_DHT    15
#define DHTTYPE    DHT22
#define PIN_BUZZER 25

// 0: Wokwi cloud simulation, 1: physical ESP32 on Wi-Fi.
#define USE_PHYSICAL_HARDWARE 1

// --- GANTI INI SEBELUM UPLOAD ---
const char* WIFI_SSID     = "GANTI_DENGAN_SSID_WIFI_ANDA";
const char* WIFI_PASSWORD = "GANTI_DENGAN_PASSWORD_WIFI_ANDA";
// ---------------------------------

#if USE_PHYSICAL_HARDWARE
  const char* MQTT_BROKER = "broker.emqx.io";
  const char* NODE_ID     = "ESP32-PHYSICAL-NODE-01";
  #define PIN_SOIL   35
  // GPIO 27: digital I/O penuh, mendukung INPUT_PULLUP — wajib untuk sensor flame DO
  #define PIN_FLAME  27
#else
  const char* MQTT_BROKER = "broker.emqx.io";
  const char* NODE_ID     = "ESP32-WOKWI-NODE-01";
  #define PIN_SOIL   34
  #define PIN_FLAME  13
#endif

const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "CbonCP/node-1/telemetry";
const char* SENSOR_SECRET = "cboncp-shared-device-secret";

const char* NTP_SERVER          = "pool.ntp.org";
const long  GMT_OFFSET_SEC       = 25200; // UTC+7 (WIB)
const int   DAYLIGHT_OFFSET_SEC   = 0;
const char* TIMEZONE_NAME       = "Asia/Jakarta";
const char* TIMEZONE_ABBR       = "WIB";
const char* UTC_OFFSET_STR      = "+07:00";

WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(PIN_DHT, DHTTYPE);

float lastSoilMoisture = -999.0;
// Bogor: rata-rata suhu udara 26-28°C, lebih sejuk dari Jakarta karena ketinggian 190-330m
float lastTemp         = 26.5;
bool  lastFlame        = false;

const float SOIL_THRESHOLD = 1.0;
const float TEMP_THRESHOLD = 0.5;

unsigned long lastSampleTime    = 0;
unsigned long lastHeartbeatTime = 0;
unsigned long lastMqttRetry     = 0;
unsigned long lastWiFiRetry     = 0;
unsigned long lastLocationTry   = 0;
int           currentFireLevel  = 0;
unsigned long lastBuzzerToggle  = 0;
bool          buzzerState       = false;

#define USE_STATIC_COORDINATES 1

#if USE_STATIC_COORDINATES
  // Koordinat presisi Taman Koin IPB Dramaga, Bogor
  float nodeLat = -6.56020;
  float nodeLon = 106.72862;
  bool  hasLocation = true;
#else
  float nodeLat = -6.56020;
  float nodeLon = 106.72862;
  bool  hasLocation = false;
#endif

bool readJsonNumber(const String& json, const char* key, float& out) {
  int at = json.indexOf(String("\"") + key + "\":");
  if (at < 0) return false;
  out = json.substring(at + strlen(key) + 3).toFloat();
  return true;
}

void autoDetectLocation() {
#if USE_STATIC_COORDINATES
  Serial.printf("[INFO] Menggunakan koordinat statis Taman Koin IPB: %.5f, %.5f\n", nodeLat, nodeLon);
  return;
#else
  lastLocationTry = millis();
  HTTPClient http;
  http.setTimeout(3000);
  http.begin("http://ip-api.com/json/?fields=status,lat,lon");
  int httpCode = http.GET();
  if (httpCode == 200) {
    String body = http.getString();
    if (body.indexOf("\"success\"") >= 0 && readJsonNumber(body, "lat", nodeLat) &&
        readJsonNumber(body, "lon", nodeLon)) {
      hasLocation = true;
      Serial.printf("[OK] Lokasi terdeteksi dari IP: %.5f, %.5f\n", nodeLat, nodeLon);
    }
  } else {
    Serial.printf("[INFO] Menggunakan koordinat default: %.5f, %.5f\n", nodeLat, nodeLon);
  }
  http.end();
#endif
}

void connectWiFi() {
  Serial.print("Menghubungkan ke Wi-Fi");
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);

  // Jika bukan Wokwi, jangan batasi ke channel 6 agar router fisik/hotspot HP terbaca
  if (strcmp(WIFI_SSID, "Wokwi-GUEST") == 0) {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);
  } else {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(300);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[OK] Wi-Fi Terhubung!");
    Serial.print("IP ESP32: ");
    Serial.println(WiFi.localIP());

    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
    Serial.println("Menyinkronkan waktu NTP...");
    struct tm timeinfo;
    if (getLocalTime(&timeinfo, 3000)) {
      Serial.println("[OK] Waktu NTP berhasil disinkronkan.");
    } else {
      Serial.println("[INFO] Waktu NTP tertunda, menggunakan format waktu cadangan.");
    }
    autoDetectLocation();
  } else {
    Serial.println("\n[WARN] Wi-Fi belum terhubung. Masuk mode OFFLINE (Sensor & Buzzer tetap aktif!).");
  }
}

String getDetailedTimestampJSON() {
  struct tm timeinfo;
  time_t now;
  time(&now);
  char datetimeStr[24];
  char isoStr[32];
  if (getLocalTime(&timeinfo, 100)) {
    strftime(datetimeStr, sizeof(datetimeStr), "%Y-%m-%d %H:%M:%S", &timeinfo);
    strftime(isoStr, sizeof(isoStr), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  } else {
    snprintf(datetimeStr, sizeof(datetimeStr), "2026-11-03 19:30:00");
    snprintf(isoStr, sizeof(isoStr), "2026-11-03T19:30:00");
  }
  char buffer[220];
  snprintf(buffer, sizeof(buffer),
           "{\"datetime\":\"%s\",\"iso8601\":\"%s%s\",\"timezone\":\"%s\",\"timezone_abbr\":\"%s\",\"utc_offset\":\"%s\",\"epoch\":%lu}",
           datetimeStr, isoStr, UTC_OFFSET_STR, TIMEZONE_NAME, TIMEZONE_ABBR, UTC_OFFSET_STR, (unsigned long)now);
  return String(buffer);
}

String computeSignature(const char* data, const char* secret) {
  byte hash[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 0);
  mbedtls_md_starts(&ctx);
  mbedtls_md_update(&ctx, (const unsigned char*)data, strlen(data));
  mbedtls_md_update(&ctx, (const unsigned char*)secret, strlen(secret));
  mbedtls_md_finish(&ctx, hash);
  mbedtls_md_free(&ctx);
  char hex[67];
  hex[0] = '0';
  hex[1] = 'x';
  for (int i = 0; i < 32; i++) {
    sprintf(&hex[2 + (i * 2)], "%02x", hash[i]);
  }
  hex[66] = '\0';
  return String(hex);
}

int computeFireLevel(float temp, bool flame, float soil) {
  if (flame || temp >= 65.0) return 3;
  if (temp >= 55.0 || (temp >= 48.0 && soil < 20.0)) return 2;
  if (temp >= 42.0 || (temp >= 35.0 && soil < 50.0)) return 1;
  return 0;
}

const char* getFireStatus(int level) {
  switch (level) {
    case 3: return "BAHAYA";
    case 2: return "SIAGA";
    case 1: return "WASPADA";
    default: return "NORMAL";
  }
}

// Suhu baseline Taman Koin IPB Dramaga, Bogor: ~26.5°C (ketinggian 250m, lembap tropis)
float simulateTemperature(float prev, bool flameActive) {
  if (flameActive) {
    float next = prev + 2.0;  // naik 2°C per sample saat api aktif
    return next > 70.0 ? 70.0 : next;
  }
  // Drift kembali ke baseline Bogor 26.5°C
  float baseline = 26.5;
  float drift = (prev > baseline + 0.5) ? -0.3 : (prev < baseline - 0.5) ? 0.3 : 0.0;
  float jitter = (random(0, 60) - 30) / 100.0;
  float next = prev + drift + jitter;
  if (next < 24.0) next = 24.0;
  if (next > 30.5) next = 30.5;
  return next;
}

// Simulasi kelembapan dinamis: invers longgar dari suhu, rentang 60–80%
float simulateHumidity(float temp) {
  float hum = 85.0 - (temp - 25.0) * 1.2;
  float jitter = (random(0, 40) - 20) / 100.0;
  hum += jitter;
  if (hum < 60.0) hum = 60.0;
  if (hum > 85.0) hum = 85.0;
  return hum;
}


void updateBuzzer(bool alarm) {
  if (!alarm) {
    if (buzzerState) {
      buzzerState = false;
      noTone(PIN_BUZZER);
      digitalWrite(PIN_BUZZER, LOW);
    }
    return;
  }
  unsigned long now = millis();
  // Beep 200ms on/off — tone() bekerja untuk buzzer pasif maupun aktif
  if (now - lastBuzzerToggle >= 200) {
    lastBuzzerToggle = now;
    buzzerState = !buzzerState;
    if (buzzerState) {
      tone(PIN_BUZZER, 2000); // 2kHz — frekuensi yang keras di buzzer kecil
    } else {
      noTone(PIN_BUZZER);
    }
  }
}

void publishTelemetry(float soilMoisture, float suhu, float kelembapan, bool currentFlame, const char* eventTag) {
  time_t epochNow;
  time(&epochNow);
  int fireLevel = computeFireLevel(suhu, currentFlame, soilMoisture);
  const char* fireStatus = getFireStatus(fireLevel);
  bool isFlameActive = currentFlame || (fireLevel == 3);
  int smoke = isFlameActive ? 500 : 25;
  int sound = isFlameActive ? 75 : 30;

  struct tm timeinfo;
  char isoStr[32];
  if (getLocalTime(&timeinfo, 100)) {
    strftime(isoStr, sizeof(isoStr), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  } else {
    snprintf(isoStr, sizeof(isoStr), "2026-11-10T12:00:00Z");
  }

  char sigData[128];
  snprintf(sigData, sizeof(sigData), "%s|%s|%d|%.1f", NODE_ID, isoStr, isFlameActive ? 1 : 0, suhu);
  String signature = computeSignature(sigData, SENSOR_SECRET);
  String timestampJSON = getDetailedTimestampJSON();

  char payload[1024];
  snprintf(payload, sizeof(payload),
           "{\"node_id\":\"%s\",\"device_id\":\"%s\",\"ts\":\"%s\",\"timestamp\":%s,"
           "\"lat\":%.5f,\"lon\":%.5f,"
           "\"fire_level\":%d,\"fire_status\":\"%s\","
           "\"soil_moisture\":%.1f,\"soil_pct\":%.1f,\"temperature\":%.1f,\"temp_c\":%.1f,"
           "\"humidity_pct\":%.1f,\"smoke\":%d,\"sound\":%d,\"flame\":%d,"
           "\"flame_detected\":%s,\"source\":\"esp\",\"sig\":\"%s\"}",
           NODE_ID, NODE_ID, isoStr, timestampJSON.c_str(),
           nodeLat, nodeLon,
           fireLevel, fireStatus,
           soilMoisture, soilMoisture, suhu, suhu,
           kelembapan, smoke, sound, isFlameActive ? 1 : 0,
           isFlameActive ? "true" : "false", signature.c_str());

  Serial.printf("[%s] %s\n", eventTag, payload);
  mqttClient.publish(MQTT_TOPIC, payload);
}

bool tryConnectMQTT() {
  Serial.print("Mencoba hubungkan MQTT...");
  mqttClient.setSocketTimeout(5);
  char sessionClientId[40];
  snprintf(sessionClientId, sizeof(sessionClientId), "%s-%04X", NODE_ID, (uint16_t)random(0xFFFF));
  if (mqttClient.connect(sessionClientId)) {
    Serial.println(" [OK] TERHUBUNG KE BROKER!");
    return true;
  } else {
    Serial.print(" Gagal, rc = ");
    Serial.println(mqttClient.state());
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[BOOT] Inisialisasi node ExcbonCP...");

  pinMode(PIN_BUZZER, OUTPUT);
  // Beep 120ms saat boot untuk memverifikasi jalur buzzer (aktif maupun pasif)
  tone(PIN_BUZZER, 2000);
  delay(120);
  noTone(PIN_BUZZER);
  digitalWrite(PIN_BUZZER, LOW);

  // DHT22 fisik rusak (korsleting) — kode tetap jalan, suhu pakai estimasi ambien
  pinMode(PIN_DHT, INPUT_PULLUP);
  dht.begin();
  pinMode(PIN_SOIL, INPUT);
  // Sensor flame DO aktif-rendah, wajib pull-up agar pin tidak mengambang
  pinMode(PIN_FLAME, INPUT_PULLUP);
  connectWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setBufferSize(1024);
}

void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED) {
    if (now - lastWiFiRetry >= 8000) {
      lastWiFiRetry = now;
      if (strcmp(WIFI_SSID, "Wokwi-GUEST") == 0) {
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 6);
      } else {
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      }
    }
  } else if (!mqttClient.connected()) {
    if (now - lastMqttRetry >= 4000) {
      lastMqttRetry = now;
      tryConnectMQTT();
    }
  } else {
    mqttClient.loop();
  }

  bool currentFlame = (digitalRead(PIN_FLAME) == LOW);
  if (currentFlame) {
    currentFireLevel = 3;
  } else if (currentFireLevel == 3 && lastTemp < 65.0) {
    currentFireLevel = computeFireLevel(lastTemp > 0 ? lastTemp : 25.0, false, lastSoilMoisture > 0 ? lastSoilMoisture : 50.0);
  }

  // Update buzzer setelah fire level terkonfirmasi dari pembacaan flame sensor
  updateBuzzer(currentFireLevel == 3);

  if (now - lastSampleTime >= 2000) {
    lastSampleTime = now;
    int rawSoil = analogRead(PIN_SOIL);
    // Sensor kapasitif/resistif fisik: ADC tinggi = kering (0%), ADC rendah = basah (100%)
    // Rentang kalibrasi default: 2800 (kering udara) – 1200 (air).
    // Jika hasil masih 0% saat di tanah basah, turunkan nilai DRY_ADC ke nilai rawSoil saat di udara.
    const int DRY_ADC = 2800;
    const int WET_ADC = 1200;
    float soilMoisture = ((float)(DRY_ADC - rawSoil) / (DRY_ADC - WET_ADC)) * 100.0;
    if (soilMoisture < 0.0)   soilMoisture = 0.0;
    if (soilMoisture > 100.0) soilMoisture = 100.0;
    float rawSuhu = dht.readTemperature();
    float rawHum  = dht.readHumidity();

    bool dhtOk = !isnan(rawSuhu) && !isnan(rawHum);
    float suhu = dhtOk ? rawSuhu : simulateTemperature(lastTemp, currentFlame);
    float hum  = dhtOk ? rawHum  : simulateHumidity(suhu);

    currentFireLevel = computeFireLevel(suhu, currentFlame, soilMoisture);

    bool soilChanged  = fabs(soilMoisture - lastSoilMoisture) >= SOIL_THRESHOLD;
    bool tempChanged  = fabs(suhu - lastTemp) >= TEMP_THRESHOLD;
    bool flameChanged = currentFlame != lastFlame;
    bool heartbeat    = (now - lastHeartbeatTime >= 60000);

    if (soilChanged || tempChanged || flameChanged || heartbeat) {
      int flamePinVal = digitalRead(PIN_FLAME);
      Serial.printf("[SENSOR] Suhu: %.1f C | Tanah: %.1f %% (ADC:%d) | Api: %s (Pin%d:%d) | Level: %d (%s) | Buzzer: %s | WiFi: %s\n",
                    suhu,
                    soilMoisture, rawSoil,
                    currentFlame ? "TERDETEKSI" : "AMAN", PIN_FLAME, flamePinVal,
                    currentFireLevel, getFireStatus(currentFireLevel),
                    (currentFireLevel == 3) ? "BUNYI" : "MATI",
                    (WiFi.status() == WL_CONNECTED) ? "ONLINE" : "OFFLINE");

      if (mqttClient.connected()) {
        publishTelemetry(soilMoisture, suhu, hum, currentFlame, "MQTT PUBLISH");
      }
      lastSoilMoisture = soilMoisture;
      lastTemp = suhu;
      lastFlame = currentFlame;
      lastHeartbeatTime = now;
    }
  }
}
