<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import Navbar from './components/Navbar.vue'
import LandingPage from './components/LandingPage.vue'
import HeroSearch from './components/HeroSearch.vue'
import TaxDetails from './components/TaxDetails.vue'
import PaymentModal from './components/PaymentModal.vue'
import PaymentSuccess from './components/PaymentSuccess.vue'
import InfoSection from './components/InfoSection.vue'
import Footer from './components/Footer.vue'
import { calculateTotalPajak } from './data/mockData'
import { searchVehicle } from './services/vehicleApi'
const showLanding = ref(true)
const activeTab = ref('beranda')
const resultsRef = ref(null)

const formData = reactive({
  nik: '',
  nopolAngka: '',
  nopolSeri: '',
  noRangkaLast5: ''
})

const formErrors = reactive({
  nik: '',
  nopolAngka: '',
  nopolSeri: '',
  noRangkaLast5: ''
})

const currentVehicle = ref(null)
const isSearching = ref(false)
const showModal = ref(false)
const toastMessage = ref('')
const paymentSuccessData = ref(null)

const STORAGE_KEY = 'esamsat_last_page'
const SESSION_KEY = 'esamsat_session_visited'
const PAID_KEY = 'esamsat_paid_vehicles'
const SEARCHED_KEY = 'esamsat_searched_vehicles'
const VALID_TABS = ['beranda', 'cek-pajak', 'informasi', 'bantuan']

/**
 * Mengambil data kendaraan yang sudah dibayar dari localStorage.
 * @returns {Object} Kumpulan data kendaraan berstatus LUNAS.
 */
const getPaidVehicles = () => {
  try {
    return JSON.parse(localStorage.getItem(PAID_KEY)) || {}
  } catch (e) {
    return {}
  }
}

/**
 * Mengambil riwayat pencarian kendaraan dari localStorage.
 * Berguna untuk menampilkan kembali data tanpa harus query ulang ke backend (caching).
 * @returns {Object} Data riwayat kendaraan yang dicari.
 */
const getSearchedVehicles = () => {
  try {
    return JSON.parse(localStorage.getItem(SEARCHED_KEY)) || {}
  } catch (e) {
    return {}
  }
}

/**
 * Menyimpan status (state) aplikasi saat ini (tab aktif, form pencarian, dll) 
 * ke dalam localStorage agar tidak hilang saat pengguna me-refresh halaman.
 */
const saveState = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      showLanding: showLanding.value,
      activeTab: activeTab.value,
      formData: { ...formData }
    })
  )
}

/**
 * Memuat status aplikasi yang tersimpan di localStorage.
 * Mengembalikan pengguna ke kondisi tab/halaman terakhir sebelum halaman di-refresh.
 */
const loadLastPage = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || typeof saved !== 'object') return
    if (saved.showLanding === false) {
      showLanding.value = false
    }
    if (VALID_TABS.includes(saved.activeTab)) {
      activeTab.value = saved.activeTab
    }
    if (saved.formData && typeof saved.formData === 'object') {
      Object.assign(formData, saved.formData)
    }
  } catch (e) {
    // abaikan jika data tidak valid
  }
}

loadLastPage()

watch(
  [showLanding, activeTab, formData, currentVehicle, paymentSuccessData],
  saveState,
  { deep: true }
)

let toastTimer = null

/**
 * Menampilkan pesan notifikasi pop-up (Toast) di sudut layar selama 3 detik.
 * @param {string} msg - Pesan yang akan ditampilkan.
 */
