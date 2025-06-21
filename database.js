// File: database.js (Versi Final Sesuai Ide Anda)

// ===================================
// == DATABASE PRODUK INTI
// ===================================
// Kita tambahkan properti 'tagMusiman' pada setiap produk.
// Isi dengan nama musim (cth: "sekolah"), atau null jika tidak termasuk musim apa pun.
const productsDB = [
    {
        id: 'pa1',
        nama: 'Jaket Denim Pria',
        harga: 250000,
        gambar: 'https://res.cloudinary.com/dqbiyfgch/image/upload/v1750060940/pakaian3_azdzag.jpg',
        kategori: 'Pakaian',
        deskripsi: 'Jaket denim klasik...',
        isUnggulan: true,
        tagMusiman: "remaja" // Produk ini untuk musim "remaja"
    },
    {
        id: 'pe1',
        nama: 'Wadah Plastik Set',
        harga: 89000,
        gambar: 'https://res.cloudinary.com/dqbiyfgch/image/upload/v1750060941/perabot5_gre14v.jpg',
        kategori: 'Perabot',
        deskripsi: 'Satu set wadah plastik...',
        isUnggulan: true,
        tagMusiman: null // Bukan produk musiman
    },
    {
        id: 'pa2',
        nama: 'Outerwear Wanita',
        harga: 180000,
        gambar: 'https://placehold.co/400x550/D2DAEA/333?text=Outerwear',
        kategori: 'Pakaian',
        deskripsi: 'Outerwear stylish...',
        isUnggulan: true,
        tagMusiman: null
    },
    {
        id: 'pa3',
        nama: 'Celana Jeans Sobek',
        harga: 220000,
        gambar: 'https://placehold.co/400x550/EAD2D2/333?text=Celana+Jeans',
        kategori: 'Pakaian',
        deskripsi: 'Celana jeans model sobek...',
        isUnggulan: true,
        tagMusiman: "remaja"
    },
    {
        id: 'ke1',
        nama: 'Tas Sekolah Keren',
        harga: 150000,
        gambar: 'https://placehold.co/300x300/EAE3D2/333?text=Tas+Sekolah',
        kategori: 'Kebutuhan Rumah',
        deskripsi: 'Tas sekolah dengan banyak kantong...',
        isUnggulan: false,
        tagMusiman: "sekolah" // <-- ANDA MENULIS NAMA MUSIM DI SINI
    },
    {
        id: 'ke2',
        nama: 'Buku Tulis 1 Set',
        harga: 55000,
        gambar: 'https://placehold.co/300x300/B4B4B4/333?text=Buku+Tulis',
        kategori: 'Kebutuhan Rumah',
        deskripsi: 'Satu set buku tulis...',
        isUnggulan: false,
        tagMusiman: "sekolah" // <-- DAN DI SINI
    },
    {
        id: 'pa4',
        nama: 'Seragam Sekolah SD',
        harga: 85000,
        gambar: 'https://placehold.co/300x300/D2DAEA/333?text=Seragam+SD',
        kategori: 'Pakaian',
        deskripsi: 'Setelan seragam SD...',
        isUnggulan: false,
        tagMusiman: "sekolah"
    },
    {
        id: 'pa5',
        nama: 'Sepatu Sekolah Hitam',
        harga: 120000,
        gambar: 'https://placehold.co/300x300/EAD2D2/333?text=Sepatu+Sekolah',
        kategori: 'Pakaian',
        deskripsi: 'Sepatu sekolah warna hitam...',
        isUnggulan: false,
        tagMusiman: "sekolah"
    },
    {
        id: 'ke3',
        nama: 'Kue Kering Lebaran',
        harga: 195000,
        gambar: 'https://placehold.co/300x300/A8D5BA/333?text=Kue+Lebaran',
        kategori: 'Kebutuhan Rumah',
        deskripsi: 'Satu set toples kue kering...',
        isUnggulan: false,
        tagMusiman: "lebaran"
    },
    {
        id: 'pa6',
        nama: 'Baju Koko Modern',
        harga: 175000,
        gambar: 'https://placehold.co/300x300/8EAF9D/333?text=Baju+Koko',
        kategori: 'Pakaian',
        deskripsi: 'Baju koko pria...',
        isUnggulan: false,
        tagMusiman: "lebaran"
    }
    
];
// ===================================
// == KAMUS SLOGAN UNTUK SETIAP MUSIM
// ===================================
// Tambahkan objek baru ini di bagian bawah file Anda.
const seasonalSlogans = {
    sekolah: "Kembali ke Sekolah!",
    lebaran: "Spesial Lebaran Penuh Berkah",
    remaja: "Gaya Trendy Kekinian untuk Kamu"
    // Anda bisa menambahkan slogan untuk musim lainnya di sini
};