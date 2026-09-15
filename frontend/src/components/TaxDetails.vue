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
const totalPajak = computed(() => calculateTotalPajak(props.vehicle?.pajak))

/**
 * Mengecek status apakah tagihan kendaraan saat ini sudah lunas atau belum.
 */
const isPaid = computed(() => props.vehicle?.statusCode === 2 || props.vehicle?.status === 'LUNAS')
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
    <div class="data-card">
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
            <div class="history-main-info" style="flex: 1">
              <div class="history-date">
                <Clock :size="13" style="display: inline-block; vertical-align: middle; margin-right: 4px; margin-top: -1px;" />
                <span style="vertical-align: middle;">{{ item.tanggalBayar }}</span>
              </div>
              <div class="history-method" style="font-weight: 700; color: #1e293b; margin-top: 4px; font-size: 0.9rem;">
                {{ item.metodePembayaran }}
              </div>
              <div class="history-validity" style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                Ref: <strong style="color: #475569;">{{ item.noReff || '-' }}</strong>
              </div>
            </div>
            <div class="history-status-info" style="text-align: right; min-width: 100px;">
              <span style="color: #16a34a; font-weight: 800; font-size: 0.95rem; display: block; margin-bottom: 4px;">
                {{ formatRupiah(item.total) }}
              </span>
              <span style="font-size: 0.7rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 0.25rem 0.6rem; border-radius: 4px; display: inline-block; text-transform: uppercase;">
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
      <div v-if="isPaid" class="status-badge-green">
        <CheckCircle2 :size="14" />
        <span>SUDAH DIBAYAR</span>
      </div>

      <span class="tagihan-title">TOTAL TAGIHAN</span>
      <div class="tagihan-amount">{{ formatRupiah(totalPajak) }}</div>

      <div class="due-date-pill" v-if="vehicle.kendaraan">
        <span>Jatuh Tempo</span>
        <span class="due-date-value">{{ vehicle.kendaraan.sdNotice }}</span>
      </div>

      <!-- Tombol bayar: muncul saat BELUM BAYAR -->
      <template v-if="!isPaid">
        <button class="btn-primary" style="width: 100%" @click="emit('generate-kode', vehicle, totalPajak)">
          <QrCode :size="20" />
          Generate Kode Pembayaran
        </button>
      </template>
      <template v-else>
        <button class="btn-primary" style="width: 100%; background-color: #16a34a; border-color: #16a34a; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border-radius: 12px; font-weight: 600;" @click="emit('show-receipt', vehicle, totalPajak)">
          <CheckCircle2 :size="20" />
          Tampilkan Bukti Pembayaran
        </button>
      </template>
    </div>
  </div>
</template>

