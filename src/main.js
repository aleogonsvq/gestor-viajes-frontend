// src/main.js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // <--- IMPORTAMOS EL ROUTER

const app = createApp(App)

app.use(router) // <--- LE DECIMOS A VUE QUE LO USE
app.mount('#app')