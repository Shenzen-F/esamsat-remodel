import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useESamsatStore = defineStore('eSamsat', () => {
  // State untuk Data Kendaraan & Pajak
  const vehicleData = ref(null)
  const taxData = ref(null)
  
  // State untuk Status API Cek Pajak
  // 1: Bisa bayar, 2: Sudah bayar (hide tombol), 3: Data tidak valid
  const cekPajakStatusCode = ref(null) 
  const cekPajakMessage = ref('')

  // State untuk Status Pembayaran (SSE)
  const paymentStatus = ref(null) // 'PENDING', 'SUCCESS', 'FAILED'
  const paymentDetails = ref(null)

  // State untuk Lokasi Samsat
  const samsatLocations = ref([])

  // Actions
  const setCekPajakResult = (statusCode, message, kendaraan = null, pajak = null) => {
    cekPajakStatusCode.value = statusCode
    cekPajakMessage.value = message
    if (statusCode === 1 || statusCode === 2) {
      vehicleData.value = kendaraan
      taxData.value = pajak
    } else {
      vehicleData.value = null
      taxData.value = null
    }
  }

  const setPaymentStatus = (status, details = null) => {
    paymentStatus.value = status
    if (details) {
      paymentDetails.value = details
    }
  }

  const setSamsatLocations = (locations) => {
    samsatLocations.value = locations
  }

  const resetState = () => {
    vehicleData.value = null
    taxData.value = null
    cekPajakStatusCode.value = null
    cekPajakMessage.value = ''
    paymentStatus.value = null
    paymentDetails.value = null
  }

  return {
    // State
    vehicleData,
    taxData,
    cekPajakStatusCode,
    cekPajakMessage,
    paymentStatus,
    paymentDetails,
    samsatLocations,

    // Actions
    setCekPajakResult,
    setPaymentStatus,
    setSamsatLocations,
    resetState
  }
})
