/**
 * @file vehicleApi.js
 * @description Lapisan layanan (service layer) untuk data kendaraan.
 *
 * CARA MIGRASI KE API REAL:
 * 1. Ubah USE_MOCK = false
 * 2. Isi API_BASE_URL dengan URL backend (atau set env VITE_API_URL)
 * 3. Sesuaikan fungsi transformResponse() jika struktur JSON backend berbeda
 */

import { MOCK_VEHICLES, calculateTotalPajak } from '../data/mockData'

// ─── KONFIGURASI ──────────────────────────────────────────────────────────────

/** Toggle mock (true) vs API real (false). Ubah di sini saja saat migrasi. */
const USE_MOCK = true

/** Base URL API backend. Digunakan saat USE_MOCK = false. */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.samsatdigital.net'

// ─── TIPE HASIL ───────────────────────────────────────────────────────────────
/**
 * @typedef {Object} VehicleResult
 * @property {'found'|'notfound'|'error'} status
 * @property {Object|null} vehicle
 * @property {number} totalPajak
 * @property {string} message
 */

// ─── UTILITAS INTERNAL ────────────────────────────────────────────────────────

/**
 * Mensimulasikan data kendaraan yang realistis berdasarkan input user.
 * Digunakan agar *apapun* yang diinput user akan menampilkan hasil (untuk keperluan demo UI).
 *
 * @param {Object} p
 * @param {string} p.nik
 * @param {string} p.nopolAngka
 * @param {string} p.nopolSeri
 * @param {string} p.noRangkaLast5
 * @returns {Object}
 */
const generateDummyVehicle = ({ nik, nopolAngka, nopolSeri, noRangkaLast5 }) => {
  const seri = nopolSeri ? ' ' + nopolSeri.toUpperCase() : ''
  const nopol = ('BL ' + nopolAngka + seri).trim()
  const nopolClean = nopol.replace(/\s+/g, '').toUpperCase()
  
  // Generate angka acak untuk pajak agar terlihat realistis
  const pkb = Math.floor(Math.random() * (4000000 - 500000 + 1) + 500000)
  const swdkllj = 35000
  
  return {
    nopol,
    nopolClean,
    namaPemilik: 'PEMILIK KENDARAAN (DUMMY)',
    nik,
    nikMasked: nik ? nik.substring(0, 4) + '**********' + nik.slice(-2) : '1171**********01',
    jenisMerek: 'HONDA / VARIO',
    modelTahun: 'MATIC / 2022',
    warna: 'HITAM',
    noRangka: noRangkaLast5 ? 'MHRE*************' + noRangkaLast5 : 'MHRE*************12345',
    noMesin: 'JFD1E123456',
    noRangkaLast5: noRangkaLast5 || '12345',
    masaBerlakuStnk: '12 AGUSTUS 2028',
    tglJatuhTempo: '12 AGUSTUS 2024',
    status: 'BELUM BAYAR',
    rincianPajak: {
      pkb: pkb,
      opsenPkb: Math.floor(pkb * 0.1),
      dendaPkb: 0,
      dendaOpsenPkb: 0,
      swdkllj: swdkllj,
      opsenDendaSwdkllj: 0,
      biayaAdmin: 0,
    },
    riwayat: [],
  }
}

/** Menerapkan NIK input user ke data kendaraan yang ditemukan. */
const applyUserInput = (vehicle, inputNik) => ({
  ...vehicle,
  nik: inputNik || vehicle.nik,
  nikMasked: inputNik
    ? inputNik.substring(0, 4) + '**********' + inputNik.slice(-2)
    : vehicle.nikMasked,
})

// ─── IMPLEMENTASI MOCK ────────────────────────────────────────────────────────

const searchMock = async ({ nik, nopolAngka, nopolSeri, noRangkaLast5 }) => {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const seri = nopolSeri ? ' ' + nopolSeri.toUpperCase() : ''
  const nopol = ('BL ' + nopolAngka + seri).trim()
  const cleanNopol = nopol.replace(/\s+/g, '').toUpperCase()

  const found = MOCK_VEHICLES.find(
    (v) =>
      (cleanNopol && v.nopolClean === cleanNopol) ||
      (nik && v.nik === nik) ||
      (noRangkaLast5 && v.noRangkaLast5 === noRangkaLast5)
  )

  if (found) {
    const vehicle = applyUserInput(found, nik)
    return {
      status: 'found',
      vehicle,
      totalPajak: calculateTotalPajak(vehicle.rincianPajak),
      message: 'Data ditemukan untuk kendaraan ' + vehicle.nopol,
    }
  }

  // Tampilkan data yang persis diinput user dengan nilai pajak simulasi
  const vehicle = generateDummyVehicle({ nik, nopolAngka, nopolSeri, noRangkaLast5 })
  return {
    status: 'found',
    vehicle,
    totalPajak: calculateTotalPajak(vehicle.rincianPajak),
    message: 'Data simulasi ditampilkan untuk ' + vehicle.nopol,
  }
}

