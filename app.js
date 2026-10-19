const KATEGORI = {
  pemasukan: ["Uang Bulanan", "Usaha Sampingan", "Pemasukan Lain"],
  pengeluaran: ["Belanja Dapur", "Kebutuhan Anak", "Tagihan Rumah", "Transportasi", "Lainnya"]
};

let transaksi = [];

function isiKategori() {
  const jenis = document.getElementById("jenis").value;
  const daftar = KATEGORI[jenis] || [];
  document.getElementById("kategori").innerHTML = daftar.map(nama => `<option value="${nama}">${nama}</option>`).join("");
}

document.getElementById("jenis").addEventListener("change", isiKategori);
isiKategori(); 

document.getElementById("form-transaksi").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const data = {
    id: Date.now(),
    tanggal: document.getElementById("tanggal").value,
    jenis: document.getElementById("jenis").value,
    kategori: document.getElementById("kategori").value,
    nominal: Number(document.getElementById("nominal").value), 
    catatan: document.getElementById("catatan").value
  };

  transaksi.push(data);
  console.log("Data berhasil ditambah:", transaksi); 
});