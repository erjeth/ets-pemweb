const KATEGORI = {
  pemasukan: ["Uang Bulanan", "Usaha Sampingan", "Pemasukan Lain"],
  pengeluaran: ["Belanja Dapur", "Kebutuhan Anak", "Tagihan Rumah", "Transportasi", "Lainnya"]
};

const KUNCI_TRANSAKSI = "pmm_transaksi";
let transaksi = JSON.parse(localStorage.getItem(KUNCI_TRANSAKSI)) || [];

const formatter = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const elTotalPemasukan = document.getElementById("total-pemasukan");
const elTotalPengeluaran = document.getElementById("total-pengeluaran");
const elTotalSaldo = document.getElementById("total-saldo");

function simpanTransaksi() {
  localStorage.setItem(KUNCI_TRANSAKSI, JSON.stringify(transaksi));
}

function isiKategori() {
  const jenis = document.getElementById("jenis").value;
  const daftar = KATEGORI[jenis] || [];
  document.getElementById("kategori").innerHTML = daftar.map(nama => `<option value="${nama}">${nama}</option>`).join("");
}

document.getElementById("jenis").addEventListener("change", isiKategori);

function renderRingkasan() {
  const pemasukan = transaksi
    .filter(item => item.jenis === "pemasukan")
    .reduce((total, item) => total + item.nominal, 0);

  const pengeluaran = transaksi
    .filter(item => item.jenis === "pengeluaran")
    .reduce((total, item) => total + item.nominal, 0);

  const saldo = pemasukan - pengeluaran;

  elTotalPemasukan.textContent = formatter.format(pemasukan);
  elTotalPengeluaran.textContent = formatter.format(pengeluaran);
  elTotalSaldo.textContent = formatter.format(saldo);
}

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
          <button type="button" class="tombol kecil hapus" onclick="hapusTransaksi(${item.id})">Hapus</button>
        </div>
      </li>`;
  }).join("");
}

function renderSemua() {
  renderRingkasan();
  renderDaftar();
}

window.hapusTransaksi = function(id) {
  const yakin = confirm("Yakin ingin menghapus transaksi ini?");
  if (yakin) {
    transaksi = transaksi.filter(item => item.id !== id);
    simpanTransaksi();
    renderSemua();    
  }
};

document.getElementById("form-transaksi").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const tanggal = document.getElementById("tanggal").value;
  const kategori = document.getElementById("kategori").value;
  const nominal = Number(document.getElementById("nominal").value);
  const elError = document.getElementById("error-form");

  if (!tanggal || !kategori || nominal <= 0) {
    elError.textContent = "Error: Semua field wajib diisi dan nominal harus lebih dari 0!";
    return; 
  }
  
  elError.textContent = ""; 
  
  const data = {
    id: Date.now(),
    tanggal: tanggal,
    jenis: document.getElementById("jenis").value,
    kategori: kategori,
    nominal: nominal,
    catatan: document.getElementById("catatan").value
  };

  transaksi.push(data);
  simpanTransaksi();
  renderSemua();
  
  document.getElementById("form-transaksi").reset();
});

isiKategori(); 
renderSemua();