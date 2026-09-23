/**
 * @file vehicleApi.js
 * @description Lapisan layanan (service layer) untuk data kendaraan.
 */

import { calculateTotalPajak } from '../data/mockData'
import { API_BASE_URL } from '../constants/env'

// ─── KONFIGURASI ──────────────────────────────────────────────────────────────

/** Base URL API backend. 
 * Saat development, gunakan proxy '/api-backend'. 
 * Saat production, gunakan VITE_API_URL dari .env.production.
 * Dikonfigurasi secara terpusat di src/constants/env.js
 */

// ─── TIPE HASIL ───────────────────────────────────────────────────────────────
/**
 * @typedef {Object} VehicleResult
 * @property {'found'|'notfound'|'error'} status
 * @property {Object|null} vehicle
 * @property {number} totalPajak
 * @property {string} message
 */

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
    // console.log('[searchReal] Sending payload:', payload)

    const response = await fetch(API_BASE_URL + '/sb/inq/sod/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      // console.error('[searchReal] HTTP', response.status, errBody)
      // 400 biasanya berarti validasi format gagal atau data tidak ada di server
      if (response.status === 400) {
        return { status: 'error', vehicle: null, totalPajak: 0, message: 'Server tidak dapat memproses data. Pastikan NIK, Nomor Polisi, dan Nomor Rangka sudah benar dan terdaftar di Samsat.' }
      }
      return { status: 'error', vehicle: null, totalPajak: 0, message: 'Server tidak merespon. Silakan coba beberapa saat lagi.' }
    }

    const responseBody = await response.json()
    // console.log('[searchReal] Response:', responseBody)

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
    // console.error('[vehicleApi]', err)
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
    // console.log('[generateKodeBayarApi] Sending payload:', payload)

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
 *
 * @param {{ nik: string, nopolAngka: string, nopolSeri: string, noRangkaLast5: string }} params
 * @returns {Promise<VehicleResult>}
 */
export const searchVehicle = (params) => searchReal(params)

/**
 * Generate kode bayar (virtual account)
 */
export const generateKodeBayar = async (params) => {
  return generateKodeBayarApi(params)
}

// ─── LOKASI E-SAMSAT ACEH ───────────────────────────────────────────────────

export const getSamsatLocations = async () => {
  try {
    const response = await fetch(API_BASE_URL + '/samsat-locations')
    if (!response.ok) throw new Error('HTTP ' + response.status)
    return await response.json() // Asumsi struktur { success, message, data: [] }
  } catch (err) {
    console.error('[getSamsatLocations]', err)
    return { success: false, message: 'Gagal menghubungi server.', data: [] }
  }
}
