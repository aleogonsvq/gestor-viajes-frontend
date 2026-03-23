<script setup>
import { ref } from 'vue'
// Importamos nuestros bloques de construcción (Átomos)
import BaseInput from '../atoms/BaseInput.vue'
import BaseButton from '../atoms/BaseButton.vue'

// Emitimos un evento cuando el login tenga éxito para que la vista padre lo sepa
const emit = defineEmits(['login-success'])

// Variables reactivas para los datos del formulario
const email = ref('')
const password = ref('')

// Variables para manejar el estado de la petición al servidor
const isLoading = ref(false)
const errorMessage = ref('')

// Función principal que se ejecuta al enviar el formulario
const handleSubmit = async () => {
  // Limpiamos errores previos y activamos el estado de carga
  errorMessage.value = ''
  isLoading.value = true

  try {
    // Hacemos la petición POST a tu backend
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    // Si el backend devuelve un error (ej. 401 Contraseña incorrecta)
    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión')
    }

    // ¡ÉXITO! Guardamos el Token en el almacenamiento del navegador
    localStorage.setItem('viajes_token', data.token)
    localStorage.setItem('agente_nombre', data.agente.name)
    localStorage.setItem('agente_id', data.agente.id)

    // Avisamos a la página principal de que todo ha ido bien
    emit('login-success', data.agente)

  } catch (error) {
    // Si algo falla, mostramos el mensaje de error en pantalla
    errorMessage.value = error.message
  } finally {
    // Apagamos el estado de carga
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
    
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-slate-800">Acceso Agentes</h2>
      <p class="text-slate-500 text-sm mt-1">Introduce tus credenciales para continuar</p>
    </div>

    <div v-if="errorMessage" class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
      {{ errorMessage }}
    </div>

    <div class="space-y-4 mb-6">
      <BaseInput 
        v-model="email" 
        label="Correo Electrónico" 
        type="email" 
        placeholder="ejemplo@agencia.com" 
        required
      />

      <BaseInput 
        v-model="password" 
        label="Contraseña" 
        type="password" 
        placeholder="••••••••"
        required
      />
    </div>

    <BaseButton type="submit" class="w-full" :disabled="isLoading">
      {{ isLoading ? 'Conectando...' : 'Iniciar Sesión' }}
    </BaseButton>
    
  </form>
</template>