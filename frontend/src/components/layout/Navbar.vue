<!--
  @component Navbar.vue
  @description Bar navigasi utama aplikasi e-Samsat Aceh.
  Menampilkan logo, nama aplikasi, dan tab navigasi (Beranda, Informasi, Bantuan).
  @props activeTab {string} - Tab yang sedang aktif ('beranda' | 'cek-pajak' | 'informasi' | 'bantuan')
  @emits set-tab - Dikirim saat pengguna mengklik salah satu tab navigasi, membawa nama tab sebagai payload.
  @emits go-to-landing - Dikirim saat pengguna mengklik logo/brand, untuk kembali ke halaman Landing.
-->
<script setup>
import esamsatLogo from '../../assets/esamsat.svg'
import sekretariatLogo from '../../assets/sekretariat samsat.png'

/** @prop {string} activeTab - Nama tab yang sedang aktif untuk highlight navigasi */
defineProps({
  activeTab: { type: String, default: 'beranda' },
  hideMenu: { type: Boolean, default: false }
})

/**
 * Event emitter untuk komunikasi ke komponen induk (App.vue).
 * - 'set-tab': Mengubah tab aktif di App.vue
 * - 'go-to-landing': Menampilkan kembali halaman Landing
 */
const emit = defineEmits(['set-tab', 'go-to-landing'])
</script>

<template>
  <nav class="navbar">
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <button 
        @click="emit('go-to-landing')" 
        title="Kembali"
        style="background: transparent; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0.5rem; border-radius: 50%; transition: background 0.2s;"
        onmouseover="this.style.background='rgba(255,255,255,0.1)'"
        onmouseout="this.style.background='transparent'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="nav-brand">
        <div class="brand-badge" style="padding: 0.2rem; width: 36px; height: 36px">
          <img :src="sekretariatLogo" alt="Sekretariat Samsat" style="width: 100%; height: 100%; object-fit: contain" />
        </div>
        <div class="brand-badge" style="padding: 0.2rem; width: 36px; height: 36px">
          <img :src="esamsatLogo" alt="e-Samsat Aceh" style="width: 100%; height: 100%; object-fit: contain" />
        </div>
        <span>e-Samsat Aceh</span>
      </div>
    </div>

    <ul v-if="!hideMenu" class="nav-links">
      <li
        :class="['nav-link', { active: activeTab === 'beranda' || activeTab === 'cek-pajak' }]"
        @click="emit('set-tab', 'beranda')"
      >
        Beranda
      </li>

      <li
        :class="['nav-link', { active: activeTab === 'informasi' }]"
        @click="emit('set-tab', 'informasi')"
      >
        Informasi
      </li>
      <li
        :class="['nav-link', { active: activeTab === 'bantuan' }]"
        @click="emit('set-tab', 'bantuan')"
      >
        Bantuan
      </li>
    </ul>
  </nav>
</template>
