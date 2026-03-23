<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import ItineraryCard from '../components/molecules/ItineraryCard.vue'
import BaseModal from '../components/molecules/BaseModal.vue'

const route = useRoute()
const router = useRouter()
const clientId = route.params.id

const itineraries = ref([])
const isLoading = ref(true)

// Modal Viaje
const isTripModalOpen = ref(false)
const newTripName = ref('')
const isCreatingTrip = ref(false)

// NUEVO: Variables para el Modal de Vuelos
const isFlightModalOpen = ref(false)
const isCreatingFlight = ref(false)
const selectedItineraryId = ref(null) // Para saber a qué viaje le estamos metiendo el vuelo
const newFlight = ref({
  origin: '', destination: '', departureTime: '', arrivalTime: '', airline: '', flightNumber: ''
})

const goBack = () => router.push('/dashboard')

const fetchItineraries = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/itinerarios/cliente/${clientId}`)
    if (!response.ok) throw new Error('Error al obtener itinerarios')
    itineraries.value = await response.json()
  } catch (error) {
    console.error("Error:", error)
  } finally {
    isLoading.value = false
  }
}

const createNewItinerary = async () => {
  if (!newTripName.value.trim()) return 
  isCreatingTrip.value = true
  try {
    const response = await fetch('http://localhost:3000/api/itinerarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTripName.value, clientId: clientId })
    })
    if (!response.ok) throw new Error('Error al crear el viaje')
    newTripName.value = ''
    isTripModalOpen.value = false
    fetchItineraries()
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingTrip.value = false
  }
}

// NUEVO: Funciones para el vuelo
const openFlightModal = (itineraryId) => {
  selectedItineraryId.value = itineraryId
  isFlightModalOpen.value = true
}

const createNewFlight = async () => {
  isCreatingFlight.value = true
  try {
    const response = await fetch('http://localhost:3000/api/vuelos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newFlight.value,
        itineraryId: selectedItineraryId.value // Le pasamos el ID del viaje padre
      })
    })

    if (!response.ok) throw new Error('Error al añadir el vuelo')

    // Limpiamos el formulario y cerramos el modal
    newFlight.value = { origin: '', destination: '', departureTime: '', arrivalTime: '', airline: '', flightNumber: '' }
    isFlightModalOpen.value = false
    
    // Recargamos los viajes para ver el nuevo vuelo en pantalla
    fetchItineraries()
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingFlight.value = false
  }
}

onMounted(() => fetchItineraries())
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col relative">
    
    <header class="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
      <BaseButton variant="secondary" @click="goBack" class="py-1 px-3 text-sm">← Volver</BaseButton>
      <h1 class="text-xl font-bold text-slate-800">Itinerarios del Cliente</h1>
    </header>

    <main class="flex-grow max-w-4xl mx-auto w-full p-6 mt-4">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-slate-800">Viajes Programados</h2>
        <BaseButton @click="isTripModalOpen = true">+ Nuevo Viaje</BaseButton>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-slate-500 animate-pulse">Cargando itinerarios y vuelos...</p>
      </div>

      <div v-else-if="itineraries.length > 0" class="space-y-6">
        <ItineraryCard 
          v-for="itinerary in itineraries" 
          :key="itinerary.id" 
          :itinerary="itinerary" 
          @add-flight="openFlightModal"
        />
      </div>

      <div v-else class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
        <span class="text-4xl mb-3 block">🏝️</span>
        <h3 class="text-lg font-bold text-slate-700">Sin viajes a la vista</h3>
        <p class="text-slate-500 mb-4">Este cliente aún no tiene ningún itinerario creado.</p>
        <BaseButton @click="isTripModalOpen = true">Crear mi primer viaje</BaseButton>
      </div>
    </main>

    <BaseModal :isOpen="isTripModalOpen" title="Crear Nuevo Viaje" @close="isTripModalOpen = false">
      <form @submit.prevent="createNewItinerary" class="space-y-4">
        <BaseInput v-model="newTripName" label="Nombre del Itinerario" required />
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton type="button" variant="secondary" @click="isTripModalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :disabled="isCreatingTrip">{{ isCreatingTrip ? 'Guardando...' : 'Crear Viaje' }}</BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal :isOpen="isFlightModalOpen" title="Añadir Tramo de Vuelo" @close="isFlightModalOpen = false">
      <form @submit.prevent="createNewFlight" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="newFlight.origin" label="Origen (IATA)" placeholder="Ej: MAD" required />
          <BaseInput v-model="newFlight.destination" label="Destino (IATA)" placeholder="Ej: JFK" required />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="newFlight.departureTime" type="datetime-local" label="Salida" required />
          <BaseInput v-model="newFlight.arrivalTime" type="datetime-local" label="Llegada" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="newFlight.airline" label="Aerolínea" placeholder="Ej: Iberia" required />
          <BaseInput v-model="newFlight.flightNumber" label="Nº Vuelo" placeholder="Ej: IB6253" required />
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <BaseButton type="button" variant="secondary" @click="isFlightModalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :disabled="isCreatingFlight">{{ isCreatingFlight ? 'Guardando...' : 'Añadir Vuelo' }}</BaseButton>
        </div>
      </form>
    </BaseModal>

  </div>
</template>