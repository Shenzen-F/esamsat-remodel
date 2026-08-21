<!--
  @component InfoSection.vue
  @description Komponen yang menampilkan halaman Informasi Layanan atau FAQ (Bantuan).
  Konten yang ditampilkan bergantung pada prop `type`:
  - 'informasi': Jadwal Samsat Keliling, lokasi MPP
  - 'bantuan' (atau lainnya): FAQ dan kontak helpdesk
  Data diambil dari INFORMASI_LAYANAN di mockData.js.
  @props type {string} - Jenis konten: 'informasi' atau 'bantuan'
-->
<script setup>
import { MapPin, Calendar, HelpCircle, Mail } from '@lucide/vue'
import { INFORMASI_LAYANAN } from '../data/mockData'

/** @prop {string} type - Menentukan konten yang ditampilkan ('informasi' untuk layanan, lainnya untuk FAQ) */
defineProps({
  type: { type: String, default: 'informasi' }
})
</script>

<template>
  <div style="color: #ffffff; padding-top: 1rem">
    <div v-if="type === 'informasi'">
      <div style="text-align: center; margin-bottom: 2.5rem">
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem">
          Informasi Layanan e-Samsat Aceh
        </h2>
        <p style="opacity: 0.9; font-size: 0.95rem; max-width: 650px; margin: 0 auto">
          Lokasi layanan Samsat Keliling, Mall Pelayanan Publik (MPP), dan ketentuan pengesahan STNK di wilayah Provinsi Aceh.
        </p>
      </div>

      <div class="info-section-grid">
        <div style="background: #ffffff; border-radius: 20px; padding: 1.75rem; color: #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.1)">
          <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 1.25rem; color: #00b4b6">
            <Calendar :size="24" />
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #0f172a">
              Jadwal Samsat Keliling Aceh
            </h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem">
            <div v-for="(item, idx) in INFORMASI_LAYANAN.samsatKeliling" :key="idx" style="padding: 0.85rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #00b4b6">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem">
                <strong style="font-size: 0.85rem; color: #0f172a">{{ item.hari }}</strong>
                <span style="font-size: 0.75rem; color: #00b4b6; font-weight: 700">{{ item.jam }}</span>
              </div>
              <div style="font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 0.35rem">
                <MapPin :size="14" />
                <span>{{ item.lokasi }}</span>
              </div>
            </div>
          </div>
        </div>

        <div style="background: #ffffff; border-radius: 20px; padding: 1.75rem; color: #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.1)">
          <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 1.25rem; color: #00b4b6">
            <MapPin :size="24" />
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #0f172a">
              Mall Pelayanan Publik (MPP)
            </h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem">
            <div v-for="(item, idx) in INFORMASI_LAYANAN.mppLocations" :key="idx" style="padding: 0.85rem; background: #f8fafc; border-radius: 12px">
              <strong style="font-size: 0.85rem; color: #0f172a; display: block; margin-bottom: 0.2rem">
                {{ item.nama }} ({{ item.kota }})
              </strong>
              <span style="font-size: 0.78rem; color: #64748b">{{ item.alamat }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div style="text-align: center; margin-bottom: 2.5rem">
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem">
          Pusat Bantuan & Pertanyaan Umum (FAQ)
        </h2>
        <p style="opacity: 0.9; font-size: 0.95rem">
          Informasi lengkap seputar pembayaran pajak kendaraan dan pengesahan STNK.
        </p>
      </div>

      <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem">
        <div
          v-for="(item, idx) in INFORMASI_LAYANAN.faq"
          :key="idx"
          style="background: #ffffff; border-radius: 16px; padding: 1.5rem; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.06)"
        >
          <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.5rem">
            <HelpCircle :size="20" color="#00b4b6" style="margin-top: 2px; flex-shrink: 0" />
            <h4 style="font-size: 1rem; font-weight: 800; color: #0f172a">{{ item.q }}</h4>
          </div>
          <p style="font-size: 0.875rem; color: #475569; padding-left: 2.25rem; line-height: 1.6">
            {{ item.a }}
          </p>
        </div>

        <div class="helpdesk-banner">
          <div>
            <strong style="font-size: 1rem; display: block">Butuh bantuan lebih lanjut?</strong>
            <span style="font-size: 0.825rem; opacity: 0.85">Tim Helpdesk e-Samsat Aceh siap membantu Anda.</span>
          </div>
          <div style="display: flex; gap: 0.75rem">
            <a
              href="mailto:esamsat@acehprov.go.id"
              style="
                background: #ffffff;
                color: #007a7c;
                padding: 0.6rem 1rem;
                border-radius: 8px;
                font-weight: 700;
                font-size: 0.8rem;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 0.4rem
              "
            >
              <Mail :size="16" />
              Kirim Email
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
