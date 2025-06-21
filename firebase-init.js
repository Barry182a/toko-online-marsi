// File: firebase-init.js (Versi Final yang Benar)

// Kita hanya butuh 2 alat ini: initializeApp dan getFirestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

// Konfigurasi Firebase Anda (ini tidak perlu diubah)
const firebaseConfig = {
   apiKey: "AIzaSyCXgkxi3Rw5MZzVK0txwYYIrNDzTn3kiqw",
  authDomain: "toko-online-marsi.firebaseapp.com",
  projectId: "toko-online-marsi",
  storageBucket: "toko-online-marsi.firebasestorage.app",
  messagingSenderId: "593576956368",
  appId: "1:593576956368:web:c5d1719f006287537c69d5",
  measurementId: "G-SEQC1FW35C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Ekspor koneksi database agar bisa digunakan di script.js
export const db = getFirestore(app);