const triggerToast = (msg) => {
  toastMessage.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

/**
 * Melakukan scroll halaman secara halus (smooth scrolling) ke elemen tertentu.
 * @param {number} targetY - Posisi sumbu Y target scroll.
 * @param {number} duration - Durasi animasi dalam milidetik (default 800ms).
 */
const smoothScrollTo = (targetY, duration = 800) => {
  const startY = window.scrollY
  const diff = targetY - startY
  if (Math.abs(diff) < 2) return
  const startTime = performance.now()

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const step = (now) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    window.scrollTo(0, startY + diff * easeInOutCubic(progress))
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

/**
 * Menangani proses saat tombol 'Cari' ditekan.
 * Melakukan validasi format NIK, Nopol, dan No Rangka, lalu mencocokkan data
 * (saat ini menggunakan data dummy / mock).
 */
const handleSearch = async () => {
  paymentSuccessData.value = null
  showModal.value = false

  const nikInput = formData.nik.trim()
  const nopolAngka = formData.nopolAngka.trim()
  const nopolSeri = formData.nopolSeri.trim()
  const noRangkaLast5 = formData.noRangkaLast5.trim().toUpperCase()

  formErrors.nik = nikInput
    ? nikInput.length !== 16
      ? `NIK harus 16 digit (saat ini ${nikInput.length} digit)`
      : ''
    : 'Harus diisi'
  formErrors.nopolAngka = nopolAngka
    ? nopolAngka.startsWith('0')
      ? 'Angka tidak boleh diawali 0'
      : (nopolAngka.length < 1 || nopolAngka.length > 4)
        ? `Angka Nopol harus 1–4 digit (saat ini ${nopolAngka.length} digit)`
        : ''
    : 'Harus diisi'
  formErrors.nopolSeri = nopolSeri
    ? nopolSeri.length > 4
      ? `Seri Nopol maksimal 4 huruf (saat ini ${nopolSeri.length} huruf)`
      : /[^a-zA-Z]/.test(nopolSeri)
        ? 'Seri Nopol hanya boleh berisi huruf A-Z'
        : ''
    : ''
  formErrors.noRangkaLast5 = noRangkaLast5
    ? noRangkaLast5.length !== 5
      ? `No. Rangka harus 5 karakter (saat ini ${noRangkaLast5.length} karakter)`
      : ''
    : 'Harus diisi'

  const hasInvalid = Object.values(formErrors).some((msg) => msg !== '')
  if (hasInvalid) {
    return
  }

  const result = await searchVehicle({
    nik: nikInput,
    nopolAngka,
    nopolSeri,
    noRangkaLast5
  })

  if (result.status === 'error') {
    return
  }

  // Handle found or notfound
  const foundVehicle = result.vehicle
  const cleanNopol = foundVehicle.nopolClean
  const searchKey = `${nikInput}|${cleanNopol}|${noRangkaLast5}`
  
  const searchedVehicles = getSearchedVehicles()
  const searchedRecord = searchedVehicles[searchKey]
  const paidRecord = getPaidVehicles()[cleanNopol]

  if (paidRecord) {
    currentVehicle.value = paidRecord.vehicle
  } else if (foundVehicle.status === 'LUNAS') {
    currentVehicle.value = foundVehicle
  } else if (searchedRecord) {
    currentVehicle.value = searchedRecord.vehicle
    paymentSuccessData.value = {
      vehicle: searchedRecord.vehicle,
      totalPajak: searchedRecord.totalPajak,
      kodeBayar: searchedRecord.kodeBayar
    }
  } else {
    currentVehicle.value = foundVehicle
    searchedVehicles[searchKey] = {
      vehicle: foundVehicle,
      totalPajak: result.totalPajak,
      kodeBayar: '982' + Math.floor(100000001 + Math.random() * 899999999)
    }
    localStorage.setItem(SEARCHED_KEY, JSON.stringify(searchedVehicles))
  }

  nextTick(() => {
    setTimeout(() => {
      // Jika hasil pencarian aktif (TaxDetails ditampilkan)
      if (resultsRef.value) {
        const targetY = resultsRef.value.getBoundingClientRect().top + window.scrollY - 20
        smoothScrollTo(targetY, 900)
      } else {
        // Jika PaymentSuccess ditampilkan, scroll ke atas atau bisa disesuaikan
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 150)
  })
}

/**
 * Membersihkan semua isi form input pencarian dan menghapus state hasil pencarian,
 * mengembalikan tampilan ke keadaan awal.
 */
const handleReset = () => {
  paymentSuccessData.value = null
  showModal.value = false
  formData.nik = ''
  formData.nopolAngka = ''
  formData.nopolSeri = ''
  formData.noRangkaLast5 = ''
  formErrors.nik = ''
  formErrors.nopolAngka = ''
  formErrors.nopolSeri = ''
  formErrors.noRangkaLast5 = ''
  currentVehicle.value = null
}

/**
 * Membuka pop-up (modal) pembayaran untuk membuat kode virtual account/kode bayar.
 */
const handleGenerateKode = () => {
  showModal.value = true
}

/**
 * Callback saat pengguna selesai/sukses melakukan pembayaran dari dalam Modal.
 * Mengubah status tagihan menjadi LUNAS, merekam ke riwayat, lalu menyimpan ke localStorage.
 * @param {string} nopolClean - Nomor polisi tanpa spasi.
 * @param {string} kodeBayar - Kode bayar yang digunakan.
 */
const handlePaymentSuccess = (nopolClean, kodeBayar) => {
  if (currentVehicle.value) {
    const totalPajak = calculateTotalPajak(currentVehicle.value.rincianPajak)

    const updated = {
      ...currentVehicle.value,
      status: 'LUNAS',
      riwayat: [
        {
          tglBayar: new Date().toLocaleDateString('id-ID') + ' - Baru Saja',
          kodeBayar: kodeBayar,
          metode: 'Bank Aceh Syariah Online',
          nominal: totalPajak,
          status: 'Berhasil'
        },
        ...currentVehicle.value.riwayat
      ]
    }
    currentVehicle.value = updated
    paymentSuccessData.value = { vehicle: updated, totalPajak, kodeBayar }
    showModal.value = false

    const paidVehicles = getPaidVehicles()
    paidVehicles[nopolClean] = { vehicle: updated, totalPajak, kodeBayar }
    localStorage.setItem(PAID_KEY, JSON.stringify(paidVehicles))
  }
}

/**
 * Mengembalikan tampilan aplikasi dari halaman "Sukses Bayar" kembali ke Beranda utama.
 * Juga membersihkan data pencarian aktif.
 */
const onBackToHome = () => {
  paymentSuccessData.value = null
  currentVehicle.value = null
  formData.nik = ''
  formData.nopolAngka = ''
  formData.nopolSeri = ''
  formData.noRangkaLast5 = ''
  formErrors.nik = ''
  formErrors.nopolAngka = ''
  formErrors.nopolSeri = ''
  formErrors.noRangkaLast5 = ''
  activeTab.value = 'beranda'
}
</script>

<template>
  <!-- Transition antara LandingPage dan App utama -->
  <Transition name="page-fade" mode="out-in">
    <LandingPage v-if="showLanding" key="landing" @enter-app="showLanding = false" />

    <div v-else key="main" class="app-container">
      <Navbar 
        :active-tab="activeTab" 
        :hide-menu="!!paymentSuccessData"
        @set-tab="activeTab = $event" 
        @go-to-landing="showLanding = true" 
      />

      <main class="main-content">
        <Transition name="tab-fade" mode="out-in">
          <!-- Halaman sukses bayar -->
          <PaymentSuccess
            v-if="paymentSuccessData"
            key="success"
            :vehicle="paymentSuccessData.vehicle"
            :total-pajak="paymentSuccessData.totalPajak"
            :kode-bayar="paymentSuccessData.kodeBayar"
            @back-to-home="onBackToHome"
          />

          <!-- Halaman beranda / cek pajak -->
          <div v-else-if="activeTab === 'beranda' || activeTab === 'cek-pajak'" :key="activeTab">
            <HeroSearch
              :form-data="formData"
              :form-errors="formErrors"
              :is-searching="isSearching"
              @search="handleSearch"
              @reset="handleReset"
              @update-form="(payload) => { formData[payload.name] = payload.value; formErrors[payload.name] = '' }"
            />

            <Transition name="result-slide">
              <div
                v-if="currentVehicle"
                ref="resultsRef"
                style="scroll-margin-top: 20px"
              >
                <TaxDetails
                  :vehicle="currentVehicle"
                  @generate-kode="handleGenerateKode"
                />
              </div>
            </Transition>
          </div>

          <!-- Halaman informasi / bantuan -->
          <InfoSection v-else :key="activeTab" :type="activeTab" />
        </Transition>
      </main>

      <PaymentModal
        v-if="showModal && currentVehicle"
        :vehicle="currentVehicle"
        :total-pajak="calculateTotalPajak(currentVehicle.rincianPajak)"
        @close="showModal = false"
        @payment-success="handlePaymentSuccess"
      />

      <Footer @set-tab="activeTab = $event" />
    </div>
  </Transition>
</template>

<style>
/* ===== TRANSISI HALAMAN (Landing → App) ===== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

/* ===== TRANSISI TAB ===== */
.tab-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== ANIMASI HASIL PENCARIAN MUNCUL ===== */
.result-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.result-slide-leave-active {
  transition: all 0.3s ease;
}
.result-slide-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}
.result-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ===== TOAST NOTIFICATION ===== */
.toast-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-leave-active {
  transition: all 0.25s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}

.toast-fixed {
  position: fixed;
  top: 24px;
  right: 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07);
  z-index: 9999;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(8px);
}
.toast-icon {
  color: #38bdf8;
  font-size: 0.7rem;
}

/* ===== LOADING OVERLAY ===== */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.35s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  background: linear-gradient(145deg, #0f172a, #1e293b);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 24px;
  padding: 3rem 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255,255,255,0.04),
              inset 0 1px 0 rgba(255,255,255,0.06);
  animation: card-breathe 2s ease-in-out infinite;
}

@keyframes card-breathe {
  0%, 100% { box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 30px rgba(56,189,248,0.05); }
  50%       { box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 50px rgba(56,189,248,0.12); }
}

/* ===== SPINNER RING ===== */
.spinner-ring {
  position: relative;
  width: 72px;
  height: 72px;
}
.spinner-ring::before,
.spinner-ring::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}
.spinner-ring::before {
  inset: 0;
  border: 3px solid rgba(56, 189, 248, 0.12);
}
.spinner-ring::after {
  inset: 0;
  border: 3px solid transparent;
  border-top-color: #38bdf8;
  border-right-color: rgba(56, 189, 248, 0.4);
  animation: spin 0.9s cubic-bezier(0.6, 0, 0.4, 1) infinite;
}

.spinner-core {
  position: absolute;
  inset: 16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%);
  border: 2px solid rgba(56, 189, 248, 0.3);
  animation: pulse-core 1.8s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse-core {
  0%, 100% { transform: scale(0.85); opacity: 0.5; }
  50%       { transform: scale(1);    opacity: 1; }
}

.loading-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.02em;
}
.loading-sub {
  margin: -0.5rem 0 0;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* ===== TITIK ANIMASI ===== */
.loading-dots {
  display: flex;
  gap: 6px;
  margin-top: 0.25rem;
}
.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  animation: dot-bounce 1.4s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
  40%           { transform: scale(1.1); opacity: 1; }
}
</style>
