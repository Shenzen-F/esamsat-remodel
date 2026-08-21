<!--
  @component Footer.vue
  @description Footer global aplikasi e-Samsat Aceh (digunakan di halaman utama setelah login).
  Menampilkan informasi kontak Tim IT e-Samsat, logo mitra pendukung (Polri, Pemerintah Aceh,
  Jasa Raharja), dan tautan navigasi cepat (Kebijakan Privasi, S&K, Bantuan, Peta Situs).
  @emits set-tab - Dikirim saat pengguna mengklik tautan navigasi di footer (Bantuan, Peta Situs)
-->
<script setup>
import pancacitaLogo from '../assets/pancacita.png'
import polriLogo from '../assets/Polri Logo - Colored - zonalogo.com.png'
import jasaRaharjaLogo from '../assets/Jasa Raharja Logo - Colored - zonalogo.com.png'

const emit = defineEmits(['set-tab'])

/**
 * Menampilkan pop-up (alert) berisi ringkasan Kebijakan Privasi e-Samsat Aceh.
 * Sementara menggunakan window.alert() — pada implementasi final bisa diganti modal.
 */
const showPrivacy = () => {
  alert('Kebijakan Privasi e-Samsat Aceh: Seluruh data NIK dan Nomor Polisi dienkripsi secara aman.')
}

/**
 * Menampilkan pop-up (alert) berisi ringkasan Syarat & Ketentuan.
 * Sementara menggunakan window.alert() — pada implementasi final bisa diganti modal.
 */
const showTerms = () => {
  alert('Syarat & Ketentuan: Pengesahan STNK dilakukan maksimal 30 hari setelah pelunasan pajak.')
}
</script>

<template>
  <footer class="footer">
    <div class="footer-glow"></div>
    <div class="footer-content">
      <div class="footer-left">
        <div class="footer-brand-title">
          <strong>Tim IT e-Samsat Aceh</strong>
          <span class="footer-sub">Badan Pengelolaan Keuangan Aceh</span>
        </div>
        <div class="footer-contact">
          <span class="footer-contact-label">Hubungi Kami:</span>
          <div class="footer-contact-links">
            <a href="mailto:esamsat@acehprov.go.id" class="footer-chip">
              esamsat@acehprov.go.id
            </a>
            <a href="mailto:esamsataceh@gmail.com" class="footer-chip">
              esamsataceh@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div class="footer-partners">
        <span class="partners-title">DIDUKUNG OLEH</span>
        <div class="partner-badges">
          <img
            :src="polriLogo"
            alt="Kepolisian Negara Republik Indonesia"
            title="Kepolisian Negara Republik Indonesia (Polri)"
          />
          <img
            :src="pancacitaLogo"
            alt="Pemerintah Aceh - Pancacita"
            title="Pemerintah Provinsi Aceh"
          />
          <img
            :src="jasaRaharjaLogo"
            alt="PT Jasa Raharja"
            title="PT Jasa Raharja"
          />
        </div>
      </div>

      <div class="footer-right">
        <span class="footer-link" @click="showPrivacy">
          Kebijakan Privasi
        </span>
        <span class="footer-link" @click="showTerms">
          Syarat & Ketentuan
        </span>
        <span class="footer-link" @click="emit('set-tab', 'bantuan')">
          Bantuan
        </span>
        <span class="footer-link" @click="emit('set-tab', 'informasi')">
          Peta Situs
        </span>
      </div>
    </div>
    <div class="footer-copy-bar">
      © {{ new Date().getFullYear() }} Tim IT e-Samsat Aceh — Badan Pengelolaan Keuangan Aceh
    </div>
  </footer>
</template>
