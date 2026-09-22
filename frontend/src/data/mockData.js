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
    statusCode: 1,
    statusText: "OK",
    deskripsi: "Kendaraan Bisa Melakukan Pembayaran Online",
    kendaraan: {
      nopol: "BL 4582 AA",
      nik: "1171012304920001",
      jenis: "MOTOR",
      merek: "HONDA",
      model: "SCOOPY",
      tipe: "SCOOPY",
      tahun: "2022",
      warna: "HITAM METALIK",
      sdStnk: "12 MEI 2026",
      sdNotice: "12 MEI 2026"
    },
    pajak: {
      pkb: 4250000,
      opkb: 425000,
      dpkb: 125000,
      odpkb: 12500,
      swd: 143000,
      dswd: 14300,
      total: 4969800,
      tglTtp: "12 MEI 2026",
      sdNoticeYad: "12 MEI 2027"
    },
    noReff: "w6hgYdF4wc0c9Nr4ChfV",
    riwayatPembayaran: [
      {
        tanggalBayar: "12 Mei 2025",
        lokasiPembayaran: "Banda Aceh",
        metodePembayaran: "cashless",
        noReff: "982039182301",
        total: 4969800
      }
    ],
    nopolClean: "BL4582AA",
    noRangkaLast5: "12345"
  },
  {
    statusCode: 1,
    statusText: "OK",
    deskripsi: "Kendaraan Bisa Melakukan Pembayaran Online",
    kendaraan: {
      nopol: "BL 1234 AB",
      nik: "1172021508850002",
      jenis: "MOBIL",
      merek: "TOYOTA",
      model: "FORTUNER",
      tipe: "VRZ",
      tahun: "2023",
      warna: "PUTIH MUTIARA",
      sdStnk: "20 AGUSTUS 2026",
      sdNotice: "20 AGUSTUS 2026"
    },
    pajak: {
      pkb: 7850000,
      opkb: 785000,
      dpkb: 0,
      odpkb: 0,
      swd: 143000,
      dswd: 0,
      total: 8828000,
      tglTtp: "20 AGUSTUS 2026",
      sdNoticeYad: "20 AGUSTUS 2027"
    },
    noReff: "w6hgYdF4wc0c9Nr4ChfV",
    riwayatPembayaran: [
      {
        tanggalBayar: "20 Agustus 2025",
        lokasiPembayaran: "Lhokseumawe",
        metodePembayaran: "cashless",
        noReff: "982039182302",
        total: 8828000
      }
    ],
    nopolClean: "BL1234AB",
    noRangkaLast5: "88321"
  },
  {
    statusCode: 2,
    statusText: "Validasi Pembayaran",
    deskripsi: "kendaraan tidak bisa melakukan pembayaran pajak online karena sudah masuk masa ganti plat 5 tahunan, silahkan ke kantor samsat UPTD wilayah kab/kota asal kendaraan",
    kendaraan: {
      nopol: "BL 8888 AC",
      nik: "1101014402960003",
      jenis: "MOTOR",
      merek: "YAMAHA",
      model: "NMAX",
      tipe: "155 ABS",
      tahun: "2024",
      warna: "MAXI MATTE BLACK",
      sdStnk: "05 DESEMBER 2026",
      sdNotice: "05 DESEMBER 2026"
    },
    riwayatPembayaran: [
      {
        tanggalBayar: "05 Des 2025",
        lokasiPembayaran: "Langsa",
        metodePembayaran: "cash",
        noReff: "982039182301",
        total: 783000
      }
    ],
    nopolClean: "BL8888AC",
    noRangkaLast5: "99214"
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
    opkb = 0,
    dpkb = 0,
    odpkb = 0,
    swd = 0,
    dswd = 0
  } = rincianPajak
  return pkb + opkb + dpkb + odpkb + swd + dswd
}

