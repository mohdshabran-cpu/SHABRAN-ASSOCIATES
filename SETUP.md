# Panduan Pemasangan — Website Shabran Associates

Sistem lengkap: tempahan konsultasi (RM250) + bayaran DuitNow QR + resit automatik + notifikasi email + panel pentadbir. Semua percuma.

---

## Bahagian 1 — Sambungkan Backend (penting untuk email & database)

Backend menggunakan **Google Apps Script** — percuma, data disimpan dalam Google Sheet milik Tuan sendiri, dan semua email dihantar dari Gmail Tuan sendiri.

1. Buka <https://script.google.com> (log masuk dengan **mohdshabran@gmail.com**)
2. Klik **New Project** (projek baru)
3. Padam semua kod sedia ada, kemudian **tampal keseluruhan isi fail `backend.gs`** dari folder ini
4. **Ubah kata laluan admin** (penting!):
   - Di dalam kod, cari baris: `ADMIN_PASSWORD: "shabran2026"`
   - Tukar kepada kata laluan peribadi Tuan, contoh: `ADMIN_PASSWORD: "shabran2026@sahaja"`
5. Klik **Save** (ikon disket)
6. Klik **Deploy > New deployment**:
   - Pilih jenis: **Web app**
   - **Execute as**: `Me (mohdshabran@gmail.com)`
   - **Who has access**: `Anyone`
   - Klik **Deploy**
7. Kali pertama, Google akan minta kebenaran akses:
   - Pilih akaun mohdshabran@gmail.com
   - Klik **Advanced > Go to ... (unsafe)** > **Allow**
   - (Ini selamat — ia aplikasi Tuan sendiri)
8. Setelah selesai, akan dipaparkan **URL Web app** (bermula dengan `https://script.google.com/macros/s/...`)
9. **Salin URL tersebut** dan buka fail `js/config.js`:
   ```
   scriptUrl: "https://script.google.com/macros/s/REPLACE_WITH_YOUR_URL/exec"
   ```
   Gantikan `REPLACE_WITH_YOUR_URL` dengan URL tadi.

> **Ujian:** buka `booking.html`, pilih tarikh — jika kalendar memaparkan hari biasa (Isnin-Jumaat), sambungan berjaya.

---

## Bahagian 2 — Hosting Percuma (GitHub Pages)

1. Daftar akaun percuma di <https://github.com>
2. Buat repositori baru: nama contoh `shabran-associates` (tanda **Public**)
3. Upload **semua fail** dalam folder ini ke repositori (klik *Add file > Upload files*, seret semua folder & fail)
4. Buka **Settings > Pages**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / folder `/ (root)`
   - Klik **Save**
5. Tunggu 1-2 minit. Website Tuan akan berterusan di:
   `https://<username>.github.io/shabran-associates/`

Contoh: `https://mohdshabran.github.io/shabran-associates/`

> **Domain percuma:** Tuan boleh daftar domain seperti `.my`, `.com`, `.net` (berbayar) dan sambungkan ke GitHub Pages pada bila-bila masa.

---

## Bahagian 3 — Gambar (foto & QR code)

| Gambar | Fail | Kegunaan |
|---|---|---|
| Foto Tuan | `images/lawyer.jpg` | Laman utama + bahagian Tentang |
| QR DuitNow | `images/qr.png` | Halaman bayaran |

**Cara 1 (disyorkan):** Gantikan fail `images/lawyer.jpg` dan `images/qr.png` dengan gambar Tuan sendiri (pastikan nama fail sama).

**Cara 2:** Log masuk ke Panel Pentadbir (`admin.html`) > **Tetapan** > muat naik gambar. (Disimpan dalam pelayar Tuan sahaja — cara 1 lebih kekal untuk semua pengunjung.)

---

## Bahagian 4 — Cara Guna Sistem

### Klien (pengunjung website)
1. Klik **Tempah Konsultasi**
2. Isi maklumat → pilih tarikh & masa
3. Imbas QR → bayar **RM250.00** → isi rujukan transaksi
4. Resit **dijana automatik** (boleh cetak / simpan PDF)
5. Semak status di halaman **Semak Status** (guna nombor rujukan)

### Tuan (pentadbir)
1. Buka `<alamat-website>/admin.html`
2. Log masuk dengan kata laluan admin (dari Bahagian 1)
3. **Dashboard** — statistik tempahan
4. **Tempahan** — lihat semua tempahan; klik:
   - **Sahkan** → klien dimaklumkan melalui email automatik + status bertukar
   - **Tolak** → masukkan sebab, klien dimaklumkan
5. **Tarikh Cuti** — tutup tarikh tertentu (cuti umum dll.)

### Notifikasi email (automatik)
- Tempahan baru → dihantar ke **mohdshabran@gmail.com**
- Tuan sahkan/tolak → **klien** dimaklumkan melalui email
- Semua email dihantar dari akaun Gmail Tuan sendiri (had percuma 100 email/hari)

---

## Maklumat yang perlu dikemaskini

Buka `js/config.js` dan ubah:

| Item | Baris |
|---|---|
| Nombor telefon & WhatsApp | `phone` / `whatsapp` |
| Kata laluan admin | `adminPassword` (padankan dengan backend) |
| URL backend | `scriptUrl` |

---

## Penyelesaian Masalah

| Masalah | Penyelesaian |
|---|---|
| "Backend belum disambung" | Pastikan `scriptUrl` dalam `js/config.js` ditampal URL Apps Script |
| Halaman kalendar kosong | Periksa bahawa Apps Script telah **Deploy** (versi baru) dan kebenaran **Allow** diberikan |
| Email tidak sampai | Semak folder spam; pastikan Apps Script berjalan sebagai akaun Tuan |
| Slot "sudah ditempah" | Semula jadi — slot hanya satu tempahan; pilih masa lain |
| Selepas ubah kod backend | Klik **Deploy > Manage deployments > Edit > Version: New version** |

---

## Struktur Fail

```
shabran-associates/
├── index.html        # Laman utama
├── booking.html      # Tempahan konsultasi (4 langkah)
├── receipt.html      # Resit rasmi (auto)
├── status.html       # Semak status tempahan
├── admin.html        # Panel pentadbir
├── css/style.css     # Reka bentuk
├── js/               # Logik sistem
├── images/           # Gambar (foto, QR, logo)
└── backend.gs        # Backend Apps Script (email + database)
```
