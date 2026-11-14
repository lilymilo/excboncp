# Day Breakdown & Roadmap Pengembangan

Jadwal kerja, pembagian tugas harian, dan pencapaian implementasi ExcbonCP.

---

## 1. Timeline Implementasi Harian

| Hari | Penanggung Jawab | Modul / Fitur Utama | Status |
| :--- | :--- | :--- | :--- |
| **Day 1** | Revand | MRV Schema + Seed data, inisialisasi Central Engineering Server & API | Selesai |
| **Day 2** | Revand | Rantai hash SHA-256 (Ledger Engine) + verifikasi publik (`GET /verify/{id}`) | Selesai |
| **Day 3** | Revand | Integrasi Ethereum Attestation Service (EAS) pada Base Sepolia (R7) | Selesai |
| **Day 4** | Revand | Kontrak pintar EAS Sepolia, registrasi skema on-chain, whitelist auditor | Selesai |
| **Day 5** | Bagus | Firmware ESP32 (DHT22, Soil Moisture, Flame Sensor) + telemetri MQTT | Selesai |
| **Day 6** | Bagus | Integrasi broker MQTT + validasi ingestion data sensor | Selesai |

Untuk matriks penelusuran kebutuhan lengkap (R1–R29), silakan baca [requirements-traceability.md](requirements-traceability.md).

---

## 2. Pembagian Peran Tim

* **Revand:** Architecture, Smart Contracts, Base Sepolia EAS Attestation, API Server.
* **Bagus:** IoT Node Firmware, MQTT Telemetry, Sensor Processing, Carbon Economy Simulation.
* **Davin:** Status Engine, Satellite NDVI Data Integration, Anomaly Detection AI.
* **Malik:** Frontend Next.js DApp, Map Visualizations, UI/UX Design System, Presentations.
