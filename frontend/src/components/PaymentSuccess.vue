<!--
  @component PaymentSuccess.vue
  @description Halaman konfirmasi pembayaran berhasil.
  Menampilkan bukti pengesahan STNK digital (resi pembayaran) lengkap
  dengan data kendaraan, kode bayar, tanggal bayar, dan total yang dibayar.
  @props vehicle {Object} - Data kendaraan yang sudah dibayar
  @props totalPajak {number} - Total nominal pajak yang telah dilunasi
  @props kodeBayar {string} - Kode bayar / virtual account yang digunakan
  @emits back-to-home - Dikirim saat pengguna menekan tombol "Kembali ke Beranda"
-->
<script setup>
import { computed } from 'vue'
import { ShieldCheck, Home, CheckCircle2 } from '@lucide/vue'

const props = defineProps({
  /** Data lengkap kendaraan yang sudah dibayar (nopol, pemilik, merek, dll.) */
  vehicle: { type: Object, required: true },
  /** Total nominal pajak yang telah dilunasi (dalam Rupiah) */
  totalPajak: { type: Number, default: 0 },
  /** Kode bayar / virtual account yang digunakan untuk pembayaran */
  kodeBayar: { type: String, default: '' }
})

const emit = defineEmits(['back-to-home'])

/**
 * Tanggal bayar dari riwayat atau tanggal saat ini.
 */
const tanggalBayarFormatted = computed(() => {
  if (props.vehicle?.riwayatPembayaran && props.vehicle.riwayatPembayaran[0]?.tanggalBayar) {
    return props.vehicle.riwayatPembayaran[0].tanggalBayar
  }
  return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
})

const totalDibayarFinal = computed(() => {
  if (props.totalPajak > 0) return props.totalPajak
  if (props.vehicle?.riwayatPembayaran && props.vehicle.riwayatPembayaran[0]?.total) {
    return props.vehicle.riwayatPembayaran[0].total
  }
  return 0
})

/**
 * Memformat angka menjadi format mata uang Rupiah Indonesia.
 * @param {number} val - Nominal angka yang akan diformat
 * @returns {string} String berformat "Rp X.XXX.XXX"
 */
const formatRupiah = (val) => 'Rp ' + (val || 0).toLocaleString('id-ID')
</script>

<template>
  <div class="payment-success-page">
    <div class="success-icon-wrapper">
      <div class="success-icon-ring">
        <ShieldCheck :size="52" class="success-shield-icon" />
      </div>
    </div>

    <h1 class="success-title">Pembayaran Berhasil!</h1>
    <p class="success-subtitle">
      Pajak kendaraan Anda telah lunas. Bukti pengesahan STNK digital e-Samsat Aceh telah terbit.
    </p>

    <div class="success-receipt" id="printable-receipt-page">
      <div class="receipt-header">
        <div>
          <strong class="receipt-brand">e-Samsat Provinsi Aceh</strong>
          <div class="receipt-sub">TANDA BUKTI PELUNASAN KEWAJIBAN PEMBAYARAN</div>
        </div>
        <div class="receipt-lunas-badge">
          <CheckCircle2 :size="14" />
          LUNAS
        </div>
      </div>

      <div class="receipt-grid" v-if="vehicle.kendaraan">
        <div class="receipt-field">
          <span class="receipt-label">NOPOL</span>
          <strong class="receipt-value">{{ vehicle.kendaraan.nopol }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">NIK</span>
          <strong class="receipt-value">{{ vehicle.kendaraan.nik }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">JENIS / MEREK</span>
          <strong class="receipt-value">{{ vehicle.kendaraan.jenis }} / {{ vehicle.kendaraan.merek }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">MODEL / TAHUN</span>
          <strong class="receipt-value">{{ vehicle.kendaraan.model }} / {{ vehicle.kendaraan.tahun }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">KODE BAYAR</span>
          <strong class="receipt-value">{{ kodeBayar }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">TANGGAL BAYAR</span>
          <strong class="receipt-value">{{ tanggalBayarFormatted }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">5 DIGIT TERAKHIR NO. RANGKA</span>
          <strong class="receipt-value">{{ vehicle.noRangkaLast5 || '-' }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">MASA BERLAKU STNK</span>
          <strong class="receipt-value">{{ vehicle.kendaraan.sdStnk }}</strong>
        </div>
      </div>

      <div class="receipt-total-row">
        <span>TOTAL DIBAYAR</span>
        <span>{{ formatRupiah(totalDibayarFinal) }}</span>
      </div>
    </div>

    <div class="success-actions">
      <button class="btn-primary" @click="emit('back-to-home')">
        <Home :size="18" />
        Kembali ke Beranda
      </button>
    </div>
  </div>
</template>
