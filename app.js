const KUNCI_TRANSAKSI = "pmm_transaksi";
const KUNCI_AMPLOP = "pmm_amplop";
const BATAS_MENIPIS = 0.2;
const MINIMAL_AMPLOP = 3;
const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
const POLA_BULAN = /^\d{4}-\d{2}$/;

const KATEGORI = {
  pemasukan: ["Uang Bulanan", "Usaha Sampingan", "Pemasukan Lain"],
  pengeluaran: ["Belanja Dapur", "Kebutuhan Anak", "Tagihan Rumah", "Transportasi", "Lainnya"]
};
const JENIS = Object.keys(KATEGORI);

const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});

const elTotalPemasukan = document.getElementById("total-pemasukan");
const elTotalPengeluaran = document.getElementById("total-pengeluaran");
const elTotalSaldo = document.getElementById("total-saldo");

const formTransaksi = document.getElementById("form-transaksi");
const elJudulForm = document.getElementById("judul-form");
const elTanggal = document.getElementById("tanggal");
const elJenis = document.getElementById("jenis");
const elKategori = document.getElementById("kategori");
const elNominal = document.getElementById("nominal");
const elCatatan = document.getElementById("catatan");
const elPetunjukKategori = document.getElementById("petunjuk-kategori");
const elErrorForm = document.getElementById("error-form");
const elPeringatanForm = document.getElementById("peringatan-form");
const tombolSimpan = document.getElementById("tombol-simpan");
const tombolBatalEdit = document.getElementById("tombol-batal-edit");

const formFilter = document.getElementById("form-filter");
const elFilterCari = document.getElementById("filter-cari");
const elFilterJenis = document.getElementById("filter-jenis");
const elFilterKategori = document.getElementById("filter-kategori");
const elFilterDari = document.getElementById("filter-dari");
const elFilterSampai = document.getElementById("filter-sampai");
const tombolResetFilter = document.getElementById("tombol-reset-filter");
const elErrorFilter = document.getElementById("error-filter");
const elInfoFilter = document.getElementById("info-filter");

const elDaftar = document.getElementById("daftar-transaksi");
const elDaftarKosong = document.getElementById("daftar-kosong");

const elBulan = document.getElementById("bulan-amplop");
const tombolAturAmplop = document.getElementById("tombol-atur-amplop");
const tombolBatalAmplop = document.getElementById("tombol-batal-amplop");
const formAmplop = document.getElementById("form-amplop");
const elIsianAmplop = document.getElementById("isian-amplop");
const elErrorAmplop = document.getElementById("error-amplop");
const elInfoAmplop = document.getElementById("info-amplop");
const elPeringatanAmplop = document.getElementById("peringatan-amplop");
const elDaftarAmplop = document.getElementById("daftar-amplop");

const tombolEkspor = document.getElementById("tombol-ekspor");
const tombolImpor = document.getElementById("tombol-impor");
const elBerkasImpor = document.getElementById("berkas-impor");
const elPesanBackup = document.getElementById("pesan-backup");

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

function transaksiValid(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    Number.isFinite(item.id) &&
    typeof item.tanggal === "string" &&
    POLA_TANGGAL.test(item.tanggal) &&
    JENIS.includes(item.jenis) &&
    KATEGORI[item.jenis].includes(item.kategori) &&
    Number.isInteger(item.nominal) &&
    item.nominal > 0 &&
    (item.catatan === undefined || typeof item.catatan === "string")
  );
}

function normalisasiTransaksi(daftar) {
  const idDipakai = new Set();
  const valid = [];
  let tidakValid = 0;
  daftar.forEach((item) => {
    if (!transaksiValid(item)) {
      tidakValid += 1;
      return;
    }
    let id = item.id;
    while (idDipakai.has(id)) {
      id += 1;
    }
    idDipakai.add(id);
    valid.push({
      id,
      tanggal: item.tanggal,
      jenis: item.jenis,
      kategori: item.kategori,
      nominal: item.nominal,
      catatan: item.catatan || ""
    });
  });
  return { valid, tidakValid };
}

function normalisasiAmplop(data) {
  if (data === null || typeof data !== "object" || Array.isArray(data)) return null;
  const hasil = {};
  for (const bulan of Object.keys(data)) {
    const jatah = data[bulan];
    if (!POLA_BULAN.test(bulan) || jatah === null || typeof jatah !== "object") return null;
    hasil[bulan] = {};
    for (const nama of KATEGORI.pengeluaran) {
      const nilai = jatah[nama] === undefined ? 0 : jatah[nama];
      if (!Number.isInteger(nilai) || nilai < 0) return null;
      hasil[bulan][nama] = nilai;
    }
  }
  return hasil;
}

