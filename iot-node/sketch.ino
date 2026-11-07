#include <WiFi.h>
#include <PubSubClient.h>
#include <DHTesp.h>
#include <time.h>

#define PIN_DHT    15
#define PIN_SOIL   34
#define PIN_FLAME  13

// 1: physical ESP32 on LAN, 0: Wokwi cloud simulation.
#define USE_PHYSICAL_HARDWARE 1

#if USE_PHYSICAL_HARDWARE
  const char* WIFI_SSID     = "GANTI_DENGAN_SSID_WIFI_ANDA";
  const char* WIFI_PASSWORD = "GANTI_DENGAN_PASSWORD_WIFI_ANDA";
  const char* MQTT_BROKER   = "192.168.0.130";
  const char* NODE_ID       = "ESP32-PHYSICAL-NODE-01";
#else
  const char* WIFI_SSID     = "Wokwi-GUEST";
  const char* WIFI_PASSWORD = "";
  const char* MQTT_BROKER   = "broker.emqx.io";
  const char* NODE_ID       = "ESP32-WOKWI-NODE-01";
#endif

const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "CbonCP/node-1/telemetry";

const char* NTP_SERVER          = "pool.ntp.org";
const long  GMT_OFFSET_SEC       = 25200; // UTC+7 (WIB)
const int   DAYLIGHT_OFFSET_SEC   = 0;
const char* TIMEZONE_NAME       = "Asia/Jakarta";
const char* TIMEZONE_ABBR       = "WIB";
const char* UTC_OFFSET_STR      = "+07:00";

WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHTesp dhtSensor;

float lastSoilMoisture = -999.0;
float lastTemp         = -999.0;
bool  lastFlame        = false;

const float SOIL_THRESHOLD = 1.0;
const float TEMP_THRESHOLD = 0.5;

unsigned long lastSampleTime    = 0;
unsigned long lastHeartbeatTime = 0;
unsigned long lastMqttRetry     = 0;

void connectWiFi() {
  Serial.print("Menghubungkan ke Wi-Fi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }

  Serial.println("\n[OK] Wi-Fi Terhubung!");
  Serial.print("IP ESP32: ");
  Serial.println(WiFi.localIP());

  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  Serial.println("Menyinkronkan waktu NTP...");
  struct tm timeinfo;
  if (getLocalTime(&timeinfo, 5000)) {
    Serial.println("[OK] Waktu NTP berhasil disinkronkan.");
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
    // Fallback if NTP sync is still pending.
    snprintf(datetimeStr, sizeof(datetimeStr), "2026-11-03 19:30:00");
    snprintf(isoStr, sizeof(isoStr), "2026-11-03T19:30:00");
  }

  char buffer[220];
  snprintf(buffer, sizeof(buffer),
           "{\"datetime\":\"%s\",\"iso8601\":\"%s%s\",\"timezone\":\"%s\",\"timezone_abbr\":\"%s\",\"utc_offset\":\"%s\",\"epoch\":%lu}",
           datetimeStr, isoStr, UTC_OFFSET_STR, TIMEZONE_NAME, TIMEZONE_ABBR, UTC_OFFSET_STR, (unsigned long)now);

  return String(buffer);
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
  delay(200);

  dhtSensor.setup(PIN_DHT, DHTesp::DHT22);
  pinMode(PIN_SOIL, INPUT);
  pinMode(PIN_FLAME, INPUT_PULLUP);

  connectWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setBufferSize(512); // Buffer sized for full JSON telemetry.
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - lastMqttRetry >= 4000) {
      lastMqttRetry = now;
      tryConnectMQTT();
    }
  } else {
    mqttClient.loop();
  }

  bool currentFlame = (digitalRead(PIN_FLAME) == LOW);

  if (currentFlame != lastFlame && mqttClient.connected()) {
    int rawSoil = analogRead(PIN_SOIL);
    float soilMoisture = (rawSoil / 4095.0) * 100.0;
    
    TempAndHumidity dhtData = dhtSensor.getTempAndHumidity();
    float suhu = isnan(dhtData.temperature) ? lastTemp : dhtData.temperature;

    String timestampJSON = getDetailedTimestampJSON();

    char payload[450];
    snprintf(payload, sizeof(payload),
             "{\"node_id\":\"%s\",\"timestamp\":%s,\"soil_moisture\":%.1f,\"temperature\":%.1f,\"flame_detected\":%s}",
             NODE_ID, timestampJSON.c_str(), soilMoisture, suhu, currentFlame ? "true" : "false");

    Serial.print("[FLAME STATE EVENT] ");
    Serial.println(payload);
    mqttClient.publish(MQTT_TOPIC, payload);

    lastFlame = currentFlame;
    lastSoilMoisture = soilMoisture;
    lastTemp = suhu;
  }

  unsigned long now = millis();
  if (now - lastSampleTime >= 1000) {
    lastSampleTime = now;

    int rawSoil = analogRead(PIN_SOIL);
    float soilMoisture = (rawSoil / 4095.0) * 100.0;

    TempAndHumidity dhtData = dhtSensor.getTempAndHumidity();
    float suhu = dhtData.temperature;

    if (!isnan(suhu)) {
      bool soilChanged = fabs(soilMoisture - lastSoilMoisture) >= SOIL_THRESHOLD;
      bool tempChanged = fabs(suhu - lastTemp) >= TEMP_THRESHOLD;
      bool heartbeat   = (now - lastHeartbeatTime >= 60000);

      if ((soilChanged || tempChanged || heartbeat) && mqttClient.connected()) {
        String timestampJSON = getDetailedTimestampJSON();

        char payload[450];
        snprintf(payload, sizeof(payload),
                 "{\"node_id\":\"%s\",\"timestamp\":%s,\"soil_moisture\":%.1f,\"temperature\":%.1f,\"flame_detected\":%s}",
                 NODE_ID, timestampJSON.c_str(), soilMoisture, suhu, currentFlame ? "true" : "false");

        Serial.print("[MQTT PUBLISH] ");
        Serial.println(payload);
        mqttClient.publish(MQTT_TOPIC, payload);

        lastSoilMoisture = soilMoisture;
        lastTemp = suhu;
        lastHeartbeatTime = now;
      }
    }
  }
}
