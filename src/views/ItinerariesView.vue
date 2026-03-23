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
const editingTripId = ref(null)

// NUEVO: Variables para el Modal de Vuelos
const isFlightModalOpen = ref(false)
const isCreatingFlight = ref(false)
const selectedItineraryId = ref(null) // Para saber a qué viaje le estamos metiendo el vuelo
const editingFlightId = ref(null) // <--- NUEVO


// Función para formatear la fecha de la BD (ISO) al formato que exige el input (YYYY-MM-DDTHH:mm)
const formatForInput = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toISOString().slice(0, 16)
}

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

// Función inteligente: Crea o Actualiza dependiendo de si hay un ID guardado
const saveItinerary = async () => {
  if (!newTripName.value.trim()) return 
  isCreatingTrip.value = true

  // Si tenemos un ID, la URL es la de edición (PUT), si no, la de creación (POST)
  const url = editingTripId.value 
    ? `http://localhost:3000/api/itinerarios/${editingTripId.value}`
    : 'http://localhost:3000/api/itinerarios'
    
  const method = editingTripId.value ? 'PUT' : 'POST'

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTripName.value, clientId: clientId })
    })
    
    if (!response.ok) throw new Error('Error al guardar el viaje')
    
    // Limpieza
    newTripName.value = ''
    editingTripId.value = null
    isTripModalOpen.value = false
    fetchItineraries() // Recargamos la lista
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingTrip.value = false
  }
}

// Función para abrir el modal en modo Edición
const openEditModal = (itinerary) => {
  editingTripId.value = itinerary.id
  newTripName.value = itinerary.name // Rellenamos el input con el nombre actual
  isTripModalOpen.value = true
}

// Función para abrir el modal en modo Creación (limpia todo por si acaso)
const openCreateModal = () => {
  editingTripId.value = null
  newTripName.value = ''
  isTripModalOpen.value = true
}

// Función para Eliminar un viaje
const deleteItinerary = async (id) => {
  // Pedimos confirmación antes de borrar (buena práctica UX)
  if (!window.confirm('¿Estás seguro de que quieres borrar este viaje y todos sus vuelos? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/itinerarios/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Error al borrar')
    fetchItineraries() // Recargamos la lista tras borrar
  } catch (error) {
    console.error("Error al borrar:", error)
  }
}

// Abrir modal para CREAR
const openCreateFlightModal = (itineraryId) => {
  editingFlightId.value = null
  selectedItineraryId.value = itineraryId
  newFlight.value = { origin: '', destination: '', departureTime: '', arrivalTime: '', airline: '', flightNumber: '' }
  isFlightModalOpen.value = true
}

// Abrir modal para EDITAR
const openEditFlightModal = (flight) => {
  editingFlightId.value = flight.id
  selectedItineraryId.value = flight.itineraryId
  // Rellenamos con los datos del vuelo, formateando las fechas para que el input las entienda
  newFlight.value = { 
    ...flight,
    departureTime: formatForInput(flight.departureTime),
    arrivalTime: formatForInput(flight.arrivalTime)
  }
  isFlightModalOpen.value = true
}

// Función Híbrida: CREAR o ACTUALIZAR
const saveFlight = async () => {
  isCreatingFlight.value = true
  const url = editingFlightId.value 
    ? `http://localhost:3000/api/vuelos/${editingFlightId.value}`
    : 'http://localhost:3000/api/vuelos'
  const method = editingFlightId.value ? 'PUT' : 'POST'

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newFlight.value, itineraryId: selectedItineraryId.value })
    })

    if (!response.ok) throw new Error('Error al guardar el vuelo')
    
    isFlightModalOpen.value = false
    fetchItineraries() // Recargamos la lista
  } catch (error) {
    console.error(error)
  } finally {
    isCreatingFlight.value = false
  }
}

// BORRAR Vuelo
const deleteFlight = async (flightId) => {
  if (!window.confirm('¿Eliminar este tramo de vuelo?')) return

  try {
    const response = await fetch(`http://localhost:3000/api/vuelos/${flightId}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al borrar vuelo')
    fetchItineraries()
  } catch (error) {
    console.error(error)
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
        <BaseButton @click="openCreateModal">+ Nuevo Viaje</BaseButton>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-slate-500 animate-pulse">Cargando itinerarios y vuelos...</p>
      </div>

      <div v-else-if="itineraries.length > 0" class="space-y-6">
        <ItineraryCard 
          v-for="itinerary in itineraries" 
          :key="itinerary.id" 
          :itinerary="itinerary" 
          @add-flight="openCreateFlightModal" @edit-itinerary="openEditModal"
          @delete-itinerary="deleteItinerary"
          @edit-flight="openEditFlightModal" @delete-flight="deleteFlight"      />
      </div>

      <div v-else class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
        <span class="text-4xl mb-3 block">🏝️</span>
        <h3 class="text-lg font-bold text-slate-700">Sin viajes a la vista</h3>
        <p class="text-slate-500 mb-4">Este cliente aún no tiene ningún itinerario creado.</p>
        <BaseButton @click="openCreateModal">Crear mi primer viaje</BaseButton>
      </div>
    </main>

    <BaseModal 
      :isOpen="isTripModalOpen" 
      :title="editingTripId ? 'Editar Viaje' : 'Crear Nuevo Viaje'" 
      @close="isTripModalOpen = false"
    >
      <form @submit.prevent="saveItinerary" class="space-y-4">
        <BaseInput v-model="newTripName" label="Nombre del Itinerario" required />
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton type="button" variant="secondary" @click="isTripModalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :disabled="isCreatingTrip">
            {{ isCreatingTrip ? 'Guardando...' : (editingTripId ? 'Actualizar Viaje' : 'Crear Viaje') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal :isOpen="isFlightModalOpen" :title="editingFlightId ? 'Editar Tramo de Vuelo' : 'Añadir Tramo de Vuelo'" @close="isFlightModalOpen = false">
      <form @submit.prevent="saveFlight" class="space-y-4">
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
          <BaseButton type="submit" :disabled="isCreatingFlight">
            {{ isCreatingFlight ? 'Guardando...' : (editingFlightId ? 'Actualizar Vuelo' : 'Añadir Vuelo') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

  </div>
</template>