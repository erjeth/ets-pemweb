const KATEGORI = {
  pemasukan: ["Uang Bulanan", "Usaha Sampingan", "Pemasukan Lain"],
  pengeluaran: ["Belanja Dapur", "Kebutuhan Anak", "Tagihan Rumah", "Transportasi", "Lainnya"]
};

let transaksi = []; 

const formatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });


function isiKategori() {
  const jenis = document.getElementById("jenis").value;
  const daftar = KATEGORI[jenis] || [];
  document.getElementById("kategori").innerHTML = daftar.map(nama => `<option value="${nama}">${nama}</option>`).join("");
}

document.getElementById("jenis").addEventListener("change", isiKategori);
isiKategori(); 

function renderDaftar() {
  const elDaftar = document.getElementById("daftar-transaksi");
  const terurut = [...transaksi].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);
  
  elDaftar.innerHTML = terurut.map(item => {
    const tanda = item.jenis === "pemasukan" ? "+" : "-";
    const kelas = item.jenis === "pemasukan" ? "masuk" : "keluar";
    return `
      <li class="item">
        <div class="item-info">
          <span class="item-kategori">${item.kategori}</span>
          <span class="item-meta">${item.tanggal}</span>
        </div>
        <div class="item-kanan">
          <span class="item-nominal ${kelas}">${tanda}${formatter.format(item.nominal)}</span>
        </div>
      </li>`;
  }).join("");
}

document.getElementById("form-transaksi").addEventListener("submit", function(event) {
  event.preventDefault(); 
  
  const data = {
    id: Date.now(),
    tanggal: document.getElementById("tanggal").value,
    jenis: document.getElementById("jenis").value,
    kategori: document.getElementById("kategori").value,
    nominal: Number(document.getElementById("nominal").value), // Pastikan jadi angka
    catatan: document.getElementById("catatan").value
  };

  transaksi.push(data);
  
  renderDaftar();
  
  document.getElementById("form-transaksi").reset(); 
  isiKategori();
});