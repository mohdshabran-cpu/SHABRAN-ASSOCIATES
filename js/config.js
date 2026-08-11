/* ============================================================
   SHABRAN ASSOCIATES - Konfigurasi Utama Sistem
   Sila ubah maklumat di bawah mengikut keperluan firma.
   ============================================================ */

const CONFIG = {
  /* ---------- Maklumat Firma ---------- */
  firmName: "Shabran Associates",
  firmInitials: "SA",
  lawyerName: "Mohd Shabran Syahmi bin Takhta",
  lawyerTitle: "Peguam Syarie",
  tagline: "Bimbingan Syariah yang Telus, Amanah & Profesional",
  address: "No. 2, Simpang 3, Lorong Bulud, Kg Likas, 89450 Kota Kinabalu, Sabah",
  email: "mohdshabran@gmail.com",
  phone: "012-8199296",
  whatsapp: "60128199296",
  hours: "Isnin – Jumaat: 9.00 pagi – 5.00 petang<br>Sabtu & Ahad: Tutup (dengan temujanji)",
  established: 2017,

  /* ---------- Bayaran Konsultasi ---------- */
  fee: 250,
  feeText: "RM250.00",
  feeDesc: "Konsultasi Syarie – 1 sesi (45 minit)",

  /* ---------- Tempahan ---------- */
  timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  closedDays: [0],               /* 0 = Ahad (hari cuti) */
  maxMonthAdvance: 3,            /* tempahan hadapan sehingga 3 bulan */
  consultationDuration: 45,

  /* ---------- Backend (Google Apps Script) ----------
     SELEPAS deploy Apps Script, tampal URL di sini.
     Contoh: "https://script.google.com/macros/s/ABCDEFGHIJKLMNOPQRSTUVWXYZ/exec" */
  scriptUrl: "https://script.google.com/macros/s/AKfycbxDm341fu91ZX6FX7Qdyq8ktmT8LKWpHYJhnAlhS7Cw-1IohTgVfr2pc4jpeNnjKAOVvg/exec",

  /* ---------- Penyimpanan (localStorage keys) ---------- */
  storage: {
    qr: "sha_custom_qr",         /* gambar QR DuitNow milik firma */
    photo: "sha_custom_photo",   /* gambar peguam (hero, laman utama) */
    photo2: "sha_custom_photo2", /* gambar peguam (bahagian Tentang) */
    booking: "sha_last_booking"  /* data tempahan terakhir (untuk resit) */
  }
};
