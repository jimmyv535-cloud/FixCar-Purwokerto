# **App Name**: Kargloss Autocare Purwokerto

## Core Features:

- Tampilan Layanan: Menampilkan daftar layanan yang jelas dan ramah seluler: Auto Detailing, Salon Mobil, Cuci Mobil, Protection.
- Halaman Arahan SEO Lokal Dinamis: Saat diakses di perangkat seluler dengan GPS aktif, halaman akan dioptimalkan untuk hasil pencarian lokal di sub-distrik Purwokerto Utara yang terdeteksi (misalnya, Bobosan, Purwanegara). Ini melibatkan penyisipan kata kunci dan meta-informasi spesifik lokasi secara dinamis ke dalam konten dan metadata halaman.
- Alat Pembuat Konten Lokal: Alat AI generatif yang menghasilkan cuplikan teks dan rekomendasi hiper-lokal untuk halaman arahan berdasarkan sub-distrik yang terdeteksi di Purwokerto Utara, meningkatkan relevansi untuk SEO lokal.
- Integrasi Umpan Instagram: Menampilkan umpan terbaru atau tautan ke profil Instagram resmi 'https://www.instagram.com/karglossautocare.purwokerto/' langsung di halaman arahan.
- Penyematan Peta Google: Mengintegrasikan Peta Google interaktif yang menampilkan lokasi bisnis (Jl. Raya Baturraden KM 5 Pabuaran, Purwokerto Utara).
- Tombol Chat WhatsApp Mengambang: Menerapkan tombol WhatsApp mengambang yang terhubung ke https://wa.me/+628112612237 untuk pertanyaan dan reservasi pelanggan langsung.
- Tampilan Informasi Kontak: Menyajikan alamat lengkap dan jam operasional dengan jelas di bagian yang menonjol.
- Dukungan Bahasa Indonesia Penuh: Seluruh konten dan antarmuka pengguna situs web akan disajikan sepenuhnya dalam Bahasa Indonesia untuk kenyamanan pengguna lokal.
- Sistem Antrian Utama: Mengelola logika antrian inti, memastikan operasi yang lancar, bebas kesalahan, dan real-time. Ini menangani penambahan nomor antrian baru, pembaruan status, dan penugasan slot, termasuk interaksi dengan Firestore.
- Input Antrian Kasir: Kasir dapat login dan menambahkan nomor antrian baru. Sistem secara otomatis mengambil nomor terakhir, menambahkannya, dan menyimpannya di Firestore dengan status 'waiting'.
- Halaman Display Antrian Real-time: Menampilkan nomor antrian yang sedang dipanggil di slot yang tersedia dan daftar antrian yang sedang menunggu, diperbarui secara real-time. Full screen dan auto update, mendengarkan perubahan dari Firestore.
- Kontrol Slot Tim Cuci: Tim cuci dapat secara manual memanggil nomor antrian berikutnya ke slot cuci yang tersedia (misalnya, Slot A, Slot B) melalui tombol di antarmuka web, yang memperbarui status di Firestore.
- Notifikasi Panggilan Antrian Otomatis: Memicu notifikasi suara, bel, dan notifikasi visual saat nomor antrian dipanggil ke slot tertentu, seperti 'Nomor 12 silakan ke Slot A', berdasarkan perubahan status di Firestore.
- Halaman Daftar Antrian Kasir: Menampilkan daftar lengkap antrian yang telah dibuat oleh kasir, dengan data yang diambil dari Firestore.
- Halaman Member (Opsional): Member dapat melihat posisi antrian mereka saat ini, mengambil data dari Firestore.

## Style Guidelines:

- Warna utama: Biru tua, profesional (#0D3866). Ini mencerminkan kepercayaan dan keahlian, konsisten dengan layanan perawatan otomotif kelas atas.
- Warna latar belakang: Abu-abu-biru sangat terang, lembut (#F9FBFC). Menyediakan kanvas bersih dan lapang yang melengkapi warna biru utama tanpa mendominasinya.
- Warna aksen: Kuning-hijau cerah, dinamis (#F7F139). Digunakan untuk tombol ajakan bertindak (CTA) dan elemen sorotan untuk menciptakan kontras segar dan energik yang menarik perhatian.
- Font judul dan teks: 'Inter' (sans-serif) untuk estetika modern, sangat mudah dibaca, dan objektif, cocok untuk komunikasi yang jelas dalam konteks layanan profesional.
- Menggunakan ikon garis (line-art) bersih dan minimalis yang secara visual mewakili layanan (misalnya, mobil, spons, putaran poles) untuk mempertahankan kesan modern dan premium.
- Mengadopsi tata letak yang bersih, lapang, dan responsif, dioptimalkan untuk perangkat seluler. Memprioritaskan navigasi intuitif, pembagian bagian yang jelas untuk layanan, lokasi, dan informasi kontak, serta penempatan menonjol untuk elemen ajakan bertindak seperti tombol WhatsApp.
- Menggabungkan animasi halus untuk elemen UI seperti pengguliran mulus antar bagian, efek hover lembut pada tombol dan kartu, dan transisi elegan untuk meningkatkan keterlibatan pengguna tanpa gangguan.