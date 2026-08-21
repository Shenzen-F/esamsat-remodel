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

const emit = defineEmits(['generate-kode'])

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
const totalPajak = computed(() => calculateTotalPajak(props.vehicle?.rincianPajak))

/**
 * Mengecek status apakah tagihan kendaraan saat ini sudah lunas atau belum.
 */
const isPaid = computed(() => props.vehicle?.status === 'LUNAS')
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
        <div class="info-fields-grid">
          <div class="info-field-item">
            <span class="info-label">Nomor Polisi</span>
            <span class="info-value">{{ vehicle.nopol }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">NIK</span>
            <span class="info-value">{{ vehicle.nik || '-' }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Jenis / Merek</span>
            <span class="info-value">{{ vehicle.jenisMerek }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Model / Tahun</span>
            <span class="info-value">{{ vehicle.modelTahun }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Warna</span>
            <span class="info-value">{{ vehicle.warna }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Masa Berlaku STNK</span>
            <span class="info-value">{{ vehicle.masaBerlakuStnk }}</span>
          </div>

          <div class="info-field-item">
            <span class="info-label">Tgl. Jatuh Tempo</span>
            <span class="info-value">{{ vehicle.tglJatuhTempo }}</span>
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
              <td>{{ (vehicle.rincianPajak?.pkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Opsen PKB (Kabupaten/Kota)</td>
              <td>{{ (vehicle.rincianPajak?.opsenPkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Denda PKB</td>
              <td>{{ (vehicle.rincianPajak?.dendaPkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Denda Opsen PKB</td>
              <td>{{ (vehicle.rincianPajak?.dendaOpsenPkb || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>SWDKLLJ (Wajib Jasa Raharja)</td>
              <td>{{ (vehicle.rincianPajak?.swdkllj || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Opsen Denda SWDKLLJ</td>
              <td>{{ (vehicle.rincianPajak?.opsenDendaSwdkllj || 0).toLocaleString('id-ID') }}</td>
            </tr>
            <tr>
              <td>Biaya Admin STNK &amp; Plat</td>
              <td>{{ (vehicle.rincianPajak?.biayaAdmin || 0).toLocaleString('id-ID') }}</td>
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
        <div v-if="vehicle.riwayat && vehicle.riwayat.length > 0">
          <div v-for="(item, idx) in vehicle.riwayat" :key="idx" class="history-item">
            <div style="flex: 1">
              <div class="history-row">
                <span class="history-label">Tgl. Bayar</span>
                <span class="history-val">{{ item.tglBayar }}</span>
              </div>
              <div class="history-row">
                <span class="history-label">Masa Berlaku</span>
                <span class="history-val">{{ item.masaBerlaku || '-' }}</span>
              </div>
              <div class="history-row">
                <span class="history-label">Tempat Pembayaran</span>
                <span class="history-val">{{ item.metode }}</span>
              </div>
            </div>
            <div style="text-align: right; min-width: 80px">
              <span style="color: #16a34a; font-weight: 800; font-size: 0.85rem">
                {{ formatRupiah(item.nominal) }}
              </span>
              <p style="font-size: 0.7rem; color: #16a34a">✓ {{ item.status }}</p>
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

      <div class="due-date-pill">
        <span>Jatuh Tempo</span>
        <span class="due-date-value">{{ vehicle.tglJatuhTempo }}</span>
      </div>

      <!-- Tombol bayar: muncul saat BELUM BAYAR -->
      <template v-if="!isPaid">
        <button class="btn-primary" style="width: 100%" @click="emit('generate-kode', vehicle, totalPajak)">
          <QrCode :size="20" />
          Generate Kode Pembayaran
        </button>
      </template>
    </div>
  </div>
</template>

