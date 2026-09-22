<!--
  @component PaymentModal.vue
  @description Modal overlay untuk proses pembayaran pajak kendaraan.
  Menampilkan kode bayar (Virtual Account), countdown batas waktu,
  panduan pembayaran (ATM Bank Aceh & ACTION Mobile), dan tombol simulasi bayar (demo).
  Mendukung SSE (Server-Sent Events) untuk notifikasi pembayaran real-time dari backend.
  Setelah pembayaran berhasil, menampilkan bukti pembayaran (resi digital).
  @props vehicle {Object} - Data kendaraan yang sedang dibayar
  @props totalPajak {number} - Total tagihan pajak yang harus dibayar
  @emits close - Dikirim saat pengguna menutup modal
  @emits payment-success - Dikirim saat pembayaran berhasil, membawa (nopolClean, kodeBayar)
-->
<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { X, Copy, Check, QrCode, Sparkles, ShieldCheck, ChevronDown, ChevronUp, Radio, Wifi } from '@lucide/vue'
import { useESamsatStore } from '../stores/eSamsatStore'

// Key for storing paid vehicle info
const PAID_KEY = 'esamsat_paid_vehicles'

const props = defineProps({
  vehicle: { type: Object, required: true },
  totalPajak: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'payment-success'])

const eSamsatStore = useESamsatStore()

const copied = ref(false)
const copiedSse = ref(false)
const isSuccess = ref(false)
const kodeBayar = ref('')
const sseSubscribeId = ref('')
const sseStatus = ref('connecting') // 'connecting' | 'connected' | 'error' | 'success'

// Determine if this vehicle has already been paid
const hasPaid = computed(() => {
  try {
    const paid = JSON.parse(localStorage.getItem(PAID_KEY)) || {}
    return !!paid[props.vehicle.nopolClean]
  } catch (e) {
    return false
  }
})
const countdown = ref(23 * 3600 + 59 * 60 + 59)
let countdownTimer = null

const activePaymentGuide = ref(null)

/**
 * Mengganti panduan pembayaran mana yang sedang dibuka (ATM / Action Mobile).
 * Jika ditekan lagi, akan menutup panduan (toggle).
 * @param {string} type - Jenis panduan ('atm' atau 'action')
 */
const togglePaymentGuide = (type) => {
  if (activePaymentGuide.value === type) {
    activePaymentGuide.value = null
  } else {
    activePaymentGuide.value = type
  }
}

const sseInstance = ref(null)

/**
 * Handler pemrosesan event pembayaran dari SSE.
 */
const handlePaymentSuccessEvent = (rawPayload) => {
  console.log('[SSE] Pembayaran berhasil diterima:', rawPayload)
  sseStatus.value = 'success'
  isSuccess.value = true
  
  eSamsatStore.setPaymentStatus('SUCCESS', rawPayload)
  emit('payment-success', props.vehicle.nopolClean, kodeBayar.value)
  closeSSE()
}

/**
 * Inisialisasi koneksi Server-Sent Events (SSE) untuk mendapatkan status pembayaran
 * dari backend secara real-time.
 * @param {string} subscribeId - ID subscribe SSE dari API.
 */
