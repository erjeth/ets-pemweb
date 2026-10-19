# AI-LOG.md

Dokumen ini mencatat bantuan AI dalam proses pengembangan aplikasi

## Entri 1 — Perumusan fitur aplikasi keuangan

**Prompt pengguna (ringkasan):** Saya sedang membuat website personal money management dan ingin mengatur amplop uang untuk kebutuhan seperti belanja, transportasi, dan biaya anak. Saya meminta saran konsep serta fungsi JavaScript dan elemen HTML yang perlu ditambahkan.

**Bagian yang dibantu AI:**
- Menyusun ide fitur, seperti pengelolaan amplop, ringkasan keuangan, peringatan anggaran, pencarian/penyaringan riwayat, dan cadangan data.
- Memberi arahan konseptual tentang fungsi perhitungan dan pembaruan tampilan. Ini berupa rekomendasi desain, bukan berarti seluruh fungsi aplikasi ditulis AI.

**Penyesuaian mandiri — isi sesuai kenyataan:**
- Contoh yang dapat dipakai jika benar dilakukan: memilih fitur yang paling relevan untuk versi awal dan memprioritaskan alur utama berupa pencatatan transaksi, pembagian anggaran bulanan, dan pemantauan sisa amplop.
- Perubahan nyata yang saya lakukan: Membuat fitur amplop yang dapat di tambahkan dan diatur sendiri.

## Entri 2 — Penyusunan tampilan CSS

**Prompt pengguna (ringkasan):** Saya meminta rekomendasi konsep desain CSS berdasarkan berkas HTML dan JavaScript yang telah diberikan, lalu meminta dibuatkan stylesheet yang sesuai dengan struktur aplikasi.

**Bagian kode yang dihasilkan AI:**
- Berkas `style.css` untuk tampilan dashboard keuangan dengan tema **Sage Green & Warm Cream**.
- Aturan tata letak responsif, kartu ringkasan, form, tombol, daftar transaksi, kartu amplop, progress bar, status/peringatan, serta penyesuaian tampilan layar kecil.
- CSS diselaraskan dengan nama kelas dan ID yang ada di HTML, sehingga tujuan awalnya adalah memperbaiki tampilan tanpa perlu mengubah logika JavaScript.

**Penyesuaian mandiri — isi sesuai kenyataan:**
- Contoh yang dapat dipakai jika benar dilakukan: menyesuaikan warna, jarak, ukuran teks, atau breakpoint setelah melihat hasilnya di browser; lalu melakukan hard refresh untuk memastikan stylesheet terbaru dimuat.
- Perubahan nyata yang saya lakukan: belum ada.

## Entri 3 — Dokumentasi repositori

**Prompt pengguna (ringkasan):** Saya meminta draf `PROSES.md` dan `AI-LOG.md`. `PROSES.md` diminta menjelaskan persona ibu rumah tangga, struktur data `localStorage`, satu keputusan arsitektur fungsi JavaScript, serta dua simulasi kendala teknis. `AI-LOG.md` diminta berisi tiga entri interaksi, bagian yang dibantu AI, dan penyesuaian mandiri.

**Bagian yang dihasilkan AI:**
- Draf dokumentasi `PROSES.md`, termasuk penjelasan struktur `pmm_transaksi` dan `pmm_amplop`, alur pemuatan/penyimpanan, pemisahan fungsi hitung dan render, serta dua simulasi kendala.
- Draf `AI-LOG.md` yang merangkum tiga tahap bantuan: perumusan fitur, pembuatan CSS, dan dokumentasi.

**Penyesuaian mandiri — isi sesuai kenyataan:**
- Contoh yang dapat dipakai jika benar dilakukan: membandingkan dokumentasi dengan kode terbaru, memperbaiki nama fungsi/kunci penyimpanan jika berbeda, dan mengganti simulasi dengan kendala yang benar-benar dialami.
- Perubahan nyata yang saya lakukan: koreksi, dan penambahan.