function muatTransaksi() {
  const data = muatData(KUNCI_TRANSAKSI, []);
  return Array.isArray(data) ? normalisasiTransaksi(data).valid : [];
}

function muatAmplop() {
  return normalisasiAmplop(muatData(KUNCI_AMPLOP, {})) || {};
}

let transaksi = muatTransaksi();
let pembagianAmplop = muatAmplop();
let bulanAktif = hariIni().slice(0, 7);
let idEdit = null;

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
  if (amplop.sisa < amplop.jatah * BATAS_MENIPIS) return "menipis";
  return "aman";
}

function labelStatus(status, amplop) {
  if (status === "habis") return amplop.sisa < 0 ? "Melebihi" : "Habis";
  if (status === "menipis") return "Menipis";
  return "";
}

function pesanPeringatan(amplop) {
  const status = statusAmplop(amplop);
  if (status === "habis") {
    return amplop.sisa < 0
      ? `Amplop ${amplop.nama} melebihi jatah sebesar ${formatRupiah(-amplop.sisa)}.`
      : `Amplop ${amplop.nama} sudah habis.`;
  }
  if (status === "menipis") {
    const persen = Math.round((amplop.sisa / amplop.jatah) * 100);
    return `Amplop ${amplop.nama} hampir habis, sisa ${formatRupiah(amplop.sisa)} (${persen}% dari jatah).`;
  }
  return "";
}

function peringatanSetelahSimpan(data) {
  if (data.jenis !== "pengeluaran") return "";
  const bulan = data.tanggal.slice(0, 7);
  const amplop = hitungAmplop(bulan).find((item) => item.nama === data.kategori);
  const pesan = amplop ? pesanPeringatan(amplop) : "";
  return pesan ? `${formatBulan(bulan)}: ${pesan}` : "";
}

