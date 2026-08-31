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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { X, Copy, Check, QrCode, Sparkles, ShieldCheck, ChevronDown, ChevronUp } from '@lucide/vue'

const props = defineProps({
  vehicle: { type: Object, required: true },
  totalPajak: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'payment-success'])

const copied = ref(false)
const isProcessing = ref(false)
const isSuccess = ref(props.vehicle.status === 'LUNAS')
const kodeBayar = ref('')
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

// KELOLA SSE (Server-Sent Events)
// Aktifkan flag ini (ubah menjadi true) jika endpoint SSE di backend sudah siap digunakan
const USE_REAL_SSE = ref(false)

/**
 * Inisialisasi koneksi Server-Sent Events (SSE) untuk mendapatkan status pembayaran
 * dari backend secara real-time.
 * @param {string} code - Kode bayar / virtual account.
 */
const initPaymentStatusSSE = (code) => {
  if (!USE_REAL_SSE.value) {
    console.log("[SSE Demo] SSE dinonaktifkan. Gunakan tombol simulasi untuk demo pembayaran.")
    return
  }

  // TODO: Sesuaikan URL backend SSE Anda di bawah ini
  const sseUrl = `http://localhost:3000/api/payment-status/sse?kodeBayar=${code}`
  console.log(`[SSE] Menghubungkan ke ${sseUrl}...`)

  try {
    sseInstance.value = new EventSource(sseUrl)

    sseInstance.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("[SSE] Data diterima:", data)

        // Konfigurasi kondisi penentu kelunasan sesuai format JSON dari backend Anda
        if (data.status === 'LUNAS' || data.status === 'SUCCESS') {
          isSuccess.value = true
          emit('payment-success', props.vehicle.nopolClean, code)
          closeSSE()
        }
      } catch (err) {
        console.error("[SSE] Gagal mengurai data JSON:", err)
      }
    }

    sseInstance.value.onerror = (err) => {
      console.warn("[SSE] Koneksi error/terputus. Mencoba menghubungkan ulang...", err)
    }
  } catch (error) {
    console.error("[SSE] Browser tidak mendukung EventSource atau inisialisasi gagal:", error)
  }
}

/**
 * Menutup koneksi Server-Sent Events (SSE) agar tidak terjadi memory leak.
 */
const closeSSE = () => {
  if (sseInstance.value) {
    console.log("[SSE] Menutup koneksi SSE...")
    sseInstance.value.close()
    sseInstance.value = null
  }
}

onMounted(() => {
  if (!kodeBayar.value) {
    const randomCode = '982' + Math.floor(100000001 + Math.random() * 899999999)
    kodeBayar.value = randomCode
  }

  // Mulai dengarkan status pembayaran lewat SSE setelah kode bayar dibuat
  initPaymentStatusSSE(kodeBayar.value)

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
 * [HANYA UNTUK DEMO] Mensimulasikan proses pembayaran berhasil secara manual.
 * Akan mengirim (emit) event 'payment-success' ke komponen induk (App.vue).
 */
const handleSimulatePayment = () => {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    isSuccess.value = true
    emit('payment-success', props.vehicle.nopolClean, kodeBayar.value)
  }, 600)
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
            <span style="font-size: 0.75rem; color: #64748b; display: block">
              Total Tagihan Pajak ({{ vehicle.nopol }})
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

        <div style="margin-bottom: 1.5rem">
          <button
            class="btn-primary"
            style="width: 100%; padding: 0.85rem"
            @click="handleSimulatePayment"
            :disabled="isProcessing"
          >
            <Sparkles :size="18" />
            {{ isProcessing ? 'Memproses Transaksi...' : 'Simulasi Bayar Sekarang (Demo)' }}
          </button>
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

          <div class="modal-receipt-grid">
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">NOPOL:</span>
              <strong>{{ vehicle.nopol }}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">NAMA PEMILIK:</span>
              <strong>{{ vehicle.namaPemilik }}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">KODE BAYAR:</span>
              <strong>{{ kodeBayar }}</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 0.7rem; display: block">TANGGAL BAYAR:</span>
              <strong>{{ (vehicle.riwayat && vehicle.riwayat[0]) ? vehicle.riwayat[0].tglBayar : new Date().toLocaleDateString('id-ID') }}</strong>
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
