<!--
  @component LandingPage.vue
  @description Halaman selamat datang (splash page) e-Samsat Aceh.
  Menampilkan hero banner, statistik, fitur unggulan, langkah penggunaan, mitra, CTA, dan footer.
  Pengguna dapat masuk ke aplikasi utama dengan menekan tombol "Bayar Pajak".
  @emits enter-app - Dikirim saat pengguna mengklik CTA untuk masuk ke halaman utama aplikasi.
-->
<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import {
  ArrowRight, ChevronDown, Car, FileText, CreditCard, Zap
} from '@lucide/vue'
import esamsatLogo from '../assets/esamsat.svg'
import sekretariatLogo from '../assets/sekretariat samsat.png'
import pancacitaLogo from '../assets/pancacita.png'
import polriLogo from '../assets/Polri Logo - Colored - zonalogo.com.png'
import jasaRaharjaLogo from '../assets/Jasa Raharja Logo - Colored - zonalogo.com.png'

const emit = defineEmits(['enter-app'])



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
    desc: 'Masukan NIK anda berdasarkan KTP asli, Nomor Polisi, dan 5 digit terakhir nomor rangka kendaraan Anda.',
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



/**
 * IntersectionObserver for scroll-triggered section animations
 */
const observedSections = ref(new Set())
let sectionObserver = null

const initSectionObserver = () => {
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observedSections.value.add(entry.target.dataset.section)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  )

  // Observe all sections
  document.querySelectorAll('[data-section]').forEach(el => {
    sectionObserver.observe(el)
  })
}

/** Lifecycle: Mendaftarkan scroll event listener saat komponen ter-mount */
onMounted(() => {
  window.addEventListener('scroll', onScroll)
  // Delay observer setup to allow DOM rendering
  setTimeout(initSectionObserver, 100)
})

/** Lifecycle: Membersihkan scroll event listener saat komponen akan di-destroy (mencegah memory leak) */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (sectionObserver) sectionObserver.disconnect()
})

const isSectionVisible = (name) => observedSections.value.has(name)
</script>

<template>
  <div class="lp-root">
    <!-- ── Navbar ── -->
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
      </div>
    </nav>

    <!-- ── Hero Section ── -->
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
            <Zap :size="18" /> Cek & Bayar Pajak Sekarang <ArrowRight :size="18" />
          </button>
          <a href="#cara-kerja" class="lp-btn-ghost">
            Pelajari Caranya
            <ChevronDown :size="18" />
          </a>
        </div>

      </div>
    </section>

    <!-- ── How It Works Section ── -->
    <section
      id="cara-kerja"
      class="lp-section lp-how-section"
      :class="{ 'lp-section-visible': isSectionVisible('howto') }"
      data-section="howto"
    >
      <div class="lp-section-header">
        <span class="lp-section-badge">PANDUAN</span>
        <h2 class="lp-section-title">Cara Kerja e-Samsat</h2>
        <p class="lp-section-desc">Hanya 3 langkah mudah untuk menyelesaikan kewajiban pajak kendaraan Anda.</p>
      </div>

      <div class="lp-how-grid">
        <template v-for="(item, idx) in HOW_IT_WORKS" :key="item.num">
          <div class="lp-how-card" :style="{ '--stagger': idx * 0.12 + 's' }">
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
    </section>


    <!-- ── Footer ── -->
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

<style scoped>
/* ── Scroll-Triggered Animation Base ── */
.lp-stats-bar,
.lp-section {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.lp-section-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* Staggered children animation */
.lp-section-visible .lp-feature-card,
.lp-section-visible .lp-how-card,
.lp-section-visible .lp-mitra-card {
  animation: cardFadeUp 0.55s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--stagger, 0s);
}

@keyframes cardFadeUp {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}



/* ── Navbar Center Links ── */
.lp-nav-center {
  display: flex;
  align-items: center;
  gap: 2.25rem;
}

.lp-nav-link-item {
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;
  transition: color 0.2s ease;
  position: relative;
  padding: 0.2rem 0;
}

.lp-nav-link-item::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #ddc4a0;
  border-radius: 2px;
  transition: width 0.25s ease;
}

.lp-nav-link-item:hover {
  color: #ffffff;
}

.lp-nav-link-item:hover::after {
  width: 100%;
}

/* ── Scroll indicator bounce ── */
.lp-scroll-indicator {
  animation: indicatorBounce 2s ease-in-out infinite;
}

@keyframes indicatorBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

/* ── Hero badge shimmer ── */
.lp-hero-badge {
  animation: badgeGlow 3s ease-in-out infinite alternate;
}

@keyframes badgeGlow {
  0% { border-color: rgba(255, 255, 255, 0.2); box-shadow: 0 0 0 rgba(212, 175, 55, 0); }
  100% { border-color: rgba(212, 175, 55, 0.5); box-shadow: 0 0 20px rgba(212, 175, 55, 0.15); }
}

/* ── Gradient text shimmer ── */
.lp-hero-gradient {
  animation: gradientShift 4s ease-in-out infinite alternate;
}

@keyframes gradientShift {
  0% { background-position: 0% center; }
  100% { background-position: 100% center; }
}

/* ── CTA Banner enhancements ── */
.lp-cta-banner {
  position: relative;
  overflow: hidden;
  background: transparent;
  padding: 6rem 2rem;
  text-align: center;
}

.lp-btn-cta-main {
  box-shadow: 0 10px 32px rgba(212, 175, 55, 0.45), 0 0 60px rgba(212, 175, 55, 0.15);
}

.lp-btn-cta-main:hover {
  box-shadow: 0 14px 38px rgba(212, 175, 55, 0.6), 0 0 80px rgba(212, 175, 55, 0.2);
}

/* ── Mitra cards hover ── */
.lp-mitra-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.lp-mitra-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(212, 175, 55, 0.4);
}

/* ── Feature card hover ── */
.lp-feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.lp-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.25);
}

@media (max-width: 992px) {
}

@media (max-width: 768px) {
  .lp-nav-center {
    display: none;
  }
}

@media (max-width: 480px) {
}
</style>
