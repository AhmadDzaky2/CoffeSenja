/* ============================================================
   KONFIGURASI FIREBASE — WAJIB DIISI SEBELUM WEB BISA DIPAKAI
   ============================================================
   1. Ikuti panduan pembuatan project Firebase yang diberikan.
   2. Salin nilai "firebaseConfig" dari Firebase Console kamu.
   3. Ganti semua tulisan ISI_DENGAN_... di bawah ini dengan
      nilai punya kamu sendiri.
   4. Upload ulang file INI SAJA ke GitHub (timpa yang lama).

   File ini dipakai bersama oleh pesan.html dan kasir.html,
   jadi kamu cukup mengisi konfigurasi di SATU tempat ini.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCzhDB7Ox1JzCFrTsSd_gaM4H4QeF8I-O4",
  authDomain: "kopi-senja-5dd7e.firebaseapp.com",
  projectId: "kopi-senja-5dd7e",
  storageBucket: "kopi-senja-5dd7e.firebasestorage.app",
  messagingSenderId: "936500716429",
  appId: "1:936500716429:web:ca7d787a9e4562a2a653c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* PIN untuk masuk Dashboard Kasir. Ganti ke angka rahasia kamu sendiri.
   Catatan: ini pengaman ringan (biar customer gak nyasar ke dashboard),
   BUKAN keamanan tingkat tinggi — jangan pakai buat data super sensitif. */
const KASIR_PIN = "1234";

/* PIN untuk masuk Dashboard Owner (data analitik/pendapatan).
   Sebaiknya BEDA dari KASIR_PIN, karena ini lebih sensitif
   (nominal pendapatan) dan cuma buat kamu sendiri. */
const OWNER_PIN = "9999";
