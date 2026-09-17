import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/esamsat-remodel/',

  plugins: [vue()],

  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api-backend': {
        target: 'https://api.samsatdigital.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-backend/, '')
      }
    }
  }
})