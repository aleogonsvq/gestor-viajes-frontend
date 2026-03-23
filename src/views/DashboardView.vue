<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/atoms/BaseButton.vue'
import ClientCard from '../components/molecules/ClientCard.vue' // <--- Importamos la tarjeta

const router = useRouter()
const agenteName = ref(localStorage.getItem('agente_nombre') || 'Agente')
const agenteId = localStorage.getItem('agente_id')

// Variables reactivas para los datos de la base de datos
const clients = ref([])
const isLoading = ref(true)

// Función para obtener los clientes del backend
const fetchClients = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/clientes/agente/${agenteId}`)
    if (!response.ok) throw new Error('Error al obtener clientes')
    
    // Guardamos los datos recibidos en nuestra variable reactiva
    clients.value = await response.json()
  } catch (error) {
    console.error("Error:", error)
  } finally {
    isLoading.value = false
  }
}

// onMounted es un "gancho" (hook) de Vue que se ejecuta automáticamente cuando la página se carga
onMounted(() => {
  fetchClients()
})

const logout = () => {
  localStorage.clear() // Borra token, nombre e id de golpe
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    
    <header class="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <span class="text-2xl">✈️</span>
        <h1 class="text-xl font-bold text-slate-800 hidden sm:block">Gestor Amadeus</h1>
      </div>
      
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-slate-600">Hola, {{ agenteName }}</span>
        <BaseButton variant="secondary" @click="logout" class="text-sm py-1.5 px-3">
          Salir
        </BaseButton>
      </div>
    </header>

    <main class="flex-grow max-w-7xl mx-auto w-full p-6 mt-4">
      
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Mis Clientes</h2>
          <p class="text-slate-500">Gestiona los perfiles y viajes de tus viajeros.</p>
        </div>
        <BaseButton>+ Nuevo Cliente</BaseButton>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-slate-500 animate-pulse">Cargando clientes desde la base de datos...</p>
      </div>

      <div v-else-if="clients.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ClientCard 
          v-for="client in clients" 
          :key="client.id" 
          :client="client" 
        />
      </div>

      <div v-else class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
        <span class="text-4xl mb-3 block">📭</span>
        <h3 class="text-lg font-bold text-slate-700">Aún no tienes clientes</h3>
        <p class="text-slate-500 mb-4">Empieza añadiendo tu primer viajero para crearle itinerarios.</p>
        <BaseButton>Crear mi primer cliente</BaseButton>
      </div>

    </main>

  </div>
</template>