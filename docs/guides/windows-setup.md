# Panduan Setup Pengembang Windows (PowerShell)

Panduan ini ditujukan bagi pengembang yang menggunakan sistem operasi Windows tanpa lingkungan bash/WSL secara langsung.

---

## 1. Menjalankan Skrip Helper Day 1

Proyek ini menyediakan skrip otomasi PowerShell di direktori `scripts\windows\day1.ps1`.

### Langkah Setup & Eksekusi:

```powershell
# 1. Menyiapkan virtual environment (.venv), dependensi Python, file .env, dan folder data
.\scripts\windows\day1.ps1 setup

# 2. Menjalankan linter Ruff dan pengujian pytest
.\scripts\windows\day1.ps1 test

# 3. Memuat data simulasi MRV demo (diminta menginputkan password demo)
.\scripts\windows\day1.ps1 seed

# 4. Menjalankan backend server FastAPI secara lokal
.\scripts\windows\day1.ps1 serve
```

---

## 2. Mengatasi Kendala Kebijakan Eksekusi (ExecutionPolicy)

Jika PowerShell memblokir eksekusi skrip lokal (`ExecutionPolicy Restricted`), Anda dapat menggunakan wrapper batch CMD:

```cmd
.\scripts\windows\day1.cmd setup
```

Atau memberikan izin eksekusi sesi saat ini:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\windows\day1.ps1 setup
```

---

## 3. Perintah Bantuan & Diagnostik Tambahan

Jalankan perintah help untuk melihat seluruh aksi yang didukung:
```powershell
.\scripts\windows\day1.ps1 help
```

Aksi yang tersedia meliputi:
- `health`: Memeriksa kesehatan endpoint API server lokal.
- `docker`: Menjalankan layanan backend melalui Docker Compose.
- `status`: Memeriksa status proses dan berkas konfigurasi.
