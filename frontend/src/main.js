/**
 * @file main.js
 * @description Entry point aplikasi Vue 3 e-Samsat Aceh.
 * Menginisialisasi instance Vue, mengimpor stylesheet global,
 * lalu me-mount komponen root (App.vue) ke elemen #app di index.html.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/index.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
