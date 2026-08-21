/**
 * @file mockData.js
 * @description Data dummy/mock untuk simulasi fitur e-Samsat Aceh.
 * Berisi data kendaraan contoh, informasi layanan Samsat, dan fungsi kalkulasi pajak.
 * File ini menggantikan data dari backend selama fase pengembangan/demo.
 */

/**
 * Daftar kendaraan dummy untuk simulasi pencarian dan pembayaran pajak.
 * Setiap objek merepresentasikan satu kendaraan dengan data pemilik, rincian pajak,
 * dan riwayat pembayaran. Field `status` menentukan apakah kendaraan sudah LUNAS atau BELUM BAYAR.
 * @type {Array<Object>}
 */
export const MOCK_VEHICLES = [
  {
    nopol: "BL 4582 AA",
    nopolClean: "BL4582AA",
    namaPemilik: "BUDIONO SIREGAR NST",
    nik: "1171012304920001",
    nikMasked: "1171**********",
    jenisMerek: "MOTOR / HONDA",
    modelTahun: "SCOOPY / 2022",
    warna: "HITAM METALIK",
    noRangka: "MHRE*********12345",
    noMesin: "L15B*********6789",
    noRangkaLast5: "12345",
    masaBerlakuStnk: "12 MEI 2026",
    tglJatuhTempo: "12 MEI 2026",
    status: "BELUM BAYAR",
    rincianPajak: {
      pkb: 4250000,
      opsenPkb: 425000,
      dendaPkb: 125000,
      dendaOpsenPkb: 12500,
      swdkllj: 143000,
      opsenDendaSwdkllj: 14300,
      biayaAdmin: 0
    },
    riwayat: [
      {
        tglBayar: "12 Mei 2025 - 09:45 WIB",
        masaBerlaku: "12 Mei 2026",
        kodeBayar: "982039182301",
        metode: "Bank Aceh Syariah Mobile",
        nominal: 4969800,
        status: "Berhasil"
      }
    ]
  },
  {
    nopol: "BL 1234 AB",
    nopolClean: "BL1234AB",
    namaPemilik: "TEUKU ISKANDAR MUDA",
    nik: "1172021508850002",
    nikMasked: "1172**********",
    jenisMerek: "MOBIL / TOYOTA",
    modelTahun: "FORTUNER VRZ / 2023",
    warna: "PUTIH MUTIARA",
    noRangka: "MHFY*********88321",
    noMesin: "2GD*********5412",
    noRangkaLast5: "88321",
    masaBerlakuStnk: "20 AGUSTUS 2026",
    tglJatuhTempo: "20 AGUSTUS 2026",
    status: "BELUM BAYAR",
    rincianPajak: {
      pkb: 7850000,
      opsenPkb: 785000,
      dendaPkb: 0,
      dendaOpsenPkb: 0,
      swdkllj: 143000,
      opsenDendaSwdkllj: 0,
      biayaAdmin: 50000
    },
    riwayat: [
      {
        tglBayar: "20 Agustus 2025 - 11:20 WIB",
        masaBerlaku: "20 Agustus 2026",
        kodeBayar: "982039182302",
        metode: "PT Pos Indonesia (PosPay)",
        nominal: 8828000,
        status: "Berhasil"
      }
    ]
  },
  {
    nopol: "BL 8888 AC",
    nopolClean: "BL8888AC",
    namaPemilik: "CUT FATIMAH AZ-ZAHRA",
    nik: "1101014402960003",
    nikMasked: "1101**********",
    jenisMerek: "MOTOR / YAMAHA",
    modelTahun: "NMAX 155 ABS / 2024",
    warna: "MAXI MATTE BLACK",
    noRangka: "MH3S*********99214",
    noMesin: "G3J1E*********3321",
    noRangkaLast5: "99214",
    masaBerlakuStnk: "05 DESEMBER 2026",
    tglJatuhTempo: "05 DESEMBER 2026",
    status: "LUNAS",
    rincianPajak: {
      pkb: 680000,
      opsenPkb: 68000,
      dendaPkb: 0,
      dendaOpsenPkb: 0,
      swdkllj: 35000,
      opsenDendaSwdkllj: 0,
      biayaAdmin: 0
    },
    riwayat: [
      {
        tglBayar: "05 Des 2025 - 10:15 WIB",
        masaBerlaku: "05 Des 2026",
        kodeBayar: "982039182301",
        metode: "Bank Aceh Syariah Mobile",
        nominal: 783000,
        status: "Berhasil"
      }
    ]
  }
];


