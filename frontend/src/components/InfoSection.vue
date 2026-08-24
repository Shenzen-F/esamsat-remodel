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
import { ref, onMounted, computed, watch } from 'vue'
import { MapPin, Calendar, HelpCircle, Mail, Car, Building } from '@lucide/vue'
import { INFORMASI_LAYANAN } from '../data/mockData'
import { getSamsatLocations } from '../services/vehicleApi'



/** @prop {string} type - Menentukan konten yang ditampilkan ('informasi' untuk layanan, lainnya untuk FAQ) */
const props = defineProps({
  type: { type: String, default: 'informasi' }
})

const locations = ref([])
const isLoading = ref(false)
const activeFilter = ref('Samsat Keliling') // 'Samsat Keliling', 'Samsat Jempol', 'Samsat Induk'

const fetchLocations = async () => {
  if (locations.value.length > 0) return // Cache data
  isLoading.value = true
  const res = await getSamsatLocations()
  if (res.success) {
    locations.value = res.data
  }
  isLoading.value = false
}

watch(() => props.type, (newType) => {
  if (newType === 'informasi') {
    fetchLocations()
  }
}, { immediate: true })

const filteredLocations = computed(() => {
  if (activeFilter.value === 'Samsat Induk') {
    return locations.value.filter(loc => loc.type === 'STATIC')
  } else if (activeFilter.value === 'MPP') {
    return locations.value.filter(loc => loc.type === 'MPP')
  } else if (activeFilter.value === 'Samsat Jempol') {
    return locations.value.filter(loc => loc.type === 'MOBILE' && loc.nama.toLowerCase().includes('jempol'))
  } else {
    // Default: Samsat Keliling (Mobile tapi bukan Jempol)
    return locations.value.filter(loc => loc.type === 'MOBILE' && !loc.nama.toLowerCase().includes('jempol'))
  }
})

const filters = ['Samsat Keliling', 'Samsat Jempol', 'Samsat Induk', 'MPP']
</script>

<template>
  <div style="color: #ffffff; padding-top: 1rem">
    <div v-if="type === 'informasi'">
      <div style="text-align: center; margin-bottom: 2.5rem">
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem">
          Informasi Layanan e-Samsat Aceh
        </h2>
        <p style="opacity: 0.9; font-size: 0.95rem; max-width: 650px; margin: 0 auto">
          Lokasi layanan Samsat Keliling, Samsat Jempol, Samsat Induk, dan Mall Pelayanan Publik (MPP) di wilayah Provinsi Aceh.
        </p>
      </div>

      <div style="display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <button 
          v-for="filter in filters" 
          :key="filter"
          @click="activeFilter = filter"
          :style="{
            padding: '0.6rem 1.25rem',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
            backgroundColor: activeFilter === filter ? '#38bdf8' : 'rgba(255,255,255,0.1)',
            color: activeFilter === filter ? '#0f172a' : '#ffffff',
            boxShadow: activeFilter === filter ? '0 4px 12px rgba(56, 189, 248, 0.4)' : 'none'
          }"
        >
          {{ filter }}
        </button>
      </div>

      <div v-if="isLoading" style="text-align: center; padding: 3rem 0;">
        <div class="spinner-ring" style="margin: 0 auto 1rem; width: 40px; height: 40px; display: inline-block; position: relative;"></div>
        <p style="color: #94a3b8">Memuat data lokasi...</p>
      </div>

      <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
        <!-- Card untuk Mobile (Keliling / Jempol) -->
        <template v-if="activeFilter === 'Samsat Keliling' || activeFilter === 'Samsat Jempol'">
          <div 
            v-for="(item, idx) in filteredLocations" 
            :key="idx" 
            style="background: #ffffff; border-radius: 16px; padding: 1.5rem; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.75rem;"
          >
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #00b4b6; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;">
              <Car :size="20" />
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0">{{ item.nama }}</h3>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.85rem; color: #475569; margin-top: 0.25rem;">
              <Calendar :size="16" style="flex-shrink: 0; margin-top: 2px" />
              <div>
                <strong style="color: #0f172a">{{ item.hariOperasi }}</strong><br/>
                <span>{{ item.jadwalOperasi }}</span>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.85rem; color: #475569;">
              <MapPin :size="16" style="flex-shrink: 0; margin-top: 2px" />
              <span>{{ item.tempatOperasi }}</span>
            </div>
          </div>
        </template>

        <!-- Card untuk MPP (Mall Pelayanan Publik) -->
        <template v-else-if="activeFilter === 'MPP'">
          <div 
            v-for="(item, idx) in filteredLocations" 
            :key="idx" 
            style="background: #ffffff; border-radius: 16px; padding: 1.5rem; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.75rem;"
          >
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #00b4b6; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;">
              <Building :size="20" />
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0">{{ item.nama }}</h3>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.85rem; color: #475569; margin-top: 0.25rem;">
              <MapPin :size="16" style="flex-shrink: 0; margin-top: 2px" />
              <span>{{ item.alamat }}{{ item.kota ? ', ' + item.kota : '' }}</span>
            </div>
          </div>
        </template>
        <!-- Card untuk Static (Induk) -->
        <template v-else>
          <div 
            v-for="(item, idx) in filteredLocations" 
            :key="idx" 
            style="background: #ffffff; border-radius: 16px; padding: 1.5rem; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.75rem;"
          >
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #00b4b6; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;">
              <Building :size="20" />
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0">{{ item.nama }}</h3>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.85rem; color: #475569; margin-top: 0.25rem;">
              <MapPin :size="16" style="flex-shrink: 0; margin-top: 2px" />
              <span>{{ item.alamat }}</span>
            </div>
          </div>
        </template>

        <div v-if="filteredLocations.length === 0" style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: #94a3b8;">
          <MapPin :size="48" style="opacity: 0.3; margin: 0 auto 1rem;" />
          <p>Belum ada data untuk kategori ini.</p>
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
