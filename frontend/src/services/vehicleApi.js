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
const USE_MOCK = false

/** Base URL API backend. Digunakan saat USE_MOCK = false. */
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api-backend' : 'https://api.samsatdigital.net')

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

  const pkb = Math.floor(Math.random() * (4000000 - 500000 + 1) + 500000)
  const swd = 35000

  return {
    statusCode: 1,
    statusText: 'OK',
    deskripsi: 'Data simulasi ditampilkan untuk ' + nopol,
    kendaraan: {
      nopol,
      nik: nik || '1171000000000001',
      jenis: 'MOTOR',
      merek: 'HONDA',
      model: 'VARIO',
      tipe: 'MATIC',
      tahun: '2022',
      warna: 'HITAM',
      sdStnk: '12 AGUSTUS 2028',
      sdNotice: '12 AGUSTUS 2024'
    },
    pajak: {
      pkb: pkb,
      opkb: Math.floor(pkb * 0.1),
      dpkb: 0,
      odpkb: 0,
      swd: swd,
      dswd: 0,
      total: pkb + Math.floor(pkb * 0.1) + swd,
      tglTtp: '12 AGUSTUS 2024',
      sdNoticeYad: '12 AGUSTUS 2025'
    },
    noReff: 'simulated_reff_123',
    riwayatPembayaran: [],
    nopolClean,
    noRangkaLast5: noRangkaLast5 || '12345'
  }
}

/** Menerapkan NIK input user ke data kendaraan yang ditemukan. */
const applyUserInput = (vehicle, inputNik) => {
  if (!inputNik) return vehicle;
  return {
    ...vehicle,
    kendaraan: {
      ...vehicle.kendaraan,
      nik: inputNik
    }
  }
}

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
      totalPajak: calculateTotalPajak(vehicle.pajak),
      message: 'Data ditemukan untuk kendaraan ' + vehicle.kendaraan.nopol,
    }
  }

  // Tampilkan data yang persis diinput user dengan nilai pajak simulasi
  const vehicle = generateDummyVehicle({ nik, nopolAngka, nopolSeri, noRangkaLast5 })
  return {
    status: 'found',
    vehicle,
    totalPajak: calculateTotalPajak(vehicle.pajak),
    message: 'Data simulasi ditampilkan untuk ' + vehicle.kendaraan.nopol,
  }
}

// ─── IMPLEMENTASI API REAL ────────────────────────────────────────────────────

/**
 * Transform response JSON backend → format Vehicle aplikasi.
 * Sesuaikan mapping field di fungsi ini jika struktur API backend berbeda.
 */
const transformResponse = (apiData, inputNik) => {
  const k = apiData.kendaraan || {}

  return {
    statusCode: apiData.statusCode,
    statusText: apiData.statusText,
    deskripsi: apiData.deskripsi,
    kendaraan: {
      ...k,
      nik: inputNik || k.nik || '-'
    },
    pajak: apiData.pajak || {},
    noReff: apiData.noReff || null,
    riwayatPembayaran: apiData.riwayatPembayaran || [],
    nopolClean: (k.nopol || '').replace(/\s+/g, '').toUpperCase(),
  }
}

const searchReal = async ({ nik, nopolAngka, nopolSeri, noRangkaLast5 }) => {
  try {
    const nopol = ('BL' + nopolAngka + (nopolSeri || '')).replace(/\s+/g, '').toUpperCase()
    const payload = {
      nopol: nopol,
      nik: nik.replace(/\s+/g, ''),
      rangka_last5: noRangkaLast5.replace(/\s+/g, '')
    }
    console.log('[searchReal] Sending payload:', payload)

    const response = await fetch(API_BASE_URL + '/sb/inq/sod/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.error('[searchReal] HTTP', response.status, errBody)
      // 400 biasanya berarti validasi format gagal atau data tidak ada di server
      if (response.status === 400) {
        return { status: 'error', vehicle: null, totalPajak: 0, message: 'Server tidak dapat memproses data. Pastikan NIK, Nomor Polisi, dan Nomor Rangka sudah benar dan terdaftar di Samsat.' }
      }
      return { status: 'error', vehicle: null, totalPajak: 0, message: 'Server tidak merespon. Silakan coba beberapa saat lagi.' }
    }

    const responseBody = await response.json()
    console.log('[searchReal] Response:', responseBody)

    // Status Code 3: Data Not Found
    if (responseBody.data?.statusCode === 3) {
      const vehicle = buildNotFoundVehicle({ nik, nopolAngka, nopolSeri, noRangkaLast5 })
      return { status: 'notfound', vehicle, totalPajak: 0, message: responseBody.data?.statusText || 'Data kendaraan tidak ditemukan.' }
    }

    // Status Code 2: Validasi Pembayaran (e.g., Ganti Plat / Pembayaran Online Tidak Tersedia)
    if (responseBody.data?.statusCode === 2) {
      const vehicle = transformResponse(responseBody.data, nik)
      vehicle.statusCode = 2
      vehicle.canPayOnline = false
      vehicle.status = 'VALIDASI'
      vehicle.deskripsi = responseBody.data?.deskripsi || 'Validasi Pembayaran'
      return { 
        status: 'found', 
        vehicle, 
        totalPajak: calculateTotalPajak(vehicle.pajak), 
        message: responseBody.data?.deskripsi || 'Validasi Pembayaran' 
      }
    }

    if (!responseBody.success || responseBody.data?.statusCode !== 1) {
      return { status: 'error', vehicle: null, totalPajak: 0, message: responseBody.message || 'Terjadi kesalahan' }
    }

    const vehicle = transformResponse(responseBody.data, nik)
    vehicle.statusCode = 1
    vehicle.canPayOnline = true
    return { status: 'found', vehicle, totalPajak: calculateTotalPajak(vehicle.pajak), message: responseBody.data?.deskripsi || 'Data ditemukan' }
  } catch (err) {
    console.error('[vehicleApi]', err)
    return { status: 'error', vehicle: null, totalPajak: 0, message: 'Gagal menghubungi server. Periksa koneksi internet Anda.' }
  }
}

// ─── GENERATE KODE BAYAR (API REAL) ───────────────────────────────────────────
export const generateKodeBayarApi = async ({ nik, nopolAngka, nopolSeri, noRangkaLast5, noReff }) => {
  try {
    const nopol = ('BL' + nopolAngka + (nopolSeri || '')).replace(/\s+/g, '').toUpperCase()
    const payload = {
      nopol: nopol,
      nik: nik.replace(/\s+/g, ''),
      rangka_last5: noRangkaLast5.replace(/\s+/g, ''),
      no_reff: noReff
    }
    console.log('[generateKodeBayarApi] Sending payload:', payload)

    const response = await fetch(API_BASE_URL + '/sb/inq/sod/kode_bayar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

/**
 * Generate kode bayar (virtual account)
 * Otomatis memilih mock atau real berdasarkan USE_MOCK.
 */
export const generateKodeBayar = async (params) => {
  if (USE_MOCK) {
    const randomCode = '982' + Math.floor(100000001 + Math.random() * 899999999)
    return { success: true, data: { kd_bayar: randomCode, sse_subsribe: 'mock-sse-id-123' } }
  }
  return generateKodeBayarApi(params)
}

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