// ─── IMPLEMENTASI API REAL ────────────────────────────────────────────────────

/**
 * Transform response JSON backend → format Vehicle aplikasi.
 * Sesuaikan mapping field di fungsi ini jika struktur API backend berbeda.
 */
const transformResponse = (apiData, inputNik) => {
  const k = apiData.kendaraan || {}
  const p = apiData.pajak || {}

  return {
    nopol:        k.nopol || '-',
    nopolClean:   (k.nopol || '').replace(/\\s+/g, '').toUpperCase(),
    namaPemilik:  '-', // Tidak ada di spec
    nik:          inputNik || k.nik || '-',
    nikMasked:    inputNik ? inputNik.substring(0, 4) + '**********' + inputNik.slice(-2) : '-',
    jenisMerek:   `${k.jenis || ''} / ${k.merek || '-'}`.trim(),
    modelTahun:   `${k.model || ''} / ${k.tahun || '-'}`.trim(),
    warna:        k.warna || '-',
    noRangka:     '-', // Tidak ada di spec
    noMesin:      '-', // Tidak ada di spec
    noRangkaLast5: '-', // Tidak ada di spec
    masaBerlakuStnk: k.sdStnk || '-',
    tglJatuhTempo:   k.sdNotice  || '-',
    status:       'BELUM BAYAR',
    rincianPajak: {
      pkb:               p.pkb ?? 0,
      opsenPkb:          p.opkb ?? 0,
      dendaPkb:          p.dpkb ?? 0,
      dendaOpsenPkb:     p.odpkb ?? 0,
      swdkllj:           p.swd ?? 0,
      opsenDendaSwdkllj: p.dswd ?? 0,
      biayaAdmin:        0, // Tidak ada di spec
    },
    riwayat: (apiData.riwayatPembayaran || []).map((r) => ({
      tglBayar:    r.tanggalBayar || '-',
      masaBerlaku: '-', // Tidak ada di spec
      kodeBayar:   r.noReff || '-',
      metode:      r.metodePembayaran || '-',
      nominal:     r.total || 0,
      status:      'Berhasil',
    })),
    noReff: apiData.noReff || null
  }
}

const searchReal = async ({ nik, nopolAngka, nopolSeri, noRangkaLast5 }) => {
  try {
    const nopol = ('BL' + nopolAngka + (nopolSeri || '')).replace(/\\s+/g, '').toUpperCase()
    const response = await fetch(API_BASE_URL + '/sb/inq/sod/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nopol: nopol,
        nik: nik,
        rangka_last5: noRangkaLast5
      }),
    })

    if (!response.ok) throw new Error('HTTP ' + response.status)

    const responseBody = await response.json()
    
    // Status Code 3: Data Not Found
    if (responseBody.data?.statusCode === 3) {
      const vehicle = buildNotFoundVehicle({ nik, nopolAngka, nopolSeri, noRangkaLast5 }) // Assuming buildNotFoundVehicle is available
      return { status: 'notfound', vehicle, totalPajak: 0, message: responseBody.data?.statusText || 'Data kendaraan tidak ditemukan.' }
    }
    
    // Status Code 2: Validasi Pembayaran (e.g., Ganti Plat)
    if (responseBody.data?.statusCode === 2) {
      return { status: 'error', vehicle: null, totalPajak: 0, message: responseBody.data?.deskripsi || 'Validasi Pembayaran' }
    }

    if (!responseBody.success || responseBody.data?.statusCode !== 1) {
      return { status: 'error', vehicle: null, totalPajak: 0, message: responseBody.message || 'Terjadi kesalahan' }
    }

    const vehicle = transformResponse(responseBody.data, nik)
    return { status: 'found', vehicle, totalPajak: calculateTotalPajak(vehicle.rincianPajak), message: responseBody.data?.deskripsi || 'Data ditemukan' }
  } catch (err) {
    console.error('[vehicleApi]', err)
    return { status: 'error', vehicle: null, totalPajak: 0, message: 'Gagal menghubungi server. Periksa koneksi internet Anda.' }
  }
}

