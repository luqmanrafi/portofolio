# Luqman Rafi Adyatma · Portfolio

Website portfolio statis (HTML + CSS + JavaScript biasa). Tidak butuh framework atau build step untuk situsnya.
Satu-satunya bagian yang memakai React adalah ID card 3D (React Bits Lanyard), yang sudah dikemas menjadi `js/lanyard.js`.

## Struktur
```
luqman-portfolio/
├── index.html          # struktur halaman + sprite ikon (SVG inline) + konfigurasi ID card
├── css/style.css       # semua gaya, dibagi per bagian (tokens, rail, hero, ... responsive)
├── js/main.js          # interaksi: tema, scroll-spy, tab, animasi, ID card 2D (fallback)
├── js/lanyard.js       # ID card 3D (React Bits Lanyard, sudah di-build, jangan diedit)
├── assets/
│   ├── card-front.webp # desain sisi depan ID card
│   └── card-back.webp  # desain sisi belakang (klik/tap card untuk membalik)
├── lanyard-src/        # source untuk membangun ulang js/lanyard.js (opsional)
├── licenses/           # lisensi React Bits
└── README.md
```

## Menjalankan
ID card 3D butuh server (tekstur gambar tidak bisa dimuat dari `file://`). Cara termudah:
```
python3 -m http.server 8000     # lalu buka http://localhost:8000
```
Kalau `index.html` dibuka langsung dengan klik ganda, website tetap jalan, tetapi ID card memakai versi 2D (fallback).
Fallback 2D juga dipakai otomatis jika WebGL tidak tersedia atau pengunjung mengaktifkan "reduce motion".

## Yang perlu Anda ganti
- **Foto / desain ID card:** ganti `assets/card-front.webp` dan `assets/card-back.webp` (rasio 800×1125 px, sisakan ±150 px di bagian atas untuk lubang card).
- **Link GitHub tiap project:** cari komentar `Ganti href tombol "View on GitHub"` di `index.html`.
- **Warna:** ubah variabel di bagian `1. TOKENS` pada `css/style.css`. Warna tali card: `strapColor` di `index.html` (`window.LANYARD_CONFIG`).
- **Teks/pengalaman:** edit langsung di `index.html`.

## Membangun ulang ID card 3D (opsional)
Hanya perlu jika Anda mengubah `lanyard-src/`:
```
cd lanyard-src
npm install
npx vite build        # hasil: dist/lanyard.js  → salin ke ../js/lanyard.js
```

## Deploy gratis
GitHub Pages, Netlify, atau Vercel (pilih folder ini sebagai root; tidak ada perintah build).

## Breakpoint responsif
`1500+` layar lebar · `≤1240` konten digeser untuk side rail · `≤1024` bento 2 kolom, kartu project 2 kolom · `≤900` About 1 kolom · `≤760` hero 1 kolom, rail jadi dock bawah, kartu JSON disembunyikan · `≤480` HP kecil.

## Lisensi pihak ketiga
ID card 3D memakai komponen **Lanyard dari React Bits** (MIT + Commons Clause). Boleh dipakai di website/aplikasi,
termasuk komersial, selama komponennya tidak dijual sendiri. Teks lisensi lengkap ada di `licenses/react-bits-LICENSE.txt`.
Ikon teknologi berasal dari Simple Icons (CC0).