/**
 * Data statis informasi layanan Samsat Aceh.
 * Digunakan oleh komponen InfoSection.vue untuk menampilkan:
 * - `samsatKeliling`: Jadwal dan lokasi Samsat Keliling di Banda Aceh
 * - `mppLocations`: Daftar Mall Pelayanan Publik (MPP) di berbagai kota
 * - `faq`: Pertanyaan yang sering diajukan beserta jawabannya
 * @type {Object}
 */
export const INFORMASI_LAYANAN = {
  samsatKeliling: [
    { hari: "Senin - Kamis", lokasi: "Lapangan Blang Padang, Banda Aceh", jam: "08:30 - 14:00 WIB" },
    { hari: "Jumat", lokasi: "Masjid Raya Baiturrahman, Banda Aceh", jam: "08:30 - 11:30 WIB" },
    { hari: "Sabtu", lokasi: "Taman Bustanussalatin (Taman Sari)", jam: "09:00 - 13:00 WIB" }
  ],
  mppLocations: [
    { kota: "Banda Aceh", nama: "MPP Pasar Aceh lantai 3", alamat: "Jl. Diponegoro No. 1, Banda Aceh" },
    { kota: "Lhokseumawe", nama: "MPP Kota Lhokseumawe", alamat: "Jl. Merdeka No. 45, Lhokseumawe" },
    { kota: "Langsa", nama: "MPP Kota Langsa", alamat: "Jl. Jend. Sudirman No. 12, Langsa" }
  ],
  faq: [
    {
      q: "Dokumen apa saja yang wajib dibawa saat pengesahan STNK?",
      a: "Anda perlu membawa KTP asli pemilik sesuai STNK, STNK asli, dan bukti transaksi pembayaran e-Samsat Aceh (Kode Bayar / Resi Digital)."
    },
    {
      q: "Di mana saya bisa melakukan pembayaran e-Samsat Aceh?",
      a: "Pembayaran dapat dilakukan melalui Action Bank Aceh Syariah (M-Banking/ATM), Teller Bank Aceh, Kantor Pos Indonesia / PosPay, QRIS, dan E-Wallet mitra."
    },
    {
      q: "Berapa lama batas waktu penukaran nota pajak setelah bayar online?",
      a: "Batas waktu pengesahan STNK adalah 30 hari kerja sejak tanggal pembayaran sukses dilakukan."
    }
  ]
};

/**
 * Menghitung total keseluruhan pajak kendaraan dari semua komponennya.
 * Menjumlahkan PKB, Opsen PKB, Denda PKB, Denda Opsen PKB, SWDKLLJ,
 * Opsen Denda SWDKLLJ, dan Biaya Admin.
 * @param {Object} rincianPajak - Objek rincian pajak kendaraan dari data kendaraan
 * @returns {number} Total pajak dalam satuan Rupiah (0 jika rincianPajak null/undefined)
 */
export const calculateTotalPajak = (rincianPajak) => {
  if (!rincianPajak) return 0
  const {
    pkb = 0,
    opsenPkb = 0,
    dendaPkb = 0,
    dendaOpsenPkb = 0,
    swdkllj = 0,
    opsenDendaSwdkllj = 0,
    biayaAdmin = 0
  } = rincianPajak
  return pkb + opsenPkb + dendaPkb + dendaOpsenPkb + swdkllj + opsenDendaSwdkllj + biayaAdmin
}