const initPaymentStatusSSE = (subscribeId) => {
  if (!subscribeId) {
    console.warn('[SSE] ID sse_subsribe tidak ditemukan, SSE tidak dapat dijalankan.')
    sseStatus.value = 'error'
    return
  }

  sseSubscribeId.value = subscribeId
  sseStatus.value = 'connecting'

  // URL SSE sesuai dengan spesifikasi API Samsat Digital
  const sseUrl = `https://notify.samsatdigital.net/sse/streams?id=${subscribeId}`
  console.log(`[SSE] Menghubungkan ke ${sseUrl}...`)

  try {
    sseInstance.value = new EventSource(sseUrl)

    sseInstance.value.onopen = () => {
      console.log(`[SSE] Terhubung ke channel stream: ${subscribeId}`)
      sseStatus.value = 'connected'
    }

    const processMessageData = (rawText) => {
      try {
        const data = typeof rawText === 'object' ? rawText : JSON.parse(rawText)
        console.log('[SSE] Data event diterima:', data)

        // Verifikasi berbagai kemungkinan format sukses pembayaran
        const isPaid =
          data.status === 'LUNAS' ||
          data.status === 'SUCCESS' ||
          data.status === 'PAID' ||
          data.statusCode === 1 ||
          data.success === true ||
          (data.data && (data.data.status === 'SUCCESS' || data.data.status === 'LUNAS'))

        if (isPaid) {
          handlePaymentSuccessEvent(data)
        }
      } catch (err) {
        // Jika data dikirim berupa teks biasa 'LUNAS' atau 'SUCCESS'
        const cleanStr = String(rawText || '').trim().toUpperCase()
        if (cleanStr === 'LUNAS' || cleanStr === 'SUCCESS' || cleanStr === 'PAID') {
          handlePaymentSuccessEvent({ status: cleanStr })
        } else {
          console.log('[SSE] Pesan teks mentah:', rawText)
        }
      }
    }

    sseInstance.value.onmessage = (event) => {
      processMessageData(event.data)
    }

    // Tangani kemungkinan custom event name dari backend
    sseInstance.value.addEventListener('payment', (event) => {
      processMessageData(event.data)
    })
    sseInstance.value.addEventListener('status', (event) => {
      processMessageData(event.data)
    })
    sseInstance.value.addEventListener('notification', (event) => {
      processMessageData(event.data)
    })

    sseInstance.value.onerror = (err) => {
      console.warn('[SSE] Koneksi terputus atau mencoba reconnect...', err)
      sseStatus.value = 'error'
    }
  } catch (error) {
    console.error('[SSE] Browser tidak mendukung EventSource atau inisialisasi gagal:', error)
    sseStatus.value = 'error'
  }
}

/**
 * Menutup koneksi Server-Sent Events (SSE) agar tidak terjadi memory leak.
 */
const closeSSE = () => {
  if (sseInstance.value) {
    console.log('[SSE] Menutup koneksi SSE...')
    sseInstance.value.close()
    sseInstance.value = null
  }
}

onMounted(() => {
  if (hasPaid.value) {
    const paid = JSON.parse(localStorage.getItem(PAID_KEY)) || {}
    const record = paid[props.vehicle.nopolClean]
    if (record && record.kodeBayar) {
      kodeBayar.value = record.kodeBayar
    }
    isSuccess.value = true
    return
  }

  const storageKey = `kodebayar_${props.vehicle.nopolClean}`
  const sseKey = `sse_${props.vehicle.nopolClean}`
  let currentSseId = sessionStorage.getItem(sseKey)

  if (!kodeBayar.value) {
    const savedCode = sessionStorage.getItem(storageKey)
    if (savedCode) {
      kodeBayar.value = savedCode
    } else {
      const randomCode = '812' + Math.floor(1000000000 + Math.random() * 8999999999)
      kodeBayar.value = randomCode
      currentSseId = `once-s-${randomCode}`
      
      sessionStorage.setItem(storageKey, randomCode)
      sessionStorage.setItem(sseKey, currentSseId)
    }
  }

  if (!currentSseId) {
    currentSseId = `once-s-${kodeBayar.value}`
    sessionStorage.setItem(sseKey, currentSseId)
  }

  sseSubscribeId.value = currentSseId

  console.log(`\n===========================================`)
  console.log(`[DEV] KODE BAYAR: ${kodeBayar.value}`)
  console.log(`[DEV] SSE SUBSCRIBE CHANNEL ID: ${currentSseId}`)
  console.log(`[DEV] SSE URL: https://notify.samsatdigital.net/sse/streams?id=${currentSseId}`)
  console.log(`[DEV] Untuk simulasi pembayaran manual dari Console:`)
  console.log(`%cwindow.simulatePayment('${currentSseId}')`, 'background: #222; color: #bada55; padding: 4px; border-radius: 4px; font-weight: bold;')
  console.log(`===========================================\n`)

  // Global function for manual trigger via console
  window.simulatePayment = (sseId, customData = null) => {
    if (!sseId || sseId === currentSseId || sseId === kodeBayar.value) {
      console.log(`[DEV] Simulasi event bayar berhasil untuk SSE ID: ${currentSseId}`)
      handlePaymentSuccessEvent(customData || { status: 'SUCCESS', message: 'Simulasi Pembayaran Berhasil' })
      return 'Berhasil mensimulasikan pembayaran SSE!'
    } else {
      console.warn(`[DEV] Gagal: SSE ID tidak cocok. Diharapkan: ${currentSseId}, Dimasukkan: ${sseId}`)
      return 'Gagal mensimulasikan pembayaran. SSE ID tidak cocok.'
    }
  }

  // Mulai subscribe status pembayaran lewat SSE
  initPaymentStatusSSE(currentSseId)

  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  // Selalu bersihkan koneksi SSE saat modal ditutup
  closeSSE()
})

