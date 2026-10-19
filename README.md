# Personal Money Management - Catatan Keuangan Rumah Tangga

## Identitas Mahasiswa
* **Nama:** Achmad Mirza Arzheta Rahman
* **NRP:** 5053251011

## Persona & Masalah
* **Persona:** Ibu rumah tangga[cite: 4].
* **Masalah Keuangan:** Kesulitan dalam membagi dan melacak jatah uang belanja bulanan. Uang untuk berbagai kebutuhan sering tercampur, sehingga butuh sistem "amplop" digital di awal bulan agar pengeluaran tiap pos (seperti dapur, kebutuhan anak, dan tagihan) tidak melebihi batas yang sudah ditentukan[cite: 4].

## Daftar Fitur yang Selesai

### Kebutuhan Fungsional Wajib
- [x] **W1 - Tambah transaksi:** Form lengkap dengan input tanggal, jenis, kategori, nominal, dan catatan[cite: 4].
- [x] **W2 - Daftar transaksi:** Dirender secara dinamis dengan Javascript, diurutkan dari yang terbaru, dan menggunakan format mata uang Rupiah[cite: 4].
- [x] **W3 - Hapus transaksi:** Dilengkapi dengan pop-up konfirmasi sebelum data dihapus[cite: 4].
- [x] **W4 - Data persisten:** Data transaksi dan amplop disimpan dengan aman di `localStorage` browser sehingga tidak hilang saat di-refresh[cite: 4].
- [x] **W5 - Ringkasan:** Menampilkan total pemasukan, total pengeluaran, dan kalkulasi saldo secara otomatis dan *real-time*[cite: 4].
- [x] **W6 - Validasi form:** Validasi nilai nominal (harus lebih dari 0) dan field wajib langsung di HTML tanpa menggunakan `alert()`[cite: 4].

### Fitur Khas Persona (Ibu Rumah Tangga)
- [x] **Alokasi Amplop Bulanan:** Form untuk membagi uang belanja bulan ini ke beberapa amplop (minimal 3 pos dengan nominal > 0)[cite: 4].
- [x] **Integrasi Transaksi:** Setiap transaksi pengeluaran secara otomatis memotong jatah pada amplop kategori yang bersesuaian[cite: 4].
- [x] **Indikator Sisa & Status:** Tampilan visual sisa uang per amplop dengan *progress bar* dan penanda status otomatis (Aman, Menipis, atau Habis/Melebihi jatah)[cite: 4].

### Fitur Bonus
- [x] **Edit Transaksi:** Memungkinkan pengguna mengubah transaksi yang sudah tersimpan tanpa harus menghapus dan membuat baru[cite: 4].
- [x] **Filter & Pencarian:** Fitur penyaringan daftar transaksi berdasarkan jenis, kategori, rentang tanggal, serta pencarian kata kunci pada catatan[cite: 4].
- [x] **Backup Data (Ekspor/Impor JSON):** Kemampuan mengekspor seluruh data (transaksi dan pembagian amplop) ke dalam file `.json` dan mengimpornya kembali jika data di `localStorage` hilang[cite: 4].
- [x] **Tampilan Responsif:** Desain UI/UX yang dapat menyesuaikan dengan rapi di berbagai ukuran layar, termasuk layar *smartphone* (360px)[cite: 4].

## Fitur yang Belum Selesai
- (Semua fitur yang direncanakan telah selesai diimplementasikan).