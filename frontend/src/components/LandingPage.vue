<!--
  @component LandingPage.vue
  @description Halaman selamat datang (splash page) e-Samsat Aceh.
  Menampilkan hero banner, fitur unggulan, langkah penggunaan, dan footer.
  Pengguna dapat masuk ke aplikasi utama dengan menekan tombol "Bayar Pajak".
  @emits enter-app - Dikirim saat pengguna mengklik CTA untuk masuk ke halaman utama aplikasi.
-->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  ShieldCheck, Clock, CheckCircle, ArrowRight,
  Smartphone, Building2, MapPin, Star, ChevronDown,
  Car, FileText, CreditCard, Mail
} from '@lucide/vue'
import esamsatLogo from '../assets/esamsat.svg'
import sekretariatLogo from '../assets/sekretariat samsat.png'
import pancacitaLogo from '../assets/pancacita.png'
import polriLogo from '../assets/Polri Logo - Colored - zonalogo.com.png'
import jasaRaharjaLogo from '../assets/Jasa Raharja Logo - Colored - zonalogo.com.png'

import Footer from './Footer.vue'

const emit = defineEmits(['enter-app'])

/**
 * Daftar fitur unggulan e-Samsat Aceh yang ditampilkan di landing page.
 * Setiap item berisi ikon, judul, deskripsi, dan warna aksen.
 * @type {Array<{icon: Component, title: string, desc: string, color: string}>}
 */
const FEATURES = [
  {
    icon: Clock,
    title: 'Bayar Pajak Kilat',
    desc: 'Proses pembayaran selesai dalam hitungan menit tanpa perlu antri di Samsat.',
    color: '#c9a87c',
  },
  {
    icon: ShieldCheck,
    title: 'Aman & Terenkripsi',
    desc: 'Data NIK dan kendaraan Anda dilindungi enkripsi standar perbankan.',
    color: '#34d399',
  },
  {
    icon: Smartphone,
    title: 'Multi Platform',
    desc: 'Akses dari HP, tablet, atau komputer kapan saja dan di mana saja.',
    color: '#818cf8',
  },
  {
    icon: Building2,
    title: 'Multi Channel Bayar',
    desc: 'Bank Aceh Syariah, QRIS, BSI, GoPay, OVO, ShopeePay, dan PT Pos.',
    color: '#38bdf8',
  },
  {
    icon: MapPin,
    title: 'Samsat Keliling Aceh',
    desc: 'Informasi jadwal dan lokasi Samsat Keliling & MPP seluruh Aceh.',
    color: '#fb7185',
  },
  {
    icon: FileText,
    title: 'Resi Digital Resmi',
    desc: 'Bukti pengesahan STNK digital dapat langsung dicetak saat itu juga.',
    color: '#a78bfa',
  },
]

/**
 * Langkah-langkah cara kerja e-Samsat ("How It Works").
 * Ditampilkan dalam 3 step card di landing page.
 * @type {Array<{num: string, icon: Component, title: string, desc: string}>}
 */
const HOW_IT_WORKS = [
  {
    num: '01',
    icon: Car,
    title: 'Masukan Data Kendaraan',
    desc: ' Masukan NIK anda berdasarkan KTP asli, Nomor Polisi, dan 5 digit terakhir nomor rangka kendaraan Anda.',
  },
  {
    num: '02',
    icon: FileText,
    title: 'Cek Tagihan Pajak',
    desc: 'Sistem akan menampilkan rincian PKB, opsen, denda, dan SWDKLLJ secara real-time.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Bayar & Selesai',
    desc: 'Generate kode bayar lalu selesaikan pembayaran melalui kanal pilihan Anda.',
  },
]

/** Reactive flag: apakah halaman sudah di-scroll > 40px (untuk efek navbar transparan → solid) */
const scrolled = ref(false)

/**
 * Handler scroll event pada window.
 * Mengubah state `scrolled` untuk menambahkan class CSS pada navbar
 * sehingga navbar berubah dari transparan menjadi solid saat di-scroll.
 */
