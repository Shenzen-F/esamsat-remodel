<!--
  @component TaxDetails.vue
  @description Komponen tampilan detail hasil pencarian pajak kendaraan.
  Terdiri dari 4 kartu/panel:
  1. Informasi Data Kendaraan (nopol, NIK, merek, model, warna, masa berlaku STNK)
  2. Rincian Pajak (tabel PKB, Opsen, Denda, SWDKLLJ, Admin + total)
  3. Riwayat Pembayaran (daftar transaksi sebelumnya)
  4. Panel Aksi Pembayaran (tombol Generate Kode Bayar, atau badge LUNAS jika sudah dibayar)
  @props vehicle {Object} - Objek data kendaraan lengkap dari hasil pencarian
  @emits generate-kode - Dikirim saat tombol "Generate Kode Pembayaran" diklik
-->
<script setup>
import { computed } from 'vue'
import { Car, FileText, Clock, AlertCircle, CheckCircle2, QrCode } from '@lucide/vue'
import { calculateTotalPajak } from '../data/mockData'

const props = defineProps({
  vehicle: { type: Object, default: null }
})

const emit = defineEmits(['generate-kode', 'show-receipt'])

/**
 * Memformat angka nominal menjadi format mata uang Rupiah.
 * @param {number} val - Nominal angka
 * @returns {string} Teks berformat Rupiah
 */
const formatRupiah = (val) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}

/**
 * Properti komputasi untuk menghitung total pajak otomatis.
 */
const totalPajak = computed(() => {
  const calculated = calculateTotalPajak(props.vehicle?.pajak)
  if (calculated > 0) return calculated
  if (props.vehicle?.riwayatPembayaran && props.vehicle.riwayatPembayaran[0]?.total) {
    return props.vehicle.riwayatPembayaran[0].total
  }
  return 0
})

const PAID_KEY = 'esamsat_paid_vehicles'

/**
 * Memformat nama metode pembayaran sesuai spesifikasi API (cash / cashless).
 */
const formatMetodePembayaran = (metode) => {
  if (!metode) return '-'
  const m = String(metode).trim().toLowerCase()
  if (m === 'cash') return 'Cash'
  if (m === 'cashless' || m === 'cash less' || m === 'non cash' || m === 'non-cash' || m === 'online') return 'Cashless'
  return metode
}

/**
 * Mengecek status apakah tagihan kendaraan saat ini sudah lunas atau belum.
 */
const hasPaidInLocal = computed(() => {
  if (props.vehicle?.statusCode === 1) return false
  try {
    const paid = JSON.parse(localStorage.getItem(PAID_KEY)) || {}
    return !!paid[props.vehicle?.nopolClean]
  } catch (e) {
    return false
  }
})

const isPaid = computed(() => {
  if (props.vehicle?.statusCode === 1) return false
  const alreadyPaidDesc = props.vehicle?.statusCode === 2 && props.vehicle?.deskripsi && props.vehicle.deskripsi.includes('berhasil dibayar')
  return props.vehicle?.status === 'LUNAS' || hasPaidInLocal.value || alreadyPaidDesc
})
const isStatusCode2 = computed(() => props.vehicle?.statusCode === 2)
</script>

