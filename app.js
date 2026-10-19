const KUNCI_TRANSAKSI = "pmm_transaksi";
const KUNCI_AMPLOP = "pmm_amplop";
const BATAS_MENIPIS = 0.2;
const MINIMAL_AMPLOP = 3;

const KATEGORI = {
  pemasukan: ["Uang Bulanan", "Usaha Sampingan", "Pemasukan Lain"],
  pengeluaran: ["Belanja Dapur", "Kebutuhan Anak", "Tagihan Rumah", "Transportasi", "Lainnya"]
};

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

const elTotalPemasukan = document.getElementById("total-pemasukan");
const elTotalPengeluaran = document.getElementById("total-pengeluaran");
const elTotalSaldo = document.getElementById("total-saldo");

const formTransaksi = document.getElementById("form-transaksi");
const elTanggal = document.getElementById("tanggal");
const elJenis = document.getElementById("jenis");
const elKategori = document.getElementById("kategori");
const elNominal = document.getElementById("nominal");
const elCatatan = document.getElementById("catatan");
const elPetunjukKategori = document.getElementById("petunjuk-kategori");
const elErrorForm = document.getElementById("error-form");

const elDaftar = document.getElementById("daftar-transaksi");
const elDaftarKosong = document.getElementById("daftar-kosong");

const elBulan = document.getElementById("bulan-amplop");
const tombolAturAmplop = document.getElementById("tombol-atur-amplop");
const tombolBatalAmplop = document.getElementById("tombol-batal-amplop");
const formAmplop = document.getElementById("form-amplop");
const elIsianAmplop = document.getElementById("isian-amplop");
const elErrorAmplop = document.getElementById("error-amplop");
const elInfoAmplop = document.getElementById("info-amplop");
const elDaftarAmplop = document.getElementById("daftar-amplop");

const FIELD_TRANSAKSI = {
  tanggal: elTanggal,
  jenis: elJenis,
  kategori: elKategori,
  nominal: elNominal
};

function hariIni() {
  const sekarang = new Date();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const tanggal = String(sekarang.getDate()).padStart(2, "0");
  return `${sekarang.getFullYear()}-${bulan}-${tanggal}`;
}

function formatRupiah(angka) {
  return formatter.format(angka);
}

function formatTanggal(teks) {
  const [tahun, bulan, hari] = teks.split("-").map(Number);
  return new Date(tahun, bulan - 1, hari).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatBulan(teks) {
  const [tahun, bulan] = teks.split("-").map(Number);
  return new Date(tahun, bulan - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric"
  });
}

