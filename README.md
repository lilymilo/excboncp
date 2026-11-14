# ExcbonCP — Decentralized MRV Forest Carbon Credit System

[![CI](https://github.com/lilymilo/excboncp/actions/workflows/ci.yml/badge.svg)](https://github.com/lilymilo/excboncp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

**ExcbonCP** adalah sistem *Decentralized Monitoring, Reporting, and Verification (MRV)* untuk kredit karbon hutan. Platform ini mengintegrasikan sensor telemetri IoT (ESP32), citra satelit (Google Earth Engine), rantai hash SHA-256 yang teratestasi di blockchain **Base Sepolia (EAS)**, dan deteksi anomali berbasis AI untuk menghadirkan ekosistem kredit karbon yang transparan, terverifikasi, dan anti-tamper.

---

## Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    IoT Layer    │──────▶│ Backend Service │──────▶│   Blockchain    │
│ ESP32 + MQTT    │       │ FastAPI + SQLite│       │  Base Sepolia   │
│ (DHT22/Soil/GPS)│       │ (Status Engine) │       │ (EAS Attestation)
└─────────────────┘       └────────┬────────┘       └─────────────────┘
                                   │
                           ┌───────┴────────┐
                           │    AI / ML     │
                           │ Anomaly Det. + │
                           │ Satellite NDVI │
                           └───────┬────────┘
                                   │
                           ┌───────┴────────┐
                           │ Frontend DApp  │
                           │ Next.js + Maps │
                           │ (Soft Botanical)│
                           └────────────────┘
```

---

## Tech Stack

| Layer | Komponen & Teknologi | Fungsi Utama |
| :--- | :--- | :--- |
| **IoT & Telemetri** | ESP32, C++, MQTT (EMQX / Mosquitto), PlatformIO | Akuisisi data mikroklimat (suhu, kelembapan, kelembapan tanah, api) |
| **Backend API** | Python 3.12, FastAPI, SQLite, Pydantic | Ingestion sensor, mesin status MRV, perhitungan kredit CO2e, JWT auth |
| **Blockchain** | Base Sepolia, Ethereum Attestation Service (EAS), SHA-256 | Segel atestasi on-chain anti-pemalsuan dan rantai integritas audit |
| **Data & AI** | Google Earth Engine (GEE), Scikit-learn, Sentinel-2 | Analisis tutupan kanopi (NDVI/SAR) dan deteksi anomali data lapangan |
| **Frontend DApp** | Next.js 15, React 19, Tailwind CSS, Leaflet, Radix UI | Dashboard pemantauan, peta interaktif, simulasi pasar, inspeksi audit |

---

## Quick Start

Jalankan seluruh lingkungan pengembangan (Backend API, broker MQTT, dan Frontend DApp) dengan satu perintah:

```bash
./scripts/dev.sh
```

Aplikasi dapat langsung diakses melalui:
* **Frontend DApp:** [http://localhost:3000](http://localhost:3000)
* **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

> **Prasyarat:** Pastikan Docker, Docker Compose, Python 3.12+, dan Node.js 18+ sudah terpasang. Tekan `Ctrl+C` untuk menghentikan frontend dan jalankan `docker compose down` untuk mematikan layanan backend.

---

## Project Structure

```
excboncp/
├── ai_pipeline/         # Pipeline analisis citra satelit (GEE) & model deteksi anomali
├── api/                 # Modul logika bisnis inti, mesin status, & kalkulasi ekonomi
├── contracts/           # Smart contract Solidity & konfigurasi skema EAS Base Sepolia
├── docker/              # Dockerfile dan konfigurasi multi-service container
├── docs/                # Dokumentasi arsitektur, diagram sistem, dan panduan teknis
├── iot-node/            # Firmware sketch ESP32 & konfigurasi pinout sensor telemetri
├── mosquitto/           # Konfigurasi lokal broker pesan MQTT
├── public/              # Aset statis global, maskot, dan visual ilustrasi
├── scripts/             # Skrip otomasi pengujian, seed data demo, dan deploy
├── server/              # Entrypoint server FastAPI, router REST, dan manajemen sesi
├── src/                 # Aplikasi Frontend DApp (Next.js 15 App Router)
└── tests/               # Pengujian menyeluruh (backend unit/integration, IoT, frontend)
```

---

## Documentation

Dokumentasi teknis lengkap tersedia di direktori [`docs/`](docs/):

* [Dokumentasi Lengkap (Index)](docs/INDEX.md)
* [Panduan Integrasi EAS Attestation Base Sepolia](docs/guides/eas-attestation.md)
* [Panduan Pengembang Windows (PowerShell)](docs/guides/windows-setup.md)
* [Timeline Harian & Pembagian Tim](docs/day-breakdown.md)
* [Spesifikasi REST API](docs/api-reference.md)
* [Skema Basis Data SQLite](docs/database-schema.md)
* [Arsitektur Sistem Menyeluruh](docs/architecture/OVERVIEW.md)

---

## License

Didistribusikan di bawah lisensi MIT. Lihat berkas [LICENSE](LICENSE) untuk informasi lebih lanjut.
