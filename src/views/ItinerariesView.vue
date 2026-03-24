<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import ItineraryCard from '../components/molecules/ItineraryCard.vue'
import BaseModal from '../components/molecules/BaseModal.vue'

// --- LIBRERÍAS DE UX ---
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

// ¡ESTA ES LA LÍNEA QUE SEGURAMENTE FALTABA! Enciende los Toasts
const toast = useToast() 

const clientId = route.params.id
const itineraries = ref([])
const isLoading = ref(true)

// Modal Viaje
const isTripModalOpen = ref(false)
const newTripName = ref('')
const isCreatingTrip = ref(false)
const editingTripId = ref(null)

// Modal Vuelos
const isFlightModalOpen = ref(false)
const isCreatingFlight = ref(false)
const selectedItineraryId = ref(null)
const editingFlightId = ref(null)
const newFlight = ref({ origin: '', destination: '', departureTime: '', arrivalTime: '', airline: '', flightNumber: '' })

// Impresión PDF
const printingTripId = ref(null)

const goBack = () => router.push('/dashboard')

// --- API: OBTENER DATOS ---
const fetchItineraries = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/itinerarios/cliente/${clientId}`)
    if (!response.ok) throw new Error('Error al obtener itinerarios')
    itineraries.value = await response.json()
  } catch (error) {
    toast.error("Error al cargar los viajes")
  } finally {
    isLoading.value = false
  }
}

// --- CRUD: VIAJES ---
const openCreateModal = () => {
  editingTripId.value = null
  newTripName.value = ''
  isTripModalOpen.value = true
}

const openEditModal = (itinerary) => {
  editingTripId.value = itinerary.id
  newTripName.value = itinerary.name
  isTripModalOpen.value = true
}

const saveItinerary = async () => {
  if (!newTripName.value.trim()) return 
  isCreatingTrip.value = true

  const url = editingTripId.value ? `http://localhost:3000/api/itinerarios/${editingTripId.value}` : 'http://localhost:3000/api/itinerarios'
  const method = editingTripId.value ? 'PUT' : 'POST'

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTripName.value, clientId: parseInt(clientId) })
    })
    
    if (!response.ok) throw new Error('Error al guardar')
    
    newTripName.value = ''
    editingTripId.value = null
    isTripModalOpen.value = false
    fetchItineraries() 
    
    // Disparamos el Toast
    toast.success(editingTripId.value ? 'Viaje actualizado' : 'Nuevo viaje creado') 
  } catch (error) {
    toast.error("No se pudo guardar el viaje")
  } finally {
    isCreatingTrip.value = false
  }
}

const deleteItinerary = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar este viaje?',
    text: "Se borrarán también todos sus vuelos.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  })

  if (!result.isConfirmed) return

  try {
    const response = await fetch(`http://localhost:3000/api/itinerarios/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al borrar')
    fetchItineraries()
    toast.info("Viaje eliminado correctamente")
  } catch (error) {
    toast.error("Hubo un problema al eliminar")
  }
}

// --- CRUD: VUELOS ---
const formatForInput = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toISOString().slice(0, 16)
}

const openCreateFlightModal = (itineraryId) => {
  editingFlightId.value = null
  selectedItineraryId.value = itineraryId
  newFlight.value = { origin: '', destination: '', departureTime: '', arrivalTime: '', airline: '', flightNumber: '' }
  isFlightModalOpen.value = true
}

const openEditFlightModal = (flight) => {
  editingFlightId.value = flight.id
  selectedItineraryId.value = flight.itineraryId
  newFlight.value = { ...flight, departureTime: formatForInput(flight.departureTime), arrivalTime: formatForInput(flight.arrivalTime) }
  isFlightModalOpen.value = true
}

const saveFlight = async () => {
  isCreatingFlight.value = true
  const url = editingFlightId.value ? `http://localhost:3000/api/vuelos/${editingFlightId.value}` : 'http://localhost:3000/api/vuelos'
  const method = editingFlightId.value ? 'PUT' : 'POST'

  try {
    const payload = {
      origin: newFlight.value.origin,
      destination: newFlight.value.destination,
      departureTime: newFlight.value.departureTime,
      arrivalTime: newFlight.value.arrivalTime,
      airline: newFlight.value.airline,
      flightNumber: newFlight.value.flightNumber,
      itineraryId: selectedItineraryId.value
    }

    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

    if (!response.ok) throw new Error('Error al guardar el vuelo')
    
    isFlightModalOpen.value = false
    fetchItineraries()
    
    // Disparamos el Toast del vuelo
    toast.success(editingFlightId.value ? 'Vuelo actualizado' : 'Tramo de vuelo añadido')
  } catch (error) {
    toast.error("No se pudo guardar el vuelo")
  } finally {
    isCreatingFlight.value = false
  }
}

const deleteFlight = async (flightId) => {
  const result = await Swal.fire({
    title: '¿Quitar este vuelo?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, quitar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  })

  if (!result.isConfirmed) return

  try {
    const response = await fetch(`http://localhost:3000/api/vuelos/${flightId}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al borrar vuelo')
    fetchItineraries()
    toast.info("Tramo de vuelo eliminado")
  } catch (error) {
    toast.error("No se pudo eliminar el vuelo")
  }
}

// --- UTILIDADES ---
const printSingleItinerary = async (id) => {
  printingTripId.value = id
  await nextTick()
  window.print()
  printingTripId.value = null
}

onMounted(() => fetchItineraries())
</script>
<template>
  <div class="min-h-screen bg-slate-50 flex flex-col relative">
    
    <header class="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10" print:hidden>
      <BaseButton variant="secondary" @click="goBack" class="py-1 px-3 text-sm">← Volver</BaseButton>
      <h1 class="text-xl font-bold text-slate-800">Itinerarios del Cliente</h1>
    </header>

    <main class="flex-grow max-w-4xl mx-auto w-full p-6 mt-4">
      
      <div class="flex justify-between items-center mb-8" :class="{ 'print:hidden': printingTripId }">
        <h2 class="text-2xl font-bold text-slate-800">Viajes Programados</h2>
        <div class="print:hidden">
          <BaseButton @click="openCreateModal">+ Nuevo Viaje</BaseButton>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-slate-500 animate-pulse">Cargando itinerarios y vuelos...</p>
      </div>

      <div v-else-if="itineraries.length > 0" class="space-y-6">
        <ItineraryCard 
          v-for="itinerary in itineraries" 
          :key="itinerary.id" 
          :itinerary="itinerary" 
          :class="{ 'print:hidden': printingTripId !== null && printingTripId !== itinerary.id }"
          @print-itinerary="printSingleItinerary"
          @add-flight="openCreateFlightModal"
          @edit-itinerary="openEditModal"
          @delete-itinerary="deleteItinerary"
          @edit-flight="openEditFlightModal"
          @delete-flight="deleteFlight"
        />
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