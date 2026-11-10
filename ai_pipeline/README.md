# AI & Earth Engine (GEE) Data Pipeline

Modul backend AI Pipeline untuk proyek **exboncp**.
Sistem melakukan *subscription* real-time ke MQTT broker untuk memantau data telemetri sensor ESP32 (suhu, kelembapan tanah, status api). Jika terdeteksi anomali suhu (`> 30.0°C`) atau api (`flame_detected: true`), backend otomatis memicu pemanggilan Google Earth Engine (GEE) menggunakan Service Account untuk memverifikasi citra satelit wilayah yang dipantau (Sentinel-2 L2A).

---

## Struktur Modul

```text
ai_pipeline/
├── __init__.py           # Package exports
├── mqtt_subscriber.py    # MQTT client & AI conditional anomaly detection
├── gee_processor.py      # Integrasi Google Earth Engine (Service Account)
├── mock_publisher.py     # Simulator pengujian ESP32 publisher (normal & anomaly)
├── test_pipeline.py      # Automated unit test suite
├── requirements.txt      # Python dependencies
├── service_account.json  # Template kredensial GEE cboncp
├── .env.example          # Template konfigurasi environment
└── README.md             # Dokumentasi setup & eksekusi
```

---

## Panduan Penggunaan & Eksekusi

### 1. Persiapan Virtual Environment & Dependencies
Pastikan Python 3.10+ telah terinstal:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r ai_pipeline/requirements.txt
```

### 2. Konfigurasi Environment (`.env`)
Salin file template `.env.example` menjadi `.env`:
```powershell
cp ai_pipeline/.env.example ai_pipeline/.env
```
Sesuaikan parameter broker MQTT dan GEE:
- `MQTT_BROKER_HOST`: Host broker (misal: `localhost` atau IP broker Mosquitto).
- `MQTT_BROKER_PORT`: Port broker (default `1883`).
- `MQTT_TELEMETRY_TOPIC`: Default `CbonCP/node-1/telemetry`.
- `TEMP_ANOMALY_THRESHOLD`: Ambang batas suhu anomali (default `30.0`).
- `DEFAULT_MONITOR_LAT`: Latitude koordinat stasiun monitoring (default `-6.5971`).
- `DEFAULT_MONITOR_LON`: Longitude koordinat stasiun monitoring (default `106.7994`).

### 3. Kredensial Google Earth Engine
1. Dapatkan file JSON Service Account dari Google Cloud Console pada project `cboncp`.
2. Letakkan file tersebut di `ai_pipeline/service_account.json` (atau tentukan path custom melalui `GEE_SERVICE_ACCOUNT_KEY_PATH` di `.env`).
> Catatan: Jika file kredensial masih berisi placeholder atau belum dihubungkan, sistem secara otomatis berjalan dalam mode *simulation mock* sehingga seluruh pengujian lokal/CI dapat dijalankan tanpa crash.

### 4. Menjalankan Unit Test
Jalankan test suite untuk memvalidasi seluruh fungsi parsing dan logika anomali:
```powershell
python -m unittest discover -s ai_pipeline -p "test_*.py" -v
```

### 5. Menjalankan MQTT Subscriber
Jalankan subscriber utama:
```powershell
python -m ai_pipeline.mqtt_subscriber
```

### 6. Simulasi Pengujian ESP32 (Mock Publisher)
Untuk menguji pengiriman data telemetri di terminal terpisah:
- **Kondisi Normal (Suhu 27.4°C, Api False):**
  ```powershell
  python -m ai_pipeline.mock_publisher --mode normal
  ```
- **Kondisi Anomali Suhu Tinggi (Suhu 34.8°C):**
  ```powershell
  python -m ai_pipeline.mock_publisher --mode high_temp
  ```
- **Kondisi Anomali Kebakaran (Api True, Suhu 41.5°C):**
  ```powershell
  python -m ai_pipeline.mock_publisher --mode fire
  ```
- **Mode Streaming (Kirim terus menerus setiap 3 detik):**
  ```powershell
  python -m ai_pipeline.mock_publisher --mode normal --stream --interval 3.0
  ```

