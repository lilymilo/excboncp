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

// 0: Suhu stabil 26.5 C (DHT22 fisik rusak/konslet agar tidak ada noise acak)
// 1: Baca sensor fisik DHT22 (hanya aktifkan jika modul sudah diganti sehat)
#define USE_PHYSICAL_DHT22    0

// 0: Sensor tanah tidak ditancapkan (kunci 0.0%, abaikan noise kabel)
// 1: Sensor tanah aktif fisik (otomatis 0.0% dan diam jika tidak tertancap di tanah basah)
#define USE_PHYSICAL_SOIL     1

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

float lastSoilMoisture  = 0.0;
// Bogor: rata-rata suhu udara 26-28°C, lebih sejuk dari Jakarta karena ketinggian 190-330m
float lastTemp          = 26.5;
bool  lastFlame         = false;
int   lastFireLevel     = 0;
bool  initialBootLogged = false;

const float SOIL_THRESHOLD = 5.0; // Perubahan tanah minimal 5% baru trigger update
const float TEMP_THRESHOLD = 1.0;

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
  // Level 3 (BAHAYA): Panas ekstrem kebakaran (>= 60C) atau api berkelanjutan dengan panas tinggi (>= 55C)
  if (temp >= 60.0 || (flame && temp >= 55.0)) return 3;

  // Level 2 (SIAGA): Api terus menyala dan suhu memanas (>= 42C), atau kondisi pre-fire
  if ((flame && temp >= 42.0) || temp >= 50.0 || (temp >= 45.0 && soil < 25.0)) return 2;

  // Level 1 (WASPADA): Deteksi awal nyala api atau cuaca panas terik tanah mengering
  if (flame || temp >= 38.0 || (temp >= 34.0 && soil < 45.0)) return 1;

  // Level 0 (NORMAL): Kondisi ambien normal dan aman
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

// Suhu baseline Taman Koin IPB Dramaga, Bogor: stabil di 26.5°C
// Suhu hanya berubah/naik saat ada api, dan mendingin perlahan saat api padam
float simulateTemperature(float prev, bool flameActive) {
  const float BASELINE_TEMP = 26.5;

  if (flameActive) {
    // Saat ada api, suhu naik bertahap (+3.5°C per sample) menuju suhu kebakaran (maksimal 68.0°C)
    float next = prev + 3.5;
    return next > 68.0 ? 68.0 : next;
  }

  // Saat api padam, suhu mendingin perlahan (-2.0°C per sample) kembali ke baseline 26.5°C
  if (prev > BASELINE_TEMP) {
    float next = prev - 2.0;
    return next < BASELINE_TEMP ? BASELINE_TEMP : next;
  }

  // Kondisi normal tanpa api: suhu tetap konstan di baseline (tidak berputar/cycle acak)
  return BASELINE_TEMP;
}

// Kelembapan deterministik stabil mengikuti suhu: 26.5°C -> ~83.2%
float simulateHumidity(float temp) {
  float hum = 85.0 - (temp - 25.0) * 1.2;
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
  struct tm utcInfo;
  char isoStr[32];
  // Kontrak wire memakai UTC; getLocalTime() mengembalikan jam WIB.
  if (getLocalTime(&timeinfo, 100) && gmtime_r(&epochNow, &utcInfo)) {
    strftime(isoStr, sizeof(isoStr), "%Y-%m-%dT%H:%M:%SZ", &utcInfo);
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

// Verifikasi ganda pembacaan pin flame (debounce 20ms) agar kedipan lampu ruangan tidak memicu alarm
bool isFlameConfirmed() {
  if (digitalRead(PIN_FLAME) != LOW) return false;
  delay(20);
  return (digitalRead(PIN_FLAME) == LOW);
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

  bool currentFlame = isFlameConfirmed();
  bool flameChanged = (currentFlame != lastFlame);

  // Jalankan buzzer update terus-menerus non-blocking (bunyi saat Level 3 / BAHAYA)
  updateBuzzer(currentFireLevel == 3);

  // Evaluasi tiap 2000ms ATAU seketika saat status nyala api berubah
  if ((now - lastSampleTime >= 2000) || flameChanged) {
    lastSampleTime = now;
    float soilMoisture = 0.0;
    int rawSoil = 2800;

#if USE_PHYSICAL_SOIL
    // Averaging 8x pembacaan ADC untuk meredam jitter noise bawaan ESP32
    long sumSoil = 0;
    for (int i = 0; i < 8; i++) {
      sumSoil += analogRead(PIN_SOIL);
      delay(2);
    }
    rawSoil = (int)(sumSoil / 8);

    // Jika sensor di udara bebas / belum ditancapkan ke tanah basah (ADC >= 2500),
    // kunci kelembapan di 0.0% agar tidak ada fluktuasi acak yang memicu loop output.
    const int AIR_THRESHOLD_ADC = 2500;
    const int WET_ADC           = 1200;

    if (rawSoil < AIR_THRESHOLD_ADC && rawSoil > 200) {
      soilMoisture = ((float)(AIR_THRESHOLD_ADC - rawSoil) / (AIR_THRESHOLD_ADC - WET_ADC)) * 100.0;
      if (soilMoisture > 100.0) soilMoisture = 100.0;
    } else {
      soilMoisture = 0.0; // Tidak ditancapkan: tetap 0.0%
    }
#endif

#if USE_PHYSICAL_DHT22
    float rawSuhu = dht.readTemperature();
    float rawHum  = dht.readHumidity();
    bool dhtOk = !isnan(rawSuhu) && !isnan(rawHum);
    float suhu = dhtOk ? rawSuhu : simulateTemperature(lastTemp, currentFlame);
    float hum  = dhtOk ? rawHum  : simulateHumidity(suhu);
#else
    // DHT22 fisik rusak/konslet: langsung pakai suhu stabil tanpa membaca pin yang glitch
    float suhu = simulateTemperature(lastTemp, currentFlame);
    float hum  = simulateHumidity(suhu);
#endif

    currentFireLevel = computeFireLevel(suhu, currentFlame, soilMoisture);
    updateBuzzer(currentFireLevel == 3);

    bool soilChanged  = fabs(soilMoisture - lastSoilMoisture) >= SOIL_THRESHOLD;
    bool tempChanged  = fabs(suhu - lastTemp) >= TEMP_THRESHOLD;
    bool levelChanged = (currentFireLevel != lastFireLevel);
    bool heartbeat    = (now - lastHeartbeatTime >= 60000);

    if (!initialBootLogged || soilChanged || tempChanged || flameChanged || levelChanged || heartbeat) {
      initialBootLogged = true;
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
      lastFireLevel = currentFireLevel;
      lastHeartbeatTime = now;
    }
  }
}
