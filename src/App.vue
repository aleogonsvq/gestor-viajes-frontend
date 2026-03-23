<script setup>
import { ref } from 'vue'
import LoginForm from './components/organisms/LoginForm.vue'

// Variable para saber si el usuario ya está logueado
const isLogged = ref(false)
const agenteName = ref('')

// Comprobamos si ya había un token guardado de antes
if (localStorage.getItem('viajes_token')) {
  isLogged.value = true
  agenteName.value = localStorage.getItem('agente_nombre')
}

// Función que se ejecuta cuando el LoginForm emite el éxito
const onLoginSuccess = (agente) => {
  isLogged.value = true
  agenteName.value = agente.name
}

// Función temporal para cerrar sesión
const logout = () => {
  localStorage.removeItem('viajes_token')
  localStorage.removeItem('agente_nombre')
  isLogged.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    
    <LoginForm v-if="!isLogged" @login-success="onLoginSuccess" />

    <div v-else class="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-lg w-full">
      <span class="text-5xl mb-4 block">✈️</span>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">¡Bienvenido al Gestor, {{ agenteName }}!</h1>
      <p class="text-slate-500 mb-8">El login con JWT está funcionando perfectamente.</p>
      
      <button @click="logout" class="text-red-600 font-medium hover:underline">
        Cerrar Sesión
      </button>
    </div>

  </div>
</template>