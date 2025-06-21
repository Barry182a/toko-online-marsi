// File: data-loader.js
import { db } from './firebase-init.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

async function fetchData() {
    console.log("Mengambil data dari Firebase...");
    try {
        // Ambil Pengaturan Musim Aktif
        const settingsRef = doc(db, "settings", "siteConfig");
        const settingsSnap = await getDoc(settingsRef);
        const musimAktif = settingsSnap.exists() ? settingsSnap.data().musimAktif : 'default';
        console.log("Musim Aktif saat ini:", musimAktif);

        // Ambil Data Produk
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsDB = [];
        productsSnapshot.forEach((doc) => {
            productsDB.push({ ...doc.data(), firestoreId: doc.id });
        });
        console.log("Produk berhasil diambil:", productsDB.length, "item");

        // Kembalikan semua data yang sudah siap
        return { productsDB, musimAktif };

    } catch (error) {
        console.error("Error mengambil data: ", error);
        // Jika gagal, kembalikan data kosong dan throw error
        throw error;
    }
}

// Ambil data sekali, lalu ekspor hasilnya
export const dataPromise = fetchData();