<template>
  <div v-if="vehicle" class="results-grid">
    <!-- INFORMASI DATA KENDARAAN -->
    <div class="data-card">
      <div class="card-header">
        <Car :size="20" class="card-icon" />
        <h3 class="card-title">INFORMASI DATA KENDARAAN</h3>
      </div>
      <div class="card-body">
        <div class="info-fields-grid" v-if="vehicle.kendaraan">
          <div class="info-field-item">
            <span class="info-label">Nomor Polisi</span>
            <span class="info-value">{{ vehicle.kendaraan.nopol }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">NIK</span>
            <span class="info-value">{{ vehicle.kendaraan.nik || '-' }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Jenis / Merek</span>
            <span class="info-value">{{ vehicle.kendaraan.jenis }} / {{ vehicle.kendaraan.merek }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Model / Tahun</span>
            <span class="info-value">{{ vehicle.kendaraan.model }} / {{ vehicle.kendaraan.tahun }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Warna</span>
            <span class="info-value">{{ vehicle.kendaraan.warna }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Masa Berlaku STNK</span>
            <span class="info-value">{{ vehicle.kendaraan.sdStnk }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Tgl. Jatuh Tempo</span>
            <span class="info-value">{{ vehicle.kendaraan.sdNotice }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- RINCIAN PAJAK KENDARAAN -->
    <div class="data-card" v-if="!isPaid">
      <div class="card-header">
        <FileText :size="20" class="card-icon" />
        <h3 class="card-title">RINCIAN PAJAK KENDARAAN</h3>
      </div>
      <div class="card-body" style="padding-bottom: 0">
        <table class="tax-table">
          <thead>
            <tr>
              <th>Keterangan</th>
              <th>Nominal (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PKB (Pajak Kendaraan Bermotor)</td>
              <td>{{ (vehicle.pajak?.pkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Opsen PKB (Kabupaten/Kota)</td>
              <td>{{ (vehicle.pajak?.opkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Denda PKB</td>
              <td>{{ (vehicle.pajak?.dpkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Denda Opsen PKB</td>
              <td>{{ (vehicle.pajak?.odpkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>SWDKLLJ (Wajib Jasa Raharja)</td>
              <td>{{ (vehicle.pajak?.swd || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Opsen Denda SWDKLLJ</td>
              <td>{{ (vehicle.pajak?.dswd || 0).toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="total-banner">
        <span class="total-label">TOTAL PAJAK</span>
        <span class="total-amount">{{ formatRupiah(totalPajak) }}</span>
      </div>
    </div>

    <!-- RIWAYAT PEMBAYARAN -->
    <div class="data-card">
      <div class="card-header">
        <Clock :size="20" class="card-icon" />
        <h3 class="card-title">RIWAYAT PEMBAYARAN</h3>
      </div>
      <div class="card-body">
        <div v-if="vehicle.riwayatPembayaran && vehicle.riwayatPembayaran.length > 0">
          <div v-for="(item, idx) in vehicle.riwayatPembayaran" :key="idx" class="history-item">
            <!-- Sisi Kiri: Tanggal, Tempat/Lokasi Pembayaran, No Ref -->
            <div class="history-main-info" style="flex: 1">
              <div class="history-date">
                <Clock :size="13" style="display: inline-block; vertical-align: middle; margin-right: 4px; margin-top: -1px;" />
                <span style="vertical-align: middle;">{{ item.tanggalBayar }}</span>
              </div>
              <div class="history-location" style="font-weight: 700; color: #1e293b; margin-top: 4px; font-size: 0.9rem;">
                {{ item.lokasiPembayaran || 'e-Samsat Online' }}
              </div>
              <div class="history-validity" style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                Ref: <strong style="color: #475569;">{{ item.noReff || '-' }}</strong>
              </div>
            </div>
            <!-- Sisi Kanan: Total, Metode Pembayaran, Status Badge -->
            <div class="history-status-info" style="text-align: right; min-width: 110px;">
              <span style="color: #16a34a; font-weight: 800; font-size: 0.95rem; display: block; margin-bottom: 2px;">
                {{ formatRupiah(item.total) }}
              </span>
              <div style="font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 4px;">
                {{ formatMetodePembayaran(item.metodePembayaran) }}
              </div>
              <span style="font-size: 0.7rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; text-transform: uppercase;">
                ✓ BERHASIL
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-history">
          <Clock :size="36" class="empty-history-icon" />
          <p>Belum ada riwayat pembayaran</p>
        </div>
      </div>
    </div>

    <!-- PANEL PEMBAYARAN -->
    <div class="data-card payment-action-card">
      <div v-if="isPaid || (isStatusCode2 && vehicle.deskripsi && vehicle.deskripsi.includes('berhasil dibayar'))" class="status-badge-green">
        <CheckCircle2 :size="14" />
        <span>SUDAH DIBAYAR</span>
      </div>
      <div v-else-if="isStatusCode2" class="status-badge-green" style="background: #fef3c7; color: #b45309;">
        <AlertCircle :size="14" />
        <span>VALIDASI SAMSAT</span>
      </div>

      <span class="tagihan-title">TOTAL TAGIHAN</span>
      <div class="tagihan-amount">{{ formatRupiah(totalPajak) }}</div>

      <div class="due-date-pill" v-if="vehicle.kendaraan">
        <span>Jatuh Tempo</span>
        <span class="due-date-value">{{ vehicle.kendaraan.sdNotice }}</span>
      </div>

      <!-- Tombol: Jika kendaraan sudah lunas / pernah dibayar -->
      <template v-if="isPaid || (isStatusCode2 && vehicle.deskripsi && vehicle.deskripsi.includes('berhasil dibayar'))">
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 0.75rem; margin-bottom: 0.75rem; font-size: 0.78rem; color: #065f46; text-align: left; line-height: 1.4;">
          <strong>Perhatian:</strong> {{ vehicle.deskripsi || 'Pembayaran untuk kendaraan ini sudah berhasil dibayar (menunggu sinkronisasi dari sistem pusat).' }}
        </div>
        <button
          class="btn-primary"
          style="width: 100%; background-color: #16a34a; border-color: #16a34a; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border-radius: 12px; font-weight: 600;"
          @click="emit('show-receipt', vehicle, totalPajak)"
        >
          <CheckCircle2 :size="20" />
          Tampilkan Bukti Pembayaran
        </button>
      </template>

      <!-- Tombol: Jika statusCode 2 (ganti plat 5 tahunan / perlu ke kantor samsat) -->
      <template v-else-if="isStatusCode2">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 0.75rem; margin-bottom: 0.75rem; font-size: 0.78rem; color: #991b1b; text-align: left; line-height: 1.4;">
          <strong>Perhatian:</strong> {{ vehicle.deskripsi || 'kendaraan tidak bisa melakukan pembayaran pajak online karena sudah masuk masa ganti plat 5 tahunan, silahkan ke kantor samsat UPTD wilayah kab/kota asal kendaraan' }}
        </div>
        <button
          v-if="vehicle.riwayatPembayaran && vehicle.riwayatPembayaran.length > 0"
          class="btn-primary"
          style="width: 100%; background-color: #028090; border-color: #028090; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border-radius: 12px; font-weight: 600;"
          @click="emit('show-receipt', vehicle, totalPajak)"
        >
          <FileText :size="20" />
          Tampilkan Bukti Pembayaran Terakhir
        </button>
        <button
          v-else
          class="btn-primary"
          disabled
          style="width: 100%; opacity: 0.6; cursor: not-allowed; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border-radius: 12px; font-weight: 600;"
        >
          <AlertCircle :size="20" />
          Pembayaran Online Tidak Tersedia
        </button>
      </template>

      <!-- Tombol: Belum bayar dan memenuhi syarat pembayaran online -->
      <template v-else>
        <button class="btn-primary" style="width: 100%" @click="emit('generate-kode', vehicle, totalPajak)">
          <QrCode :size="20" />
          Generate Kode Pembayaran
        </button>
      </template>
    </div>
  </div>
</template>

