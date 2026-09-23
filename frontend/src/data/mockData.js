/**
 * @file mockData.js
 * @description Data dummy/mock untuk simulasi fitur e-Samsat Aceh.
 * Berisi data kendaraan contoh, informasi layanan Samsat, dan fungsi kalkulasi pajak.
 * File ini menggantikan data dari backend selama fase pengembangan/demo.
 */


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
      a: "Pembayaran dapat dilakukan melalui ATM Bank Aceh Syariah, Teller Bank Aceh Syariah, Aplikasi Action Mobile Banking Bank Aceh, Loket PT. POS Indonesia dan Aplikasi PosPay."
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