function validasiTransaksi(data, nominalMentah) {
  const errors = {};
  if (!data.tanggal) {
    errors.tanggal = "Tanggal wajib diisi.";
  }
  if (!JENIS.includes(data.jenis)) {
    errors.jenis = "Jenis transaksi wajib dipilih.";
  }
  if (!data.kategori) {
    errors.kategori = "Kategori wajib dipilih.";
  } else if (JENIS.includes(data.jenis) && !KATEGORI[data.jenis].includes(data.kategori)) {
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

function simpanTransaksi() {
  const tersimpan = simpanData(KUNCI_TRANSAKSI, transaksi);
  elErrorForm.textContent = tersimpan ? "" : "Data tidak bisa disimpan permanen di browser ini.";
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
  simpanTransaksi();
  renderSemua();
}

function ubahTransaksi(id, data) {
  transaksi = transaksi.map((item) => (item.id === id ? { ...item, ...data } : item));
  simpanTransaksi();
  renderSemua();
}

function hapusTransaksi(id) {
  const target = transaksi.find((item) => item.id === id);
  if (!target) return;
  const yakin = confirm(`Hapus transaksi ${target.kategori} sebesar ${formatRupiah(target.nominal)}?`);
  if (!yakin) return;
  transaksi = transaksi.filter((item) => item.id !== id);
  simpanTransaksi();
  if (idEdit === id) {
    keluarModeEdit();
  }
  renderSemua();
}

function mulaiEdit(id) {
  const target = transaksi.find((item) => item.id === id);
  if (!target) return;
  idEdit = id;
  elTanggal.value = target.tanggal;
  elJenis.value = target.jenis;
  isiKategori();
  elKategori.value = target.kategori;
  elNominal.value = target.nominal;
  elCatatan.value = target.catatan;
  elJudulForm.textContent = "Edit Transaksi";
  tombolSimpan.textContent = "Simpan Perubahan";
  tombolBatalEdit.hidden = false;
  elPeringatanForm.textContent = "";
  elErrorForm.textContent = "";
  tampilkanError({});
  renderDaftar();
  renderPetunjukKategori();
  formTransaksi.scrollIntoView({ behavior: "smooth", block: "start" });
  elNominal.focus({ preventScroll: true });
}

function keluarModeEdit() {
  idEdit = null;
  elJudulForm.textContent = "Tambah Transaksi";
  tombolSimpan.textContent = "Simpan Transaksi";
  tombolBatalEdit.hidden = true;
  elTanggal.value = hariIni();
  elNominal.value = "";
  elCatatan.value = "";
  tampilkanError({});
  renderDaftar();
  renderPetunjukKategori();
}

function isiKategori() {
  const daftar = KATEGORI[elJenis.value] || [];
  elKategori.innerHTML = daftar
    .map((nama) => `<option value="${escapeHtml(nama)}">${escapeHtml(nama)}</option>`)
    .join("");
}

function isiKategoriFilter() {
  const terpilih = elFilterKategori.value;
  const daftar = elFilterJenis.value
    ? KATEGORI[elFilterJenis.value]
    : [...KATEGORI.pemasukan, ...KATEGORI.pengeluaran];
  const opsi = daftar.map((nama) => `<option value="${escapeHtml(nama)}">${escapeHtml(nama)}</option>`);
  elFilterKategori.innerHTML = `<option value="">Semua kategori</option>${opsi.join("")}`;
  elFilterKategori.value = daftar.includes(terpilih) ? terpilih : "";
}

function bacaFilter() {
  return {
    kata: elFilterCari.value.trim().toLowerCase(),
    jenis: elFilterJenis.value,
    kategori: elFilterKategori.value,
    dari: elFilterDari.value,
    sampai: elFilterSampai.value
  };
}

function cocokFilter(item, filter) {
  if (filter.jenis && item.jenis !== filter.jenis) return false;
  if (filter.kategori && item.kategori !== filter.kategori) return false;
  if (filter.dari && item.tanggal < filter.dari) return false;
  if (filter.sampai && item.tanggal > filter.sampai) return false;
  if (filter.kata && !item.catatan.toLowerCase().includes(filter.kata)) return false;
  return true;
}

function resetFilter() {
  formFilter.reset();
  isiKategoriFilter();
  renderDaftar();
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
  const kelasItem = item.id === idEdit ? "item sedang-diedit" : "item";
  const catatan = item.catatan ? `<span class="item-catatan">${escapeHtml(item.catatan)}</span>` : "";
  const nama = escapeHtml(item.kategori);
  return `
    <li class="${kelasItem}">
      <div class="item-info">
        <span class="item-kategori">${nama}</span>
        <span class="item-meta">${formatTanggal(item.tanggal)}</span>
        ${catatan}
      </div>
      <div class="item-kanan">
        <span class="item-nominal ${kelas}">${tanda}${formatRupiah(item.nominal)}</span>
        <div class="item-aksi">
          <button type="button" class="tombol kecil" data-edit="${item.id}" aria-label="Edit transaksi ${nama}">Edit</button>
          <button type="button" class="tombol kecil hapus" data-hapus="${item.id}" aria-label="Hapus transaksi ${nama}">Hapus</button>
        </div>
      </div>
    </li>`;
}

function renderDaftar() {
  const filter = bacaFilter();
  const rentangSalah = filter.dari !== "" && filter.sampai !== "" && filter.dari > filter.sampai;
  const terfilter = rentangSalah ? [] : transaksi.filter((item) => cocokFilter(item, filter));
  const terurut = [...terfilter].sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id - a.id);

  formFilter.hidden = transaksi.length === 0;
  elErrorFilter.textContent = rentangSalah ? "Tanggal awal tidak boleh setelah tanggal akhir." : "";
  elInfoFilter.textContent =
    transaksi.length > 0 ? `Menampilkan ${terurut.length} dari ${transaksi.length} transaksi.` : "";
  elDaftarKosong.textContent =
    transaksi.length === 0
      ? "Belum ada transaksi. Catat transaksi pertama lewat form Tambah Transaksi."
      : "Tidak ada transaksi yang cocok dengan filter.";
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

function buatPeringatanHtml(amplop) {
  const pesan = pesanPeringatan(amplop);
  if (!pesan) return "";
  const kelas = statusAmplop(amplop) === "habis" ? "bahaya" : "waspada";
  return `<li class="${kelas}">${escapeHtml(pesan)}</li>`;
}

function renderAmplop() {
  const daftar = hitungAmplop(bulanAktif);
  elDaftarAmplop.innerHTML = daftar.map(buatAmplopHtml).join("");
  elPeringatanAmplop.innerHTML = daftar.map(buatPeringatanHtml).join("");
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
  if (!POLA_BULAN.test(elBulan.value)) {
    elBulan.value = bulanAktif;
    return;
  }
  bulanAktif = elBulan.value;
  if (!formAmplop.hidden) isiFormAmplop();
  renderAmplop();
}

function tampilPesanBackup(teks, jenis) {
  elPesanBackup.textContent = teks;
  elPesanBackup.className = `pesan ${jenis}`;
}

function eksporData() {
  const isi = {
    versi: 1,
    diekspor: new Date().toISOString(),
    transaksi,
    amplop: pembagianAmplop
  };
  const blob = new Blob([JSON.stringify(isi, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = `backup-keuangan-${hariIni()}.json`;
  document.body.appendChild(tautan);
  tautan.click();
  tautan.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  tampilPesanBackup(`${transaksi.length} transaksi berhasil diekspor.`, "sukses");
}

function prosesImpor(teks) {
  let data;
  try {
    data = JSON.parse(teks);
  } catch (error) {
    tampilPesanBackup("File bukan JSON yang valid.", "error");
    return;
  }

  if (data === null || typeof data !== "object" || !Array.isArray(data.transaksi)) {
    tampilPesanBackup("Format file tidak dikenali. Gunakan file hasil ekspor aplikasi ini.", "error");
    return;
  }

  const hasilTransaksi = normalisasiTransaksi(data.transaksi);
  if (hasilTransaksi.tidakValid > 0) {
    tampilPesanBackup(`${hasilTransaksi.tidakValid} transaksi di file tidak valid. Impor dibatalkan.`, "error");
    return;
  }

  const hasilAmplop = normalisasiAmplop(data.amplop === undefined ? {} : data.amplop);
  if (hasilAmplop === null) {
    tampilPesanBackup("Data amplop di file tidak valid. Impor dibatalkan.", "error");
    return;
  }

  const yakin = confirm(
    `Impor akan mengganti seluruh data saat ini dengan ${hasilTransaksi.valid.length} transaksi dari file. Lanjutkan?`
  );
  if (!yakin) {
    tampilPesanBackup("Impor dibatalkan.", "error");
    return;
  }

  transaksi = hasilTransaksi.valid;
  pembagianAmplop = hasilAmplop;
  const tersimpan = simpanData(KUNCI_TRANSAKSI, transaksi) && simpanData(KUNCI_AMPLOP, pembagianAmplop);
  keluarModeEdit();
  if (!formAmplop.hidden) isiFormAmplop();
  renderSemua();
  tampilPesanBackup(
    tersimpan
      ? `${transaksi.length} transaksi berhasil diimpor.`
      : "Data diimpor, tetapi tidak bisa disimpan permanen di browser ini.",
    tersimpan ? "sukses" : "error"
  );
}

function imporData(event) {
  const berkas = event.target.files[0];
  if (!berkas) return;
  const pembaca = new FileReader();
  pembaca.onload = () => prosesImpor(String(pembaca.result));
  pembaca.onerror = () => tampilPesanBackup("File tidak bisa dibaca.", "error");
  pembaca.onloadend = () => {
    elBerkasImpor.value = "";
  };
  pembaca.readAsText(berkas);
}

function ubahJenis() {
  isiKategori();
  renderPetunjukKategori();
}

function ubahJenisFilter() {
  isiKategoriFilter();
  renderDaftar();
}

function kirimTransaksi(event) {
  event.preventDefault();
  const data = bacaForm();
  const errors = validasiTransaksi(data, elNominal.value.trim());
  tampilkanError(errors);
  if (Object.keys(errors).length > 0) return;

  if (idEdit !== null) {
    ubahTransaksi(idEdit, data);
    keluarModeEdit();
  } else {
    tambahTransaksi(data);
    elNominal.value = "";
    elCatatan.value = "";
  }
  elPeringatanForm.textContent = peringatanSetelahSimpan(data);
  elNominal.focus();
}

function klikDaftar(event) {
  const tombolEdit = event.target.closest("[data-edit]");
  if (tombolEdit) {
    mulaiEdit(Number(tombolEdit.dataset.edit));
    return;
  }
  const tombolHapus = event.target.closest("[data-hapus]");
  if (tombolHapus) {
    hapusTransaksi(Number(tombolHapus.dataset.hapus));
  }
}

function pasangEvent() {
  formTransaksi.addEventListener("submit", kirimTransaksi);
  tombolBatalEdit.addEventListener("click", keluarModeEdit);
  elJenis.addEventListener("change", ubahJenis);
  elKategori.addEventListener("change", renderPetunjukKategori);
  elTanggal.addEventListener("change", renderPetunjukKategori);
  elDaftar.addEventListener("click", klikDaftar);

  formFilter.addEventListener("submit", (event) => event.preventDefault());
  elFilterJenis.addEventListener("change", ubahJenisFilter);
  [elFilterCari, elFilterKategori, elFilterDari, elFilterSampai].forEach((el) => {
    el.addEventListener("input", renderDaftar);
  });
  tombolResetFilter.addEventListener("click", resetFilter);

  tombolAturAmplop.addEventListener("click", bukaFormAmplop);
  tombolBatalAmplop.addEventListener("click", tutupFormAmplop);
  formAmplop.addEventListener("submit", simpanAmplop);
  elBulan.addEventListener("change", gantiBulan);

  tombolEkspor.addEventListener("click", eksporData);
  tombolImpor.addEventListener("click", () => elBerkasImpor.click());
  elBerkasImpor.addEventListener("change", imporData);
}

function init() {
  elTanggal.value = hariIni();
  elBulan.value = bulanAktif;
  isiKategori();
  isiKategoriFilter();
  buatIsianAmplop();
  pasangEvent();
  renderSemua();
}

init();