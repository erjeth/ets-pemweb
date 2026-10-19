# PROSES.md

## 1. Persona dan masalah yang ingin diselesaikan

Saya membayangkan pengguna utama aplikasi ini adalah ibu rumah tangga yang harus membagi uang bulanan untuk banyak kebutuhan, seperti belanja dapur, kebutuhan anak, tagihan rumah, dan transportasi. Kadang uang terasa cepat habis karena pengeluaran kecil terjadi berkali-kali dan sulit dipantau kalau hanya mengandalkan ingatan atau catatan terpisah. Karena itu, saya ingin menyediakan cara sederhana untuk mencatat pemasukan dan pengeluaran sekaligus melihat berapa sisa uang di setiap amplop.

## 2. Rancangan struktur data `localStorage`

Aplikasi menyimpan data di browser menggunakan dua kunci `localStorage`, supaya data transaksi dan pembagian amplop dapat dikelola secara terpisah.

### a. `pmm_transaksi`

Nilainya berupa array objek transaksi. Setiap objek memiliki struktur seperti berikut:

```json
[
  {
    "id": 1790000000000,
    "tanggal": "2026-10-19",
    "jenis": "pengeluaran",
    "kategori": "Belanja Dapur",
    "nominal": 75000,
    "catatan": "Sayur dan lauk"
  }
]
```

Keterangan:
- `id`: identitas unik transaksi.
- `tanggal`: tanggal transaksi dalam format `YYYY-MM-DD`.
- `jenis`: `pemasukan` atau `pengeluaran`.
- `kategori`: kategori transaksi yang sesuai dengan jenisnya.
- `nominal`: nilai rupiah berupa bilangan bulat positif.
- `catatan`: keterangan tambahan; boleh berupa string kosong.

### b. `pmm_amplop`

Nilainya berupa objek yang dikelompokkan berdasarkan bulan (`YYYY-MM`). Setiap bulan berisi nominal jatah untuk kategori pengeluaran.

```json
{
  "2026-10": {
    "Belanja Dapur": 800000,
    "Kebutuhan Anak": 300000,
    "Tagihan Rumah": 500000,
    "Transportasi": 250000,
    "Lainnya": 100000
  }
}
```

Nilai di dalam objek tersebut adalah **jatah anggaran**, bukan total pengeluaran. Pengeluaran aktual dihitung dari transaksi yang jenisnya `pengeluaran`, kategorinya cocok, dan tanggalnya berada pada bulan yang sama. Sisa amplop dihitung dari `jatah - terpakai`.

### c. Alur penyimpanan dan pemuatan

- `muatData(kunci, bawaan)` membaca string dari `localStorage`, lalu mengubahnya kembali menjadi data JavaScript menggunakan `JSON.parse`.
- `simpanData(kunci, nilai)` mengubah data JavaScript menjadi JSON menggunakan `JSON.stringify`, lalu menyimpannya.
- Kedua fungsi tersebut menggunakan `try...catch` agar aplikasi dapat menangani kegagalan membaca atau menulis data.
- `normalisasiTransaksi()` dan `normalisasiAmplop()` memeriksa bentuk serta nilai data ketika data dimuat atau diimpor. Data yang tidak sesuai tidak langsung dipakai.
- Fitur ekspor/impor menggunakan satu berkas JSON dengan properti `versi`, `diekspor`, `transaksi`, dan `amplop`. Format berkas cadangan ini berbeda dari dua kunci penyimpanan internal.

> Catatan: `localStorage` hanya menyimpan data pada browser dan origin yang digunakan. Data tidak otomatis tersinkron ke perangkat lain, sehingga fitur ekspor JSON berguna sebagai cadangan.

## 3. Keputusan desain arsitektur JavaScript

Saya memisahkan fungsi pengolahan data dari fungsi yang memperbarui tampilan. Contohnya, `hitungRingkasan()` menghitung total pemasukan, pengeluaran, dan saldo; `hitungAmplop(bulan)` menghitung pemakaian serta sisa setiap amplop; sedangkan `renderRingkasan()`, `renderAmplop()`, dan `renderDaftar()` menampilkan hasilnya ke HTML. Setelah ada perubahan data, `renderSemua()` memanggil fungsi-fungsi render tersebut.

Alasannya, aturan perhitungan tidak tercampur dengan manipulasi DOM. Struktur ini membuat perhitungan lebih mudah diperiksa dan mengurangi risiko satu bagian tampilan diperbarui sementara bagian lain masih menampilkan data lama.

## 4. Simulasi bug/kendala teknis dan penanganannya

Contoh berikut merupakan **simulasi kendala yang masuk akal saat pengembangan**, bukan klaim bahwa semua kendala ini benar-benar pernah terjadi.

### Simulasi 1 — Data tidak muncul karena JSON di `localStorage` rusak

**Gejala:** Setelah aplikasi dibuka, data transaksi gagal dimuat karena isi `pmm_transaksi` bukan JSON yang valid, misalnya akibat data yang diedit manual di DevTools.

**Penyebab:** `JSON.parse()` akan melempar error jika string yang dibaca tidak sesuai format JSON.

**Penanganan:** Fungsi `muatData()` membungkus proses baca dan `JSON.parse()` dengan `try...catch`, lalu mengembalikan nilai bawaan jika terjadi error. Setelah data berhasil dibaca, `normalisasiTransaksi()` memeriksa struktur setiap transaksi. Untuk pengembangan lanjutan, pesan pemulihan yang lebih jelas dapat ditambahkan agar pengguna tahu bahwa data perlu dipulihkan dari berkas cadangan.

### Simulasi 2 — Sisa amplop salah setelah transaksi diedit atau tanggalnya diubah

**Gejala:** Pengeluaran dipindahkan dari satu kategori ke kategori lain, atau tanggalnya diganti ke bulan lain, tetapi sisa amplop yang ditampilkan tidak ikut berubah.

**Penyebab yang mungkin:** Perhitungan sisa amplop disimpan sebagai angka tetap dan tidak dihitung ulang ketika transaksi berubah, atau tampilan amplop tidak dirender ulang setelah penyimpanan.

**Penanganan:** Pada rancangan saat ini, `hitungAmplop(bulan)` menghitung ulang total pengeluaran dari daftar `transaksi` berdasarkan kategori dan bulan, bukan mengandalkan angka pemakaian yang disimpan terpisah. Fungsi `ubahTransaksi()` menyimpan perubahan dan memanggil `renderSemua()`, sehingga ringkasan, riwayat, dan amplop diperbarui dari data terbaru. Pengujian yang bisa dilakukan adalah mengedit kategori/tanggal transaksi lalu memastikan amplop lama dan baru sama-sama berubah sesuai perhitungan.

## 5. Pemeriksaan manual yang disarankan

- Tambahkan transaksi pemasukan dan pengeluaran, lalu cocokkan angka ringkasan.
- Atur setidaknya tiga amplop dengan jatah positif, lalu tambahkan pengeluaran pada salah satu kategori.
- Edit tanggal, kategori, dan nominal transaksi; pastikan sisa amplop ikut diperbarui.
- Muat ulang halaman dan pastikan data masih ada.
- Ekspor data, lalu uji impor menggunakan berkas JSON yang valid.
- Uji impor dengan JSON rusak atau data transaksi yang tidak valid dan pastikan aplikasi menampilkan pesan kesalahan.
