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
import { MapPin, Calendar, HelpCircle, Mail, Car, Building, Search, X } from '@lucide/vue'
import { getSamsatLocations } from '../../services/location.service'
import { useESamsatStore } from '../../stores/eSamsatStore'

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

const eSamsatStore = useESamsatStore()

const fetchLocations = async () => {
  if (locations.value.length > 0) return // Cache lokal komponen

  // Cek cache Pinia store terlebih dahulu
  if (eSamsatStore.samsatLocations.length > 0) {
    locations.value = eSamsatStore.samsatLocations
    return
  }

  isLoading.value = true
  const res = await getSamsatLocations()
  if (res.success && res.data) {
    const flat = flattenLocations(res.data)
    locations.value = flat
    // Simpan ke Pinia store untuk caching lintas komponen
    eSamsatStore.setSamsatLocations(flat)
  }
  isLoading.value = false
}

watch(() => props.type, (newType) => {
  if (newType === 'informasi') {
    fetchLocations()
  }
}, { immediate: true })

const searchQuery = ref('')
const isSearchActive = ref(false)

const closeSearch = () => {
  isSearchActive.value = false
  searchQuery.value = ''
}

const filteredLocations = computed(() => {
  if (isSearchActive.value && searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    return locations.value.filter(loc => 
      (loc.name && loc.name.toLowerCase().includes(query)) || 
      (loc.address && loc.address.toLowerCase().includes(query))
    )
  }
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

const flippedCards = ref(new Set())
const toggleFlip = (id) => {
  if (flippedCards.value.has(id)) {
    flippedCards.value.delete(id)
  } else {
    flippedCards.value.add(id)
  }
}
const isFlipped = (id) => flippedCards.value.has(id)
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

                  <div style="position: relative; width: 100%; margin: 0 auto 2rem; overflow: hidden; display: grid; grid-template-areas: 'overlap'; justify-items: center; align-items: center;">
        
        <!-- Filter Buttons Container -->
        <div 
          style="grid-area: overlap; display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease; width: 100%; max-width: 800px;"
          :style="{
            transform: isSearchActive ? 'translateX(-100%)' : 'translateX(0)',
            opacity: isSearchActive ? '0' : '1',
            pointerEvents: isSearchActive ? 'none' : 'auto'
          }"
        >
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
          
          <!-- Tombol Search Toggle -->
          <button 
            @click="isSearchActive = true"
            style="padding: 0.6rem; border-radius: 50%; border: none; cursor: pointer; transition: all 0.3s ease; background-color: rgba(255,255,255,0.1); color: #ffffff; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;"
            title="Cari Lokasi"
          >
            <Search :size="18" />
          </button>
        </div>

        <!-- Search Input Container -->
        <div 
          style="grid-area: overlap; display: flex; align-items: center; width: 100%; max-width: 500px; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;"
          :style="{
            transform: isSearchActive ? 'translateX(0)' : 'translateX(100%)',
            opacity: isSearchActive ? '1' : '0',
            pointerEvents: isSearchActive ? 'auto' : 'none'
          }"
        >
          <div style="position: relative; width: 100%; display: flex; align-items: center;">
            <Search :size="18" style="position: absolute; left: 1rem; color: #94a3b8; z-index: 10;" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari nama lokasi atau alamat..." 
              style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border-radius: 24px; border: none; outline: none; font-size: 0.95rem; background: #ffffff; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
            />
            <button 
              @click="closeSearch" 
              style="position: absolute; right: 0.5rem; background: none; border: none; cursor: pointer; color: #64748b; padding: 0.25rem; display: flex; align-items: center; border-radius: 50%; transition: background-color 0.2s; z-index: 10;"
            >
              <X :size="20" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" style="text-align: center; padding: 3rem 0;">
        <div class="spinner-ring" style="margin: 0 auto 1rem; width: 40px; height: 40px; display: inline-block; position: relative;"></div>
        <p style="color: #94a3b8">Memuat data lokasi...</p>
      </div>

      <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
        <template v-if="filteredLocations.length > 0">
          <div 
            v-for="(item, idx) in filteredLocations" 
            :key="item.id || idx" 
            class="flip-card-container"
          >
            <div class="flip-card-inner" :class="{ 'is-flipped': isFlipped(item.id) }">
              <!-- FRONT -->
              <div class="flip-card-front" style="background: #ffffff; border-radius: 16px; padding: 1.5rem; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; color: #00b4b6;">
                    <Building v-if="item.type !== 'Samsat Keliling' && item.type !== 'Samsat Jempol'" :size="20" />
                    <Car v-else :size="20" />
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0">{{ item.name }}</h3>
                  </div>
                  <div :style="{ 
                    backgroundColor: item.is_open_now ? '#22c55e' : '#ef4444', 
                    color: '#ffffff', 
                    padding: '4px 8px', 
                    borderRadius: '8px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    flexShrink: 0,
                    textTransform: 'uppercase'
                  }">
                    {{ item.is_open_now ? 'BUKA' : 'TUTUP' }}
                  </div>
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

                <div style="margin-top: auto; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                  <button @click="toggleFlip(item.id)" style="width: 100%; padding: 0.6rem; background-color: #0f172a; border: none; border-radius: 8px; color: #ffffff; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s;">
                    Lihat Jadwal Lainnya
                  </button>
                  <button @click="openMap(item.latitude, item.longitude)" style="width: 100%; padding: 0.6rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background-color 0.2s;">
                    <MapPin :size="14" />
                    Buka di Google Maps
                  </button>
                </div>
              </div>
              
              <!-- BACK -->
              <div class="flip-card-back" style="background: #ffffff; border-radius: 16px; padding: 1.5rem; color: #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;">
                  <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0">Jadwal Lainnya</h3>
                  <button @click="toggleFlip(item.id)" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; line-height: 1;">&times;</button>
                </div>
                
                <div style="overflow-y: auto; flex-grow: 1;">
                  <div v-if="item.office_hours && item.office_hours.length > 0">
                    <div v-for="(schedule, sIdx) in item.office_hours" :key="sIdx" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed #e2e8f0; font-size: 0.85rem;">
                      <span style="font-weight: 600; color: #475569; text-transform: capitalize;">{{ schedule.day }}</span>
                      <span v-if="schedule.opening && schedule.closing" style="color: #0f172a;">{{ schedule.opening }} - {{ schedule.closing }}</span>
                      <span v-else style="color: #ef4444; font-weight: bold;">Tutup</span>
                    </div>
                  </div>
                  <div v-else style="text-align: center; color: #64748b; font-size: 0.85rem; padding: 1rem 0;">
                    Tidak ada data jadwal lainnya.
                  </div>
                </div>
                
                <div style="margin-top: auto; padding-top: 1rem;">
                  <button @click="toggleFlip(item.id)" style="width: 100%; padding: 0.6rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s;">
                    Kembali
                  </button>
                </div>
              </div>
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

 < s t y l e   s c o p e d > 
 . f l i p - c a r d - c o n t a i n e r   { 
     b a c k g r o u n d - c o l o r :   t r a n s p a r e n t ; 
     p e r s p e c t i v e :   1 0 0 0 p x ; 
     m i n - h e i g h t :   2 8 0 p x ; 
 } 
 
 . f l i p - c a r d - i n n e r   { 
     p o s i t i o n :   r e l a t i v e ; 
     w i d t h :   1 0 0 % ; 
     h e i g h t :   1 0 0 % ; 
     t r a n s i t i o n :   t r a n s f o r m   0 . 6 s ; 
     t r a n s f o r m - s t y l e :   p r e s e r v e - 3 d ; 
 } 
 
 . f l i p - c a r d - i n n e r . i s - f l i p p e d   { 
     t r a n s f o r m :   r o t a t e Y ( 1 8 0 d e g ) ; 
 } 
 
 . f l i p - c a r d - f r o n t ,   . f l i p - c a r d - b a c k   { 
     p o s i t i o n :   a b s o l u t e ; 
     w i d t h :   1 0 0 % ; 
     h e i g h t :   1 0 0 % ; 
     - w e b k i t - b a c k f a c e - v i s i b i l i t y :   h i d d e n ; 
     b a c k f a c e - v i s i b i l i t y :   h i d d e n ; 
 } 
 
 . f l i p - c a r d - b a c k   { 
     t r a n s f o r m :   r o t a t e Y ( 1 8 0 d e g ) ; 
 } 
 < / s t y l e >  
 

<style scoped>
.flip-card-container {
  background-color: transparent;
  perspective: 1000px;
  min-height: 280px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
</style>
