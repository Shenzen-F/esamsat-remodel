/**
 * @file env.js
 * @description File konstanta environment untuk aplikasi e-Samsat Aceh.
 *
 * File ini berfungsi sebagai satu-satunya sumber (single source of truth)
 * untuk semua konfigurasi environment. Berdasarkan mode build Vite,
 * file ini akan otomatis memilih nilai dari:
 *
 *   - `.env`             → digunakan saat development (`npm run dev`)
 *   - `.env.production`  → digunakan saat production  (`npm run build:production`)
 *
 * Cara kerja:
 *   Vite secara otomatis memuat file `.env.[mode]` berdasarkan `--mode` flag.
 *   - `vite` / `vite --mode development`  → memuat `.env` + `.env.development`
 *   - `vite build` / `vite build --mode production` → memuat `.env` + `.env.production`
 *
 * Penggunaan di komponen/service:
 *   ```js
 *   import { API_BASE_URL, SSE_BASE_URL, APP_ENV } from '@/constants/env'
 *   ```
 */

// ─── ENVIRONMENT MODE ─────────────────────────────────────────────────────────

/**
 * Mode environment saat ini.
 * @type {'development' | 'production'}
 */
export const APP_ENV = import.meta.env.VITE_APP_ENV || import.meta.env.MODE

/**
 * `true` jika sedang dalam mode development.
 * @type {boolean}
 */
export const IS_DEV = import.meta.env.DEV

/**
 * `true` jika sedang dalam mode production.
 * @type {boolean}
 */
export const IS_PROD = import.meta.env.PROD

// ─── API BACKEND ──────────────────────────────────────────────────────────────

/**
 * Base URL API backend.
 *
 * - Development: menggunakan Vite proxy `/api-backend` agar tidak kena CORS.
 * - Production:  menggunakan URL langsung dari VITE_API_URL di `.env.production`.
 *
 * @type {string}
 */
export const API_BASE_URL = IS_DEV
  ? '/api-backend'
  : (import.meta.env.VITE_API_URL || 'https://api.samsatdigital.net')

// ─── SSE (Server-Sent Events) ─────────────────────────────────────────────────

/**
 * Base URL SSE untuk notifikasi pembayaran real-time.
 *
 * - Development: menggunakan Vite proxy `/api-sse/sse/streams`.
 * - Production:  menggunakan URL langsung dari VITE_SSE_URL di `.env.production`.
 *
 * @type {string}
 */
export const SSE_BASE_URL = IS_DEV
  ? '/api-sse/sse/streams'
  : (import.meta.env.VITE_SSE_URL || 'https://notify.samsatdigital.net/sse/streams')

// ─── APLIKASI ─────────────────────────────────────────────────────────────────

/**
 * Base path untuk deployment (GitHub Pages, Vercel, dll).
 * @type {string}
 */
export const BASE_PATH = import.meta.env.VITE_BASE_PATH || '/esamsat-remodel/'

/**
 * Nama/judul aplikasi.
 * @type {string}
 */
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'e-Samsat Aceh'

// ─── RINGKASAN ENVIRONMENT (untuk debugging) ──────────────────────────────────

if (IS_DEV) {
  console.log(
    `%c[ENV] Mode: ${APP_ENV} | API: ${API_BASE_URL} | SSE: ${SSE_BASE_URL}`,
    'color: #22d3ee; font-weight: bold;'
  )
}
