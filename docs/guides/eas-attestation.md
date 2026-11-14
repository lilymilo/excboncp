# Panduan Integrasi EAS Attestation (Base Sepolia)

Dokumen ini menjelaskan cara kerja dan pengujian lapisan **Ethereum Attestation Service (EAS)** pada Base Sepolia di ExcbonCP.

---

## 1. Konsep & Mode Simulasi

Lapisan EAS menautkan (*anchor*) ringkasan hash SHA-256 dari buku catatan lokal (*ledger blocks*) ke jaringan blockchain Base Sepolia secara *on-chain*.

Secara bawaan, server berjalan dalam **mode simulasi** (`EVM_SIMULATION_MODE=true` pada `.env`). Dalam mode ini:
* Hash dan UID attestation disimpan secara lokal tanpa mengirim transaksi riil ke blockchain.
* Pengujian dan demo dapat dijalankan sepenuhnya tanpa membutuhkan saldo Sepolia ETH atau *private key* aktif.
* Jika `EVM_PRIVATE_KEY` kosong atau tidak valid, sistem secara aman mempertahankan mode simulasi agar server tidak *crash*.

---

## 2. Pengujian di Mode Simulasi (Default)

Jalankan server lokal:
```bash
./scripts/start-server.sh --mode local
```

Gunakan endpoint berikut untuk menguji alur atestasi (memerlukan token peran `auditor`):

```bash
# 1. Registrasi schema EAS (khusus auditor)
curl -X POST http://localhost:8000/blockchain/register-schema \
  -H "Authorization: Bearer <auditor-token>"

# 2. Pasang segel atestasi blok ledger ke Base Sepolia
curl -X POST "http://localhost:8000/blockchain/attest/1" \
  -H "Authorization: Bearer <auditor-token>"

# 3. Cek status atestasi blok tertentu
curl http://localhost:8000/blockchain/status/1 \
  -H "Authorization: Bearer <user-token>"

# 4. Daftar seluruh blok yang teratestasi
curl http://localhost:8000/blockchain/attestations \
  -H "Authorization: Bearer <user-token>"
```

Jalankan pengujian unit dan integrasi blockchain:
```bash
pytest tests/blockchain/ -v
```

---

## 3. Menjalankan di Base Sepolia Testnet (Live)

Untuk mengaktifkan transaksi *live* on-chain ke Base Sepolia:

1. Siapkan wallet Ethereum (misal MetaMask) dan dapatkan testnet Sepolia ETH (melalui [Base Sepolia Faucet](https://sepoliafaucet.com) atau [Superchain Faucet](https://console.optimism.io/faucet)).
2. Salin `.env.example` ke `.env` dan perbarui parameter berikut:
   ```env
   EVM_PRIVATE_KEY=0x<private_key_64_karakter_hex>
   EVM_RPC_URL=https://sepolia.base.org
   EVM_CHAIN_ID=84532
   EVM_SIMULATION_MODE=false
   ```
3. Kontrak pintar EAS yang digunakan pada Base Sepolia:
   - **EAS Registry:** `0x4200000000000000000000000000000000000020`
   - **EAS Contract:** `0x4200000000000000000000000000000000000021`
   - **Schema UID:** `0x64e443d45df4a77a844017cbf7c08d315f93f55dce247c083ebfa75686e37996`