// ─── GENERATE KODE BAYAR (API REAL) ───────────────────────────────────────────
export const generateKodeBayarApi = async ({ nik, nopolAngka, nopolSeri, noRangkaLast5, noReff }) => {
  try {
    const nopol = ('BL' + nopolAngka + (nopolSeri || '')).replace(/\\s+/g, '').toUpperCase()
    const response = await fetch(API_BASE_URL + '/sb/inq/sod/kode_bayar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nopol: nopol,
        nik: nik,
        rangka_last5: noRangkaLast5,
        no_reff: noReff
      }),
    })

    if (!response.ok) throw new Error('HTTP ' + response.status)

    const responseBody = await response.json()
    
    if (!responseBody.success) {
      return { success: false, message: responseBody.message || 'Gagal generate kode bayar' }
    }

    return { 
      success: true, 
      data: responseBody.data 
    }
  } catch (err) {
    console.error('[vehicleApi generateKodeBayar]', err)
    return { success: false, message: 'Gagal menghubungi server.' }
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Fungsi utama — satu-satunya yang perlu diimport dari luar.
 * Otomatis memilih mock atau real berdasarkan USE_MOCK.
 *
 * @param {{ nik: string, nopolAngka: string, nopolSeri: string, noRangkaLast5: string }} params
 * @returns {Promise<VehicleResult>}
 */
export const searchVehicle = (params) => USE_MOCK ? searchMock(params) : searchReal(params)

// ─── LOKASI E-SAMSAT ACEH ───────────────────────────────────────────────────
const MOCK_LOCATIONS = [
  { type: 'STATIC', nama: 'Samsat Induk Banda Aceh', alamat: 'Jl. T. Nyak Arief No. 12, Banda Aceh', latitude: 5.5501, longitude: 95.3192 },
  { type: 'STATIC', nama: 'Samsat Induk Lhokseumawe', alamat: 'Jl. Merdeka No. 45, Lhokseumawe', latitude: 5.1801, longitude: 97.1507 },
  
  { type: 'MOBILE', nama: 'Samsat Keliling Banda Aceh 1', hariOperasi: 'Senin - Kamis', jadwalOperasi: '08:30 - 14:00 WIB', tempatOperasi: 'Lapangan Blang Padang' },
  { type: 'MOBILE', nama: 'Samsat Keliling Banda Aceh 2', hariOperasi: 'Jumat', jadwalOperasi: '08:30 - 11:30 WIB', tempatOperasi: 'Masjid Raya Baiturrahman' },
  { type: 'MOBILE', nama: 'Samsat Keliling Lhokseumawe', hariOperasi: 'Selasa - Rabu', jadwalOperasi: '09:00 - 13:00 WIB', tempatOperasi: 'Terminal Lhokseumawe' },

  { type: 'MOBILE', nama: 'Samsat Jempol Banda Aceh', hariOperasi: 'Sabtu - Minggu', jadwalOperasi: '16:00 - 21:00 WIB', tempatOperasi: 'Taman Bustanussalatin (Taman Sari)' },
  { type: 'MOBILE', nama: 'Samsat Jempol Langsa', hariOperasi: 'Sabtu', jadwalOperasi: '15:00 - 20:00 WIB', tempatOperasi: 'Alun-alun Kota Langsa' },

  { type: 'MPP', nama: 'MPP Pasar Aceh Lantai 3', alamat: 'Jl. Diponegoro No. 1', kota: 'Banda Aceh' },
  { type: 'MPP', nama: 'MPP Kota Lhokseumawe', alamat: 'Jl. Merdeka No. 45', kota: 'Lhokseumawe' },
  { type: 'MPP', nama: 'MPP Kota Langsa', alamat: 'Jl. Jend. Sudirman No. 12', kota: 'Langsa' }
];

export const getSamsatLocations = async () => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulasi loading
    return {
      success: true,
      message: 'Berhasil mengambil data lokasi',
      data: MOCK_LOCATIONS
    }
  } else {
    try {
      const response = await fetch(API_BASE_URL + '/samsat-locations')
      if (!response.ok) throw new Error('HTTP ' + response.status)
      return await response.json() // Asumsi struktur { success, message, data: [] }
    } catch (err) {
      console.error('[getSamsatLocations]', err)
      return { success: false, message: 'Gagal menghubungi server.', data: [] }
    }
  }
}
