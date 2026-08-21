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
import { ShieldCheck, Home, CheckCircle2 } from '@lucide/vue'

defineProps({
  /** Data lengkap kendaraan yang sudah dibayar (nopol, pemilik, merek, dll.) */
  vehicle: { type: Object, required: true },
  /** Total nominal pajak yang telah dilunasi (dalam Rupiah) */
  totalPajak: { type: Number, default: 0 },
  /** Kode bayar / virtual account yang digunakan untuk pembayaran */
  kodeBayar: { type: String, default: '' }
})

const emit = defineEmits(['back-to-home'])

/**
 * Memformat angka menjadi format mata uang Rupiah Indonesia.
 * @param {number} val - Nominal angka yang akan diformat
 * @returns {string} String berformat "Rp X.XXX.XXX"
 */
const formatRupiah = (val) => 'Rp ' + val.toLocaleString('id-ID')
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

      <div class="receipt-grid">
        <div class="receipt-field">
          <span class="receipt-label">NOPOL</span>
          <strong class="receipt-value">{{ vehicle.nopol }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">NAMA PEMILIK</span>
          <strong class="receipt-value">{{ vehicle.namaPemilik }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">JENIS / MEREK</span>
          <strong class="receipt-value">{{ vehicle.jenisMerek }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">MODEL / TAHUN</span>
          <strong class="receipt-value">{{ vehicle.modelTahun }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">KODE BAYAR</span>
          <strong class="receipt-value">{{ kodeBayar }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">TANGGAL BAYAR</span>
          <strong class="receipt-value">{{ new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">NO. RANGKA</span>
          <strong class="receipt-value">{{ vehicle.noRangka }}</strong>
        </div>
        <div class="receipt-field">
          <span class="receipt-label">MASA BERLAKU STNK</span>
          <strong class="receipt-value">{{ vehicle.masaBerlakuStnk }}</strong>
        </div>
      </div>

      <div class="receipt-total-row">
        <span>TOTAL DIBAYAR</span>
        <span>{{ formatRupiah(totalPajak) }}</span>
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
