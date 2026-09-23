import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_PATH || '/esamsat-remodel/',

    plugins: [vue()],

    resolve: {
      alias: {
        '@': import.meta.dirname + '/src'
      }
    },

    server: {
      host: true,
      allowedHosts: true,
      proxy: {
        '/api-backend': {
          target: env.VITE_API_URL || 'https://api.samsatdigital.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-backend/, '')
        },
        '/api-sse': {
          target: env.VITE_SSE_URL || 'https://notify.samsatdigital.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-sse/, '')
        }
      }
    }
  }
})