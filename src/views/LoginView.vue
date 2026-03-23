<script setup>
import { useRouter } from 'vue-router'
import LoginForm from '../components/organisms/LoginForm.vue'

// Instanciamos el router para poder darle órdenes de navegación
const router = useRouter()

// Si el login es exitoso, guardamos el nombre y redirigimos al Dashboard
const handleLoginSuccess = (agente) => {
  localStorage.setItem('agente_nombre', agente.name)
  
  // Le decimos al router: "Llévame a la página del dashboard"
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <LoginForm @login-success="handleLoginSuccess" />
  </div>
</template>