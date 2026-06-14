# Kargloss Autocare Purwokerto - Internal Management System

Sistem manajemen terintegrasi untuk bisnis jasa perawatan mobil (Auto Detailing, Salon, Cuci Mobil) yang dirancang untuk efisiensi operasional, akurasi stok, dan kemudahan bagi pelanggan.

## 🚀 Gambaran Umum Sistem
Aplikasi ini dibangun menggunakan **Next.js 15**, **Firebase (Auth, Firestore, Messaging)**, dan **Genkit AI**. Sistem menggabungkan pengalaman pelanggan yang modern (PWA) dengan alat operasional internal yang ketat (Audit-Ready).

---

## 👥 Peran Pengguna (User Roles)
Sistem memiliki 4 tingkat akses dengan izin yang berbeda:
1.  **Super Admin (Owner)**: Akses penuh ke seluruh sistem, termasuk pengaturan API, persetujuan belanja stok, dan fitur penghapusan data.
2.  **Admin**: Akses operasional harian (Booking, Nota, Antrean, Inventaris). Perubahan pada daftar belanja stok memerlukan persetujuan Owner.
3.  **Member**: Pelanggan yang terdaftar. Dapat memonitor antrean secara real-time, melihat riwayat servis, jadwal servis mendatang, dan menerima notifikasi promo.
4.  **Public**: Pengunjung website. Dapat melihat layanan, lokasi, dan mengirim formulir pendaftaran.

---

## 🛠️ Struktur Modul Utama

### 1. Website & SEO (Landing Page)
*   **Deteksi Lokasi**: Menggunakan GPS/IP untuk mengenali sub-distrik pelanggan di Purwokerto Utara.
*   **AI Local Content**: Integrasi Genkit AI untuk menghasilkan konten SEO yang relevan dengan lokasi pelanggan guna meningkatkan jangkauan Google Search.

### 2. Workshop & Antrean (Queue System)
*   **Monitor Real-time**: Manajemen 4 slot pengerjaan (Slot A, B, C, D).
*   **Audio Recall**: Sistem panggilan suara otomatis (Text-to-Speech) dalam Bahasa Indonesia saat nomor antrean dipanggil.
*   **Tiket Antrean**: Fitur cetak tiket thermal (58mm) untuk pelanggan.

### 3. CRM & Member Management
*   **Profil Member**: Pencatatan data kendaraan (Plat nomor, tipe mobil).
*   **Jadwal Servis**: Fitur booking jadwal dengan pengingat email otomatis (via Trigger Email Extension).
*   **Push Notifications**: Notifikasi promo langsung ke smartphone member menggunakan Firebase Cloud Messaging (FCM).

### 4. Inventaris & Audit (Audit-Ready)
*   **Master Parts**: Monitoring stok suku cadang dengan peringatan stok menipis (Low Stock Alert).
*   **Audit-Ready Flow**: Setiap perubahan stok (masuk/keluar) dicatat dalam riwayat transaksi (`partTransactions`) untuk keperluan audit.
*   **Pembelian Stok**: Alur pendaftaran barang baru wajib melalui menu Pembelian untuk mencatat modal dan supplier.

### 5. Kasir & Keuangan (Invoicing)
*   **Tanda Terima (PKB)**: Dokumen awal saat kendaraan masuk ke workshop.
*   **Nota Pelunasan**: Dokumen akhir yang secara otomatis memotong stok barang di gudang jika terdapat pemakaian part/oli.
*   **Financial Dashboard**: Laporan pendapatan, pengeluaran belanja, dan nilai aset inventaris secara harian dan bulanan.

---

## 🔄 Alur Bisnis Utama (Business Flows)

### A. Alur Pelanggan (Booking ke Selesai)
1.  **Booking**: Pelanggan mengisi formulir di website.
2.  **Konfirmasi**: Admin menerima notifikasi di dashboard dan menghubungi via WhatsApp.
3.  **Check-in**: Saat pelanggan datang, Admin membuat **Tanda Terima (PKB)** dan memasukkan kendaraan ke **Daftar Tunggu Antrean**.
4.  **Pengerjaan**: Admin memanggil nomor antrean ke slot yang tersedia (Suara otomatis berbunyi).
5.  **Pelunasan**: Setelah selesai, Admin mengonversi PKB menjadi **Nota Pelunasan**, memotong stok part yang digunakan, dan mencetak nota.

### B. Alur Inventaris (Pembelian & Pemakaian)
1.  **Pendaftaran & Belanja**: Admin menginput nota belanja dari supplier di menu Pembelian.
2.  **Approval**: Owner meninjau dan menyetujui (Approve) data belanja tersebut. Stok otomatis bertambah di menu Inventaris.
3.  **Pemakaian**: Setiap kali item part dipilih di Nota Pelunasan, sistem secara otomatis mengurangi stok dan mencatat alasan pemakaian untuk audit.

---

## 📱 Fitur Teknis Unggulan
*   **Progressive Web App (PWA)**: Aplikasi dapat diinstal di Android/iOS dan berfungsi seperti aplikasi native.
*   **Native Push Notifications**: Mengirim pesan promo bergambar yang muncul sebagai pop-up di layar smartphone pelanggan.
*   **Responsive UI**: Dashboard dirancang khusus agar nyaman digunakan baik dari PC kantor maupun Smartphone Admin di lapangan.
*   **Firestore Rules**: Keamanan data tingkat tinggi yang memisahkan data internal perusahaan dari akses pelanggan.

---

## 📂 Struktur File Penting
*   `src/app/dashboard/`: Seluruh modul administrasi internal.
*   `src/app/member/`: Antarmuka khusus pelanggan.
*   `src/app/display/`: Halaman monitor antrean khusus TV/Layar lebar.
*   `src/firebase/messaging.ts`: Logika pendaftaran push notifikasi.
*   `firestore.rules`: Aturan keamanan database.

---
© 2025 Kargloss Autocare Purwokerto. Sistem Manajemen Operasional v1.0.