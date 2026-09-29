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
import { getSamsatLocations } from '../../services/location.service'

const INFORMASI_LAYANAN = {
  faq: [
    {
      q: "Dokumen apa saja yang wajib dibawa saat pengesahan STNK?",
      a: "Anda perlu membawa KTP asli pemilik sesuai STNK, STNK asli, dan bukti transaksi pembayaran e-Samsat Aceh (Kode Bayar / Resi Digital)."
    },
    {
      q: "Di mana saya bisa melakukan pembayaran e-Samsat Aceh?",
      a: "Pembayaran dapat dilakukan melalui ATM Bank Aceh Syariah, Teller Bank Aceh Syariah, Aplikasi Action Mobile Banking Bank Aceh, Loket PT. POS Indonesia dan Aplikasi PosPay."
    },
    {
      q: "Berapa lama batas waktu penukaran nota pajak setelah bayar online?",
      a: "Batas waktu pengesahan STNK adalah 30 hari kerja sejak tanggal pembayaran sukses dilakukan."
    }
  ]
};

/** @prop {string} type - Menentukan konten yang ditampilkan ('informasi' untuk layanan, lainnya untuk FAQ) */
const props = defineProps({
  type: { type: String, default: 'informasi' }
})

const locations = ref([])
const isLoading = ref(false)
const activeFilter = ref('Kantor Samsat')

const flattenLocations = (data) => {
  let flat = []
  data.forEach(branch => {
    // Add Kantor Samsat (Induk)
    flat.push({
      id: branch.id_branch,
      type: 'Kantor Samsat',
      name: branch.name_samsat || branch.name_branch,
      address: branch.address,
      latitude: branch.latitude,
      longitude: branch.longitude,
      is_open_now: branch.is_open_now,
      today_schedule: branch.today_schedule,
      active_closure: branch.active_closure,
      office_hours: branch.office_hours
    })

    if (branch.sub_branch && branch.sub_branch.length > 0) {
      branch.sub_branch.forEach(sub => {
        let type = 'Lainnya'
        const name = sub.name_sub_branch.toLowerCase()
        if (name.includes('mpp')) {
          type = 'MPP'
        } else if (name.includes('jempol')) {
          type = 'Samsat Jempol'
        } else if (name.includes('gampong')) {
          type = 'Samsat Gampong'
        } else if (name.includes('keliling') || sub.type === 'mobile') {
          type = 'Samsat Keliling'
        }

        // if mobile, address could be in active_location_today
        let addr = sub.address
        let lat = sub.latitude
        let lng = sub.longitude

        if (sub.type === 'mobile' && sub.active_location_today) {
          addr = sub.active_location_today.address || addr
          lat = sub.active_location_today.latitude || lat
          lng = sub.active_location_today.longitude || lng
        }

        flat.push({
          id: sub.id_sub_branch,
          type: type,
          name: sub.name_sub_branch,
          address: addr,
          latitude: lat,
          longitude: lng,
          is_open_now: sub.is_open_now,
          today_schedule: sub.today_schedule,
          active_closure: sub.active_closure,
          office_hours: sub.office_hours
        })
      })
    }
  })
  return flat
}

const fetchLocations = async () => {
  if (locations.value.length > 0) return // Cache data
  isLoading.value = true
  const res = await getSamsatLocations()
  if (res.success && res.data) {
    locations.value = flattenLocations(res.data)
  }
  isLoading.value = false
}

watch(() => props.type, (newType) => {
  if (newType === 'informasi') {
    fetchLocations()
  }
}, { immediate: true })

const filteredLocations = computed(() => {
  return locations.value.filter(loc => loc.type === activeFilter.value)
})

const filters = ['Kantor Samsat', 'Samsat Keliling', 'Samsat Jempol', 'MPP', 'Samsat Gampong']

const openMap = (lat, lng) => {
  if (lat && lng) {
    const latStr = String(lat).replace(',', '.')
    const lngStr = String(lng).replace(',', '.')
    window.open(`https://www.google.com/maps?q=${latStr},${lngStr}`, '_blank')
  }
}
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
        <template v-if="filteredLocations.length > 0">
          <div 
            v-for="(item, idx) in filteredLocations" 
            :key="idx" 
            style="background: #ffffff; border-radius: 16px; padding: 1.5rem; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.75rem;"
          >
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #00b4b6;">
                <Building v-if="item.type !== 'Samsat Keliling' && item.type !== 'Samsat Jempol'" :size="20" />
                <Car v-else :size="20" />
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0">{{ item.name }}</h3>
              </div>
              <div :style="{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.is_open_now ? '#22c55e' : '#ef4444', flexShrink: 0, marginTop: '4px' }" title="Status Buka"></div>
            </div>
            
            <div style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.85rem; color: #475569; margin-top: 0.25rem;">
              <Calendar :size="16" style="flex-shrink: 0; margin-top: 2px" />
              <div>
                <strong style="color: #0f172a">Jadwal Hari Ini</strong><br/>
                <span v-if="item.today_schedule">{{ item.today_schedule.opening }} - {{ item.today_schedule.closing }}</span>
                <span v-else>Tutup / Tidak ada jadwal hari ini</span>
              </div>
            </div>

            <div v-if="item.active_closure" style="background-color: #fee2e2; color: #b91c1c; padding: 0.5rem; border-radius: 8px; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
              <HelpCircle :size="14" style="flex-shrink: 0" />
              <span><strong>Tutup:</strong> {{ item.active_closure.reason }}</span>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.85rem; color: #475569;">
              <MapPin :size="16" style="flex-shrink: 0; margin-top: 2px" />
              <span>{{ item.address }}</span>
            </div>

            <div style="margin-top: auto; padding-top: 1rem;">
              <button @click="openMap(item.latitude, item.longitude)" style="width: 100%; padding: 0.6rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background-color 0.2s;">
                <MapPin :size="14" />
                Buka di Google Maps
              </button>
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
