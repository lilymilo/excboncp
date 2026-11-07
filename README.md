# CbonCP — IoT Node & DevOps CI/CD

Branch ini (`feat/IoT-node`) berisi konfigurasi dan implementasi lengkap modul **IoT Node** untuk sistem dMRV CbonCP, mencakup firmware ESP32, MQTT broker (Mosquitto), IoT Telemetry Gateway, kontainerisasi Docker, serta pipeline DevOps CI/CD berbasis GitHub Actions.

---

## 🏗 Arsitektur Sistem

```
[ ESP32 Hardware / Wokwi Simulator ]
                │
         (Wi-Fi / TCP 1883)
                ▼
   [ Mosquitto MQTT Broker ] ◄─── (Port 9001: WebSockets)
                │
         (Internal Docker Net)
                ▼
  [ IoT Node Gateway & Ingest ] ───► HTTP API / Healthcheck (Port 5050)
                │
                └─► Canonical Attestation Schema (shared-schemas/)
```

### Komponen:
1. **ESP32 Firmware (`iot-node/sketch.ino`)**:
   - Mendukung mode **Hardware Fisik** dan mode **Simulasi Wokwi**.
   - Pembacaan sensor DHT22 (Suhu), Soil Moisture (Analog GPIO 34), dan Flame Detector (Active LOW GPIO 13).
   - Sinkronisasi waktu presisi via NTP (WIB / Asia/Jakarta UTC+7).
   - Mengirimkan event telemetri real-time melalui MQTT topic `CbonCP/node-1/telemetry`.
2. **Mosquitto MQTT Broker (`mosquitto/`)**:
   - Port 1883 (Standard MQTT TCP) untuk perangkat IoT.
   - Port 9001 (MQTT over WebSockets) untuk dashboard web.
3. **IoT Gateway Service (`iot-node/src/`)**:
   - Microservice Node.js ringan (Alpine Linux) untuk menangani pesan telemetri.
   - Validasi payload dan konversi ke skema kanonikal attestation payload (`toCanonicalIoTLayer()`).
   - Perhitungan tanda tangan SHA-256 untuk integritas data.
   - Endpoint HTTP `/health` dan `/api/telemetry`.
   - Built-in simulator mode untuk CI/CD dan local testing tanpa hardware fisik.

---

## 🔌 Pinout ESP32 (Hardware & Wokwi)

| Komponen / Sensor | Pin ESP32 | Keterangan |
| :--- | :--- | :--- |
| **DHT22** (Suhu) | GPIO 15 | Digital Data Sensor Suhu & Kelembaban |
| **Soil Moisture** | GPIO 34 | ADC Input (Potensiometer simulasi kelembaban tanah) |
| **Flame Detector** | GPIO 13 | Digital Input Active LOW (Pushbutton alarm api) |
| **VCC Sensor** | 3V3 | Catu daya logika |
| **GND** | GND | Ground bersama |

---

## 🐳 Menjalankan dengan Docker & Docker Compose

### 1. Salin Konfigurasi Environment
```bash
cp .env.example .env
```

### 2. Jalankan Stack Kontainer
```bash
docker compose up -d --build
```

### 3. Memeriksa Status Kontainer & Healthcheck
```bash
docker compose ps
```

### 4. Uji Endpoint Healthcheck & Telemetri
- **Healthcheck:**
  ```bash
  curl http://localhost:5050/health
  ```
- **Data Telemetri Terbaru:**
  ```bash
  curl http://localhost:5050/api/telemetry
  ```
- **Simulasikan Injeksi Telemetri (Manual):**
  ```bash
  curl -X POST http://localhost:5050/api/telemetry/simulate
  ```

---

## 🧪 Pengujian Unit & Skema Lokal

Jalankan test suite menggunakan Node.js test runner bawaan:

```bash
cd iot-node
npm test
```

Hasil verifikasi:
```text
✔ should successfully validate valid JSON string payload
✔ should successfully validate valid Buffer payload
✔ should reject malformed JSON
✔ should reject payload missing required fields
✔ should compute deterministic SHA-256 signature with 0x prefix
✔ should project into Canonical IoT Layer matching attestation schema
```

---

## 🚀 DevOps CI/CD Pipeline (`ci/iot-ci-cd.yml`)

Pipeline GitHub Actions otomatis berjalan pada setiap `push` dan `pull_request` ke branch `feat/IoT-node`:

1. **Verify ESP32 Firmware & Diagrams**:
   - Memastikan kelengkapan berkas firmware (`sketch.ino`), library Wokwi (`libraries.txt`), skema diagram (`diagram.json`), dan skema payload.
   - Validasi sintaks JSON.
2. **IoT Gateway Unit Tests & Schema Check**:
   - Menjalankan linter kode gateway.
   - Menjalankan unit test validasi telemetri & kanonikal attestation.
3. **Docker Build & Compose Integration Test**:
   - Memvalidasi sintaks `docker-compose.yml`.
   - Membangun image Docker `iot-node` secara multi-stage.
   - Menjalankan seluruh stack kontainer (`SIMULATION_MODE=true`).
   - Memeriksa kesiapan healthcheck `/health` dan smoke test pengiriman pesan telemetri MQTT.
   - Melakukan teardown otomatis yang bersih.

