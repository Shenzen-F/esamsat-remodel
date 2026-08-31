<!--
  @component HeroSearch.vue
  @description Komponen hero utama + form pencarian data kendaraan.
  Menampilkan petunjuk pembayaran di sisi kiri dan card form pencarian di sisi kanan.
  Form terdiri dari input NIK, Nomor Polisi (BL + angka + seri), dan 5 digit terakhir No. Rangka.
  Validasi input dilakukan secara real-time saat mengetik (handleChange) dan saat submit (onSubmit).
  @props formData {Object} - Data isian form (nik, nopolAngka, nopolSeri, noRangkaLast5)
  @props formErrors {Object} - Pesan error validasi per field
  @props isSearching {boolean} - Flag apakah sedang dalam proses pencarian (loading state)
  @emits search - Dikirim saat form disubmit untuk memulai pencarian
  @emits reset - Dikirim saat tombol Reset diklik untuk membersihkan form
  @emits update-form - Dikirim setiap kali ada perubahan input, membawa {name, value}
-->
<script setup>
import { FileText, ShieldCheck, CreditCard, Search, RotateCcw } from '@lucide/vue'
import esamsatLogo from '../assets/esamsat.svg'

defineProps({
  formData: { type: Object, required: true },
  formErrors: { type: Object, default: () => ({}) },
  isSearching: { type: Boolean, default: false }
})

const emit = defineEmits(['search', 'reset', 'update-form'])

/**
 * Menangani perubahan input (typing) pada form pencarian.
 * Sekaligus memformat dan memvalidasi karakter secara real-time:
 * - NIK: Hanya angka
 * - Nopol Angka: Hanya angka, maksimal 4 digit, tidak diawali '0'
 * - Nopol Seri: Hanya huruf, otomatis kapital, maksimal 4 karakter
 * - No Rangka: Hanya alfanumerik, otomatis kapital
 * 
 * @param {Event} e - Event input bawaan DOM
 */
const handleChange = (e) => {
  const { name, value } = e.target
  let cleaned = value

  if (name === 'nik') {
    cleaned = value.replace(/\D/g, '')
  } else if (name === 'nopolAngka') {
    // Hanya angka, tidak boleh diawali dengan 0, maksimal 4 digit
    cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.replace(/^0+/, '')
    }
    cleaned = cleaned.slice(0, 4)
  } else if (name === 'nopolSeri') {
    // Hanya huruf A-Z (diubah ke kapital), maksimal 4 karakter, opsional
    cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase()
    cleaned = cleaned.slice(0, 4)
  } else if (name === 'noRangkaLast5') {
    cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  }

  e.target.value = cleaned
  emit('update-form', { name, value: cleaned })
}

/**
 * Menangani saat form disubmit (pengguna menekan tombol "Cari Data" atau Enter).
 * Mengirim (emit) event 'search' ke komponen induk (App.vue) untuk memproses pencarian.
 * @param {Event} e - Event submit bawaan DOM
 */
const onSubmit = (e) => {
  e.preventDefault()
  emit('search')
}
</script>

<template>
  <div class="hero-grid">
    <div class="hero-left">
      <h1 class="hero-title">
        Ayo Bayar Pajak <br />
        Kendaraan <br />
        Dengan mudah
      </h1>

      <div class="guide-box">
        <h2 class="guide-title">PETUNJUK PEMBAYARAN :</h2>
        <div class="guide-list">
          <div class="guide-item">
            <span class="guide-num">1.</span>
            <span>
              Masukkan NIK KTP, Nopol, dan 5 digit terakhir nomor rangka untuk melihat tagihan pajak.
            </span>
          </div>
          <div class="guide-item">
            <span class="guide-num">2.</span>
            <span>Bayar melalui ATM Bank Aceh Syariah, Teller Bank Aceh Syariah, Aplikasi Action Mobile Banking Bank Aceh, Loket PT. POS Indonesia dan Aplikasi PosPay</span>
          </div>
          <div class="guide-item">
            <span class="guide-num">3.</span>
            <span>
              Sahkan STNK di Samsat, MPP, atau Mobil Samsat Keliling dengan membawa KTP anda.
            </span>
          </div>
        </div>
      </div>

      <div class="feature-pills">
        <div class="feature-pill">
          <div class="feature-icon-wrapper">
            <FileText :size="22" />
          </div>
          <span>Masukan Data</span>
        </div>

        <div class="feature-pill">
          <div class="feature-icon-wrapper">
            <ShieldCheck :size="22" />
          </div>
          <span>Verifikasi</span>
        </div>

        <div class="feature-pill">
          <div class="feature-icon-wrapper">
            <CreditCard :size="22" />
          </div>
          <span>Pembayaran</span>
        </div>
      </div>
    </div>

    <div class="search-card">
      <div class="search-header">
        <div class="logo-badge" style="background: transparent; box-shadow: none; width: 72px; height: 72px">
          <img :src="esamsatLogo" alt="e-Samsat Aceh" style="width: 100%; height: 100%; object-fit: contain" />
        </div>
        <h2 class="search-title">Cari Data Kendaraan</h2>
        <p class="search-subtitle">
          Lengkapi data di bawah ini untuk melihat detail pajak.
        </p>
      </div>

      <form @submit="onSubmit">
        <div class="form-group">
          <label class="form-label">NIK</label>
          <input
            type="text"
            name="nik"
            class="form-input"
            :class="{ 'form-input--error': formErrors.nik }"
            placeholder="16 Digit NIK"
            maxlength="16"
            :value="formData.nik"
            @input="handleChange"
          />
          <div v-if="formErrors.nik" class="form-error">{{ formErrors.nik }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Nomor Polisi</label>
          <div class="nopol-row">
            <span class="nopol-prefix-badge">BL</span>
            <input
              type="text"
              name="nopolAngka"
              class="form-input nopol-angka"
              :class="{ 'form-input--error': formErrors.nopolAngka }"
              placeholder="1234"
              maxlength="4"
              :value="formData.nopolAngka"
              @input="handleChange"
              style="text-transform: uppercase"
            />
            <input
              type="text"
              name="nopolSeri"
              class="form-input nopol-seri"
              :class="{ 'form-input--error': formErrors.nopolSeri }"
              placeholder="AB"
              maxlength="4"
              :value="formData.nopolSeri"
              @input="handleChange"
              style="text-transform: uppercase"
            />
          </div>
          <div v-if="formErrors.nopolAngka || formErrors.nopolSeri" class="form-error">
            {{ formErrors.nopolAngka || formErrors.nopolSeri }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">5 Digit Terakhir No. Rangka</label>
          <input
            type="text"
            name="noRangkaLast5"
            class="form-input"
            :class="{ 'form-input--error': formErrors.noRangkaLast5 }"
            placeholder="5 Karakter Terakhir"
            maxlength="5"
            :value="formData.noRangkaLast5"
            @input="handleChange"
          />
          <div v-if="formErrors.noRangkaLast5" class="form-error">{{ formErrors.noRangkaLast5 }}</div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="isSearching">
            <Search :size="18" />
            {{ isSearching ? 'Memproses Data...' : 'Cari Data' }}
          </button>
          <button type="button" class="btn-outline" @click="emit('reset')">
            <RotateCcw :size="16" />
            Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