function escapeHtml(teks) {
  return String(teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function muatData(kunci, bawaan) {
  try {
    const mentah = localStorage.getItem(kunci);
    return mentah ? JSON.parse(mentah) : bawaan;
  } catch (error) {
    return bawaan;
  }
}

function simpanData(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
    return true;
  } catch (error) {
    return false;
  }
}

function muatTransaksi() {
  const data = muatData(KUNCI_TRANSAKSI, []);
  if (!Array.isArray(data)) return [];
  return data.filter((item) => item && typeof item.nominal === "number" && typeof item.tanggal === "string");
}

function muatAmplop() {
  const data = muatData(KUNCI_AMPLOP, {});
  const objekBiasa = data !== null && typeof data === "object" && !Array.isArray(data);
  return objekBiasa ? data : {};
}

let transaksi = muatTransaksi();
let pembagianAmplop = muatAmplop();
let bulanAktif = hariIni().slice(0, 7);

function buatId() {
  let id = Date.now();
  while (transaksi.some((item) => item.id === id)) {
    id += 1;
  }
  return id;
}

function jumlahNominal(daftar) {
  return daftar.reduce((total, item) => total + item.nominal, 0);
}

function hitungRingkasan() {
  const pemasukan = jumlahNominal(transaksi.filter((item) => item.jenis === "pemasukan"));
  const pengeluaran = jumlahNominal(transaksi.filter((item) => item.jenis === "pengeluaran"));
  return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
}

function hitungAmplop(bulan) {
  const jatah = pembagianAmplop[bulan] || {};
  return KATEGORI.pengeluaran
    .filter((nama) => jatah[nama] > 0)
    .map((nama) => {
      const terpakai = jumlahNominal(
        transaksi.filter(
          (item) => item.jenis === "pengeluaran" && item.kategori === nama && item.tanggal.startsWith(bulan)
        )
      );
      return { nama, jatah: jatah[nama], terpakai, sisa: jatah[nama] - terpakai };
    });
}

function statusAmplop(amplop) {
  if (amplop.sisa <= 0) return "habis";
  if (amplop.sisa <= amplop.jatah * BATAS_MENIPIS) return "menipis";
  return "aman";
}

function labelStatus(status, amplop) {
  if (status === "habis") return amplop.sisa < 0 ? "Melebihi" : "Habis";
  if (status === "menipis") return "Menipis";
  return "";
}

function validasiTransaksi(data, nominalMentah) {
  const errors = {};
  if (!data.tanggal) {
    errors.tanggal = "Tanggal wajib diisi.";
  }
  if (!KATEGORI[data.jenis]) {
    errors.jenis = "Jenis transaksi wajib dipilih.";
  }
  if (!data.kategori) {
    errors.kategori = "Kategori wajib dipilih.";
  } else if (KATEGORI[data.jenis] && !KATEGORI[data.jenis].includes(data.kategori)) {
    errors.kategori = "Kategori tidak sesuai dengan jenis transaksi.";
  }
  if (nominalMentah === "") {
    errors.nominal = "Nominal wajib diisi.";
  } else if (!Number.isFinite(data.nominal) || data.nominal <= 0) {
    errors.nominal = "Nominal harus lebih dari 0.";
  } else if (!Number.isInteger(data.nominal)) {
    errors.nominal = "Nominal harus berupa bilangan bulat.";
  }
  return errors;
}

function tampilkanError(errors) {
  Object.keys(FIELD_TRANSAKSI).forEach((nama) => {
    const pesan = errors[nama] || "";
    document.getElementById(`error-${nama}`).textContent = pesan;
    FIELD_TRANSAKSI[nama].classList.toggle("invalid", pesan !== "");
    FIELD_TRANSAKSI[nama].setAttribute("aria-invalid", pesan !== "" ? "true" : "false");
  });
  const pertama = Object.keys(FIELD_TRANSAKSI).find((nama) => errors[nama]);
  if (pertama) {
    FIELD_TRANSAKSI[pertama].focus();
  }
}

function bacaForm() {
  return {
    tanggal: elTanggal.value,
    jenis: elJenis.value,
    kategori: elKategori.value,
    nominal: Number(elNominal.value),
    catatan: elCatatan.value.trim()
  };
}

function tambahTransaksi(data) {
  transaksi.push({
    id: buatId(),
    tanggal: data.tanggal,
    jenis: data.jenis,
    kategori: data.kategori,
    nominal: data.nominal,
    catatan: data.catatan
  });
  const tersimpan = simpanData(KUNCI_TRANSAKSI, transaksi);
  elErrorForm.textContent = tersimpan ? "" : "Data tidak bisa disimpan permanen di browser ini.";
  renderSemua();
}

function hapusTransaksi(id) {
  const target = transaksi.find((item) => item.id === id);
  if (!target) return;
  const yakin = confirm(`Hapus transaksi ${target.kategori} sebesar ${formatRupiah(target.nominal)}?`);
  if (!yakin) return;
  transaksi = transaksi.filter((item) => item.id !== id);
  simpanData(KUNCI_TRANSAKSI, transaksi);
  renderSemua();
}

function isiKategori() {
  const daftar = KATEGORI[elJenis.value] || [];
  elKategori.innerHTML = daftar
    .map((nama) => `<option value="${escapeHtml(nama)}">${escapeHtml(nama)}</option>`)
    .join("");
}

function renderPetunjukKategori() {
  const bulan = (elTanggal.value || hariIni()).slice(0, 7);
  if (elJenis.value !== "pengeluaran") {
    elPetunjukKategori.textContent = "";
    return;
  }
  const amplop = hitungAmplop(bulan).find((item) => item.nama === elKategori.value);
  elPetunjukKategori.textContent = amplop
    ? `Sisa amplop ${amplop.nama} bulan itu: ${formatRupiah(amplop.sisa)}`
    : "Kategori ini belum punya amplop di bulan tersebut.";
}

function renderRingkasan() {
  const ringkasan = hitungRingkasan();
  elTotalPemasukan.textContent = formatRupiah(ringkasan.pemasukan);
  elTotalPengeluaran.textContent = formatRupiah(ringkasan.pengeluaran);
  elTotalSaldo.textContent = formatRupiah(ringkasan.saldo);
  elTotalSaldo.classList.toggle("negatif", ringkasan.saldo < 0);
}

function buatItemHtml(item) {
  const tanda = item.jenis === "pemasukan" ? "+" : "-";
  const kelas = item.jenis === "pemasukan" ? "masuk" : "keluar";
  const catatan = item.catatan ? `<span class="item-catatan">${escapeHtml(item.catatan)}</span>` : "";
  return `
    <li class="item">
      <div class="item-info">
        <span class="item-kategori">${escapeHtml(item.kategori)}</span>
        <span class="item-meta">${formatTanggal(item.tanggal)}</span>
        ${catatan}
      </div>
      <div class="item-kanan">
        <span class="item-nominal ${kelas}">${tanda}${formatRupiah(item.nominal)}</span>
        <button type="button" class="tombol hapus" data-hapus="${item.id}" aria-label="Hapus transaksi ${escapeHtml(item.kategori)}">Hapus</button>
      </div>
    </li>`;
}

function renderDaftar() {
  const terurut = [...transaksi].sort(
    (a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id
  );
  elDaftarKosong.hidden = terurut.length > 0;
  elDaftar.innerHTML = terurut.map(buatItemHtml).join("");
}

function buatAmplopHtml(amplop) {
  const status = statusAmplop(amplop);
  const label = labelStatus(status, amplop);
  const persen = Math.min(100, Math.round((amplop.terpakai / amplop.jatah) * 100));
  const lencana = label ? `<span class="lencana">${label}</span>` : "";
  return `
    <article class="amplop ${status}">
      <div class="amplop-kepala">
        <span class="amplop-nama">${escapeHtml(amplop.nama)}</span>
        ${lencana}
      </div>
      <p class="amplop-sisa">${formatRupiah(amplop.sisa)}</p>
      <p class="amplop-rincian">Terpakai ${formatRupiah(amplop.terpakai)} dari ${formatRupiah(amplop.jatah)}</p>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${persen}" aria-label="Pemakaian amplop ${escapeHtml(amplop.nama)}">
        <div class="bar-isi" style="width: ${persen}%"></div>
      </div>
    </article>`;
}

function renderAmplop() {
  const daftar = hitungAmplop(bulanAktif);
  elDaftarAmplop.innerHTML = daftar.map(buatAmplopHtml).join("");
  elInfoAmplop.textContent =
    daftar.length === 0
      ? `Belum ada pembagian amplop untuk ${formatBulan(bulanAktif)}. Klik Atur Amplop untuk membagi uang belanja.`
      : "";
}

function renderSemua() {
  renderRingkasan();
  renderDaftar();
  renderAmplop();
  renderPetunjukKategori();
}

function buatIsianAmplop() {
  elIsianAmplop.innerHTML = KATEGORI.pengeluaran
    .map(
      (nama, indeks) => `
      <div class="bidang">
        <label for="amplop-${indeks}">${escapeHtml(nama)}</label>
        <input type="number" id="amplop-${indeks}" data-amplop="${escapeHtml(nama)}" min="0" step="1" inputmode="numeric" placeholder="0">
      </div>`
    )
    .join("");
}

function isiFormAmplop() {
  const jatah = pembagianAmplop[bulanAktif] || {};
  elIsianAmplop.querySelectorAll("input").forEach((input) => {
    const nilai = jatah[input.dataset.amplop];
    input.value = nilai > 0 ? nilai : "";
    input.classList.remove("invalid");
  });
  elErrorAmplop.textContent = "";
}

function bukaFormAmplop() {
  isiFormAmplop();
  formAmplop.hidden = false;
  elIsianAmplop.querySelector("input").focus();
}

function tutupFormAmplop() {
  formAmplop.hidden = true;
  elErrorAmplop.textContent = "";
}

function simpanAmplop(event) {
  event.preventDefault();
  const inputs = [...elIsianAmplop.querySelectorAll("input")];
  const jatah = {};
  let adaTidakValid = false;

  inputs.forEach((input) => {
    const mentah = input.value.trim();
    const nilai = mentah === "" ? 0 : Number(mentah);
    const valid = Number.isInteger(nilai) && nilai >= 0;
    input.classList.toggle("invalid", !valid);
    if (!valid) adaTidakValid = true;
    jatah[input.dataset.amplop] = valid ? nilai : 0;
  });

  if (adaTidakValid) {
    elErrorAmplop.textContent = "Nominal amplop harus berupa bilangan bulat, minimal 0.";
    return;
  }

  const jumlahTerisi = Object.values(jatah).filter((nilai) => nilai > 0).length;
  if (jumlahTerisi < MINIMAL_AMPLOP) {
    elErrorAmplop.textContent = `Isi minimal ${MINIMAL_AMPLOP} amplop dengan nominal lebih dari 0.`;
    return;
  }

  pembagianAmplop[bulanAktif] = jatah;
  simpanData(KUNCI_AMPLOP, pembagianAmplop);
  tutupFormAmplop();
  renderSemua();
}

function gantiBulan() {
  if (!/^\d{4}-\d{2}$/.test(elBulan.value)) {
    elBulan.value = bulanAktif;
    return;
  }
  bulanAktif = elBulan.value;
  if (!formAmplop.hidden) isiFormAmplop();
  renderAmplop();
}

function ubahJenis() {
  isiKategori();
  renderPetunjukKategori();
}

function kirimTransaksi(event) {
  event.preventDefault();
  const data = bacaForm();
  const errors = validasiTransaksi(data, elNominal.value.trim());
  tampilkanError(errors);
  if (Object.keys(errors).length > 0) return;
  tambahTransaksi(data);
  elNominal.value = "";
  elCatatan.value = "";
  elNominal.focus();
}

function klikDaftar(event) {
  const tombol = event.target.closest("[data-hapus]");
  if (!tombol) return;
  hapusTransaksi(Number(tombol.dataset.hapus));
}

function pasangEvent() {
  formTransaksi.addEventListener("submit", kirimTransaksi);
  elJenis.addEventListener("change", ubahJenis);
  elKategori.addEventListener("change", renderPetunjukKategori);
  elTanggal.addEventListener("change", renderPetunjukKategori);
  elDaftar.addEventListener("click", klikDaftar);
  tombolAturAmplop.addEventListener("click", bukaFormAmplop);
  tombolBatalAmplop.addEventListener("click", tutupFormAmplop);
  formAmplop.addEventListener("submit", simpanAmplop);
  elBulan.addEventListener("change", gantiBulan);
}

function init() {
  elTanggal.value = hariIni();
  elBulan.value = bulanAktif;
  isiKategori();
  buatIsianAmplop();
  pasangEvent();
  renderSemua();
}

init();