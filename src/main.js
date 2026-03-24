// src/main.js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 1. Importamos Toastification y sus estilos CSS
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

const app = createApp(App)

app.use(router)

// 2. Le decimos a Vue que use el plugin de notificaciones
app.use(Toast, {
  position: "top-right",
  timeout: 3000, // Desaparecen a los 3 segundos
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  icon: true,
  rtl: false
})

app.mount('#app')