/**
 * Memformat sisa waktu hitung mundur menjadi format HH:MM:SS.
 * @returns {string} String waktu yang sudah diformat.
 */
const formatCountdown = () => {
  const h = Math.floor(countdown.value / 3600)
  const m = Math.floor((countdown.value % 3600) / 60)
  const s = countdown.value % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

/**
 * Menyalin kode bayar (Virtual Account) ke clipboard (papan klip) sistem pengguna.
 */
const handleCopy = () => {
  navigator.clipboard.writeText(kodeBayar.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

/**
 * Menyalin channel ID SSE untuk simulasi backend.
 */
const handleCopySse = () => {
  if (!sseSubscribeId.value) return
  navigator.clipboard.writeText(sseSubscribeId.value)
  copiedSse.value = true
  setTimeout(() => {
    copiedSse.value = false
  }, 2000)
}

// Show receipt directly for already paid vehicle
const showReceiptForPaid = () => {
  isSuccess.value = true
  emit('payment-success', props.vehicle.nopolClean, kodeBayar.value)
}

/**
 * Memformat angka nominal menjadi mata uang Rupiah (contoh: Rp 150.000).
 * @param {number} val - Nominal angka
 * @returns {string} Teks format Rupiah
 */
const formatRupiah = (val) => 'Rp ' + val.toLocaleString('id-ID')
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-card" @click.stop>
      <button class="modal-close" @click="emit('close')">
        <X :size="18" />
      </button>

      <div v-if="!isSuccess">
        <div style="text-align: center; margin-bottom: 1.25rem">
          <div
            style="
              width: 52px;
              height: 52px;
              border-radius: 12px;
              background: #e0f2fe;
              color: #028090;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 0.75rem auto
            "
          >
            <QrCode :size="28" />
          </div>
          <h3 style="font-size: 1.2rem; font-weight: 800; color: #0f172a">
            Kode Pembayaran e-Samsat
          </h3>
          <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem">
            Gunakan kode bayar ini pada aplikasi Action Bank Aceh atau PT Pos
          </p>
        </div>

        <div class="code-box">
          <span style="font-size: 0.75rem; color: #64748b; font-weight: 700">
            KODE BAYAR / VIRTUAL ACCOUNT
          </span>
          <div class="code-number">{{ kodeBayar }}</div>
          <button
            class="btn-outline"
            style="margin: 0.5rem auto 0 auto; padding: 0.4rem 1rem; font-size: 0.8rem; width: auto"
            @click="handleCopy"
          >
            <Check v-if="copied" :size="14" color="#16a34a" />
            <Copy v-else :size="14" />
            {{ copied ? 'Tersalin!' : 'Salin Kode Bayar' }}
          </button>
        </div>

        <!-- Real-time SSE Live Status Card -->
        <div
          class="sse-status-card"
          style="
            margin-top: 0.75rem;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 10px;
            padding: 0.65rem 0.85rem;
            text-align: left;
          "
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <div style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.75rem; font-weight: 700;">
              <span v-if="sseStatus === 'connected'" class="sse-pulse-dot"></span>
              <span v-else-if="sseStatus === 'connecting'" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #eab308;"></span>
              <span v-else style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>

              <span :style="{ color: sseStatus === 'connected' ? '#166534' : (sseStatus === 'connecting' ? '#854d0e' : '#991b1b') }">
                {{ sseStatus === 'connected' ? 'Monitoring Status Real-time (SSE Aktif)' : (sseStatus === 'connecting' ? 'Menghubungkan ke SSE...' : 'SSE Terputus (Auto Reconnect)') }}
              </span>
            </div>
            <button
              v-if="sseSubscribeId"
              type="button"
              @click="handleCopySse"
              title="Salin ID SSE untuk publish dari Backend"
              style="background: transparent; border: none; cursor: pointer; color: #166534; font-size: 0.65rem; display: flex; align-items: center; gap: 0.25rem; font-weight: 600; padding: 0.1rem 0.3rem;"
            >
              <Check v-if="copiedSse" :size="12" color="#16a34a" />
              <Copy v-else :size="12" />
              {{ copiedSse ? 'ID Tersalin' : 'Salin ID SSE' }}
            </button>
          </div>
          <div style="font-size: 0.68rem; color: #15803d; font-family: monospace; word-break: break-all;">
            Channel: <strong>{{ sseSubscribeId || 'Menunggu inisialisasi...' }}</strong>
          </div>
        </div>

        <!-- Panduan Pembayaran Dropdown -->
        <div class="payment-guides" style="margin-top: 1rem; text-align: left;">
          <h4 style="font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; text-transform: uppercase;">
            Panduan Cara Pembayaran :
          </h4>

          <!-- ATM Bank Aceh -->
          <div class="guide-dropdown-item" style="border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; overflow: hidden; background: #ffffff;">
            <button 
              type="button"
              @click="togglePaymentGuide('atm')"
              style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: #f8fafc; border: none; font-size: 0.8rem; font-weight: 600; color: #1e293b; cursor: pointer; text-align: left;"
            >
              <span>ATM Bank Aceh</span>
              <ChevronUp v-if="activePaymentGuide === 'atm'" :size="16" />
              <ChevronDown v-else :size="16" />
            </button>
            <div v-show="activePaymentGuide === 'atm'" style="padding: 0.75rem 0.85rem; font-size: 0.75rem; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0;">
              <ol style="margin: 0; padding-left: 1.15rem;">
                <li>Dapatkan Kode Bayar di situs <a href="https://esamsat.acehprov.go.id/" target="_blank" style="color: #028090; font-weight: 600; text-decoration: underline;">e-Samsat Aceh</a> menggunakan data nopol, nomor rangka, dan NIK.</li>
                <li>Datangi ATM Bank Aceh terdekat.</li>
                <li>Masukkan kartu ATM beserta PIN Anda.</li>
                <li>Pilih menu <strong>Pembayaran</strong> pada layar utama.</li>
                <li>Pilih menu <strong>Samsat Aceh</strong> (atau Pajak Kendaraan).</li>
                <li>Masukkan <strong>Kode Bayar</strong> yang sudah dicatat dari e-Samsat.</li>
                <li>Periksa kesesuaian data kendaraan dan nominal tagihan yang tertera.</li>
                <li>Tekan <strong>Bayar</strong> atau <strong>Ya</strong> untuk menyelesaikan transaksi.</li>
                <li>Ambil dan simpan struk ATM sebagai bukti pembayaran sah.</li>
              </ol>
            </div>
          </div>

          <!-- ACTION Mobile -->
          <div class="guide-dropdown-item" style="border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; overflow: hidden; background: #ffffff;">
            <button 
              type="button"
              @click="togglePaymentGuide('action')"
              style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: #f8fafc; border: none; font-size: 0.8rem; font-weight: 600; color: #1e293b; cursor: pointer; text-align: left;"
            >
              <span>ACTION Mobile Bank Aceh</span>
              <ChevronUp v-if="activePaymentGuide === 'action'" :size="16" />
              <ChevronDown v-else :size="16" />
            </button>
            <div v-show="activePaymentGuide === 'action'" style="padding: 0.75rem 0.85rem; font-size: 0.75rem; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0;">
              <ol style="margin: 0; padding-left: 1.15rem;">
                <li>Buka dan login ke aplikasi <strong>Action Mobile</strong>.</li>
                <li>Pilih menu <strong>Layanan</strong> pada halaman utama. Pilih kategori <strong>Pajak & Retribusi</strong>, lalu pilih <strong>Samsat Aceh</strong> (atau Samsatkan).</li>
                <li>Masukkan <strong>Kode Bayar</strong> yang sudah didapatkan dari situs e-Samsat.</li>
                <li>Periksa rincian tagihan kendaraan yang tampil di layar.</li>
                <li>Masukkan PIN <strong>Action Mobile</strong> untuk menyelesaikan transaksi.</li>
                <li>Simpan bukti pembayaran digital.</li>
              </ol>
            </div>
          </div>

          <!-- Teller Bank Aceh Syariah -->
          <div class="guide-dropdown-item" style="border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; overflow: hidden; background: #ffffff;">
            <button 
              type="button"
              @click="togglePaymentGuide('teller')"
              style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: #f8fafc; border: none; font-size: 0.8rem; font-weight: 600; color: #1e293b; cursor: pointer; text-align: left;"
            >
              <span>Teller Bank Aceh Syariah</span>
              <ChevronUp v-if="activePaymentGuide === 'teller'" :size="16" />
              <ChevronDown v-else :size="16" />
            </button>
            <div v-show="activePaymentGuide === 'teller'" style="padding: 0.75rem 0.85rem; font-size: 0.75rem; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0;">
              <ol style="margin: 0; padding-left: 1.15rem;">
                <li>Datangi kantor cabang Bank Aceh Syariah terdekat.</li>
                <li>Sampaikan kepada Teller bahwa Anda ingin membayar Pajak Kendaraan (Samsat Aceh).</li>
                <li>Berikan <strong>Kode Bayar</strong> yang sudah didapatkan dari situs e-Samsat kepada Teller.</li>
                <li>Serahkan uang tunai sesuai dengan nominal tagihan yang disebutkan oleh Teller.</li>
                <li>Simpan bukti pembayaran (resi/struk) yang diberikan oleh Teller sebagai bukti yang sah.</li>
              </ol>
            </div>
          </div>

          <!-- Loket PT. POS Indonesia -->
          <div class="guide-dropdown-item" style="border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; overflow: hidden; background: #ffffff;">
            <button 
              type="button"
              @click="togglePaymentGuide('pos')"
              style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: #f8fafc; border: none; font-size: 0.8rem; font-weight: 600; color: #1e293b; cursor: pointer; text-align: left;"
            >
              <span>Loket PT. POS Indonesia</span>
              <ChevronUp v-if="activePaymentGuide === 'pos'" :size="16" />
              <ChevronDown v-else :size="16" />
            </button>
            <div v-show="activePaymentGuide === 'pos'" style="padding: 0.75rem 0.85rem; font-size: 0.75rem; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0;">
              <ol style="margin: 0; padding-left: 1.15rem;">
                <li>Datangi kantor cabang atau loket PT. POS Indonesia terdekat.</li>
                <li>Sampaikan kepada petugas loket bahwa Anda ingin membayar Pajak Kendaraan (Samsat Aceh).</li>
                <li>Berikan <strong>Kode Bayar</strong> yang sudah didapatkan dari situs e-Samsat.</li>
                <li>Serahkan uang tunai sesuai dengan nominal tagihan pajak beserta biaya admin (jika ada).</li>
                <li>Simpan resi pembayaran yang dicetak oleh petugas POS sebagai bukti yang sah.</li>
              </ol>
            </div>
          </div>

          <!-- Aplikasi PosPay -->
          <div class="guide-dropdown-item" style="border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; overflow: hidden; background: #ffffff;">
            <button 
              type="button"
              @click="togglePaymentGuide('pospay')"
              style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: #f8fafc; border: none; font-size: 0.8rem; font-weight: 600; color: #1e293b; cursor: pointer; text-align: left;"
            >
              <span>Aplikasi PosPay</span>
              <ChevronUp v-if="activePaymentGuide === 'pospay'" :size="16" />
              <ChevronDown v-else :size="16" />
            </button>
            <div v-show="activePaymentGuide === 'pospay'" style="padding: 0.75rem 0.85rem; font-size: 0.75rem; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0;">
              <ol style="margin: 0; padding-left: 1.15rem;">
                <li>Buka dan login ke aplikasi <strong>PosPay</strong>.</li>
                <li>Pilih menu <strong>Pajak / Samsat</strong>.</li>
                <li>Masukkan <strong>Kode Bayar</strong> yang sudah didapatkan dari situs e-Samsat.</li>
                <li>Periksa kesesuaian data kendaraan dan nominal tagihan yang tertera di layar.</li>
                <li>Lanjutkan proses pembayaran dengan memasukkan PIN aplikasi PosPay Anda.</li>
                <li>Simpan bukti pembayaran digital sebagai bukti yang sah.</li>
              </ol>
            </div>
          </div>
        </div>

        <div class="modal-countdown-banner">
          <div>
            <span style="font-size: 0.75rem; color: #64748b; display: block" v-if="vehicle.kendaraan">
              Total Tagihan Pajak ({{ vehicle.kendaraan.nopol }})
            </span>
            <strong style="font-size: 1.15rem; color: #0f172a; font-weight: 800">
              {{ formatRupiah(totalPajak) }}
            </strong>
          </div>
          <div style="text-align: right" class="modal-countdown-timer">
            <span
              style="font-size: 0.7rem; font-weight: 700; display: block"
              :style="{ color: countdown <= 300 ? '#ef4444' : (countdown <= 3600 ? '#f59e0b' : '#ef4444') }"
            >
              Batas Waktu: {{ formatCountdown() }}
            </span>
            <span v-if="countdown <= 300" style="font-size: 0.62rem; color: #ef4444; font-weight: 600">
              Waktu hampir habis!
            </span>
          </div>
        </div>

      </div>

      <div v-else style="text-align: center; padding: 0.5rem 0">
        <div
          style="
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #dcfce7;
            color: #16a34a;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem auto
          "
        >
          <ShieldCheck :size="36" />
        </div>

        <h3 style="font-size: 1.35rem; font-weight: 800; color: #16a34a">
          Pembayaran Berhasil!
        </h3>
        <p style="font-size: 0.825rem; color: #64748b; margin-top: 0.2rem; margin-bottom: 1.5rem">
          Bukti Pengesahan STNK Digital e-Samsat Aceh telah terbit.
        </p>

        <div
          id="printable-receipt"
          class="printable-receipt-card"
          style="
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem;
            text-align: left;
            margin-bottom: 1.5rem;
            font-size: 0.825rem
          "
        >
          <div
            style="
              border-bottom: 1.5px dashed #cbd5e1;
              padding-bottom: 0.75rem;
              margin-bottom: 0.75rem;
              display: flex;
              justify-content: space-between;
              align-items: center
            "
          >
            <div>
              <strong style="color: #007a7c; font-size: 0.9rem">e-Samsat Provinsi Aceh</strong>
              <div style="font-size: 0.7rem; color: #64748b">TANDA BUKTI PELUNASAN KEWAJIBAN PEMBAYARAN</div>
            </div>
            <div style="font-size: 0.7rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 0.2rem 0.5rem; border-radius: 4px">
              LUNAS
            </div>
          </div>

          <div class="modal-receipt-grid" v-if="vehicle.kendaraan">
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">NOPOL:</span>
              <strong>{{ vehicle.kendaraan.nopol }}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">NIK:</span>
              <strong>{{ vehicle.kendaraan.nik }}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">KODE BAYAR:</span>
              <strong>{{ kodeBayar }}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">TANGGAL BAYAR:</span>
              <strong>{{ (vehicle.riwayatPembayaran && vehicle.riwayatPembayaran[0]) ? vehicle.riwayatPembayaran[0].tanggalBayar : new Date().toLocaleDateString('id-ID') }}</strong>
            </div>
          </div>

          <div
            style="
              background: #f8fafc;
              padding: 0.65rem 0.85rem;
              border-radius: 6px;
              display: flex;
              justify-content: space-between;
              font-weight: 700;
              color: #0f172a
            "
          >
            <span>TOTAL DIBAYAR:</span>
            <span>{{ formatRupiah(totalPajak) }}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem">
          <button class="btn-outline" style="flex: 1" @click="emit('close')">
            Selesai
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