const onScroll = () => {
  scrolled.value = window.scrollY > 40
}

/** Lifecycle: Mendaftarkan scroll event listener saat komponen ter-mount */
onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

/** Lifecycle: Membersihkan scroll event listener saat komponen akan di-destroy (mencegah memory leak) */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="lp-root">
    <nav :class="['lp-nav', { 'lp-nav--scrolled': scrolled }]">
      <div class="lp-nav-inner">
        <div class="lp-nav-brand">
          <div class="lp-nav-logo-box">
            <img :src="sekretariatLogo" alt="Sekretariat Samsat" />
          </div>
          <div class="lp-nav-logo-box">
            <img :src="esamsatLogo" alt="e-Samsat Aceh" />
          </div>
          <span>e-Samsat <span class="lp-brand-accent">Aceh</span></span>
        </div>

        <button class="lp-nav-cta" @click="emit('enter-app')">
          Bayar Pajak <ArrowRight :size="16" />
        </button>
      </div>
    </nav>

    <section class="lp-hero">
      <div class="lp-blob lp-blob-1" />
      <div class="lp-blob lp-blob-2" />
      <div class="lp-blob lp-blob-3" />

      <div class="lp-hero-inner">
        <h1 class="lp-hero-title">
          Bayar Pajak <br />
          Kendaraan <br />
          <span class="lp-hero-gradient">Kapan Saja,</span>
          <br />
          <span class="lp-hero-gradient">Di Mana Saja.</span>
        </h1>

        <p class="lp-hero-desc">
          Solusi pembayaran pajak kendaraan bermotor Provinsi Aceh secara online.
          Mudah, cepat, aman, dan tanpa antri.
        </p>

        <div class="lp-hero-actions">
          <button class="lp-btn-hero" @click="emit('enter-app')">
            Cek & Bayar Pajak Sekarang <ArrowRight :size="18" />
          </button>
          <a href="#cara-kerja" class="lp-btn-ghost">
            Pelajari Caranya
            <ChevronDown :size="18" />
          </a>
        </div>

        <div class="lp-trust-row">
          <div class="lp-trust-item"><Clock :size="15" /><span>Proses Instan</span></div>
        </div>
      </div>

      <a href="#cara-kerja" class="lp-scroll-indicator">
        <ChevronDown :size="22" />
      </a>
    </section>

    <section id="cara-kerja" class="lp-section lp-how-section">
      <div class="lp-section-header">
        <h2 class="lp-section-title">Cara Kerja e-Samsat</h2>
        <p class="lp-section-desc">Hanya 3 langkah mudah untuk menyelesaikan kewajiban pajak kendaraan Anda.</p>
      </div>

      <div class="lp-how-grid">
        <template v-for="(item, idx) in HOW_IT_WORKS" :key="item.num">
          <div class="lp-how-card">
            <div class="lp-how-num">{{ item.num }}</div>
            <div class="lp-how-icon-ring">
              <component :is="item.icon" :size="28" />
            </div>
            <h3 class="lp-how-title">{{ item.title }}</h3>
            <p class="lp-how-desc">{{ item.desc }}</p>
          </div>
          <div v-if="idx < HOW_IT_WORKS.length - 1" class="lp-how-arrow"><ArrowRight :size="28" /></div>
        </template>
      </div>

      <div class="lp-how-cta">
        <button class="lp-btn-hero" @click="emit('enter-app')">
          Mulai Sekarang <ArrowRight :size="18" />
        </button>
      </div>
    </section>

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
          <span class="footer-link">Kebijakan Privasi</span>
          <span class="footer-link">Syarat & Ketentuan</span>
          <span class="footer-link" @click="emit('enter-app')">Bantuan</span>
          <span class="footer-link" @click="emit('enter-app')">Peta Situs</span>
        </div>
      </div>
      <div class="footer-copy-bar">
        © {{ new Date().getFullYear() }} Tim IT e-Samsat Aceh — Badan Pengelolaan Keuangan Aceh
      </div>
    </footer>
  </div>
</template>
