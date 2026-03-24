<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Átomos y Moléculas
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import ItineraryCard from '../components/molecules/ItineraryCard.vue'
import BaseModal from '../components/molecules/BaseModal.vue'

// NUEVOS ORGANISMOS (Diseño Premium)
import HeroHeader from '../components/organisms/HeroHeader.vue'
import AppFooter from '../components/organisms/AppFooter.vue'

// UX Premium
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const clientId = route.params.id

// Datos de Sesión y Cliente
const agenteName = ref(localStorage.getItem('agente_nombre') || 'Agente')
const clientName = ref('Cargando viajero...') // Lo usaremos para el título gigante

const itineraries = ref([])
const isLoading = ref(true)

// Variables Modales
const isTripModalOpen = ref(false)
const newTripName = ref('')
const isCreatingTrip = ref(false)
const editingTripId = ref(null)

const isFlightModalOpen = ref(false)
const isCreatingFlight = ref(false)
const selectedItineraryId = ref(null)
const editingFlightId = ref(null)
const newFlight = ref({ origin: '', destination: '', departureTime: '', arrivalTime: '', airline: '', flightNumber: '' })

const printingTripId = ref(null)

// --- NAVEGACIÓN ---
const goBack = () => router.push('/dashboard')

const logout = () => {
  localStorage.clear()
  router.push('/')
}

// --- API: OBTENER DATOS ---
const fetchClientData = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/clientes/${clientId}`)
    if (response.ok) {
      const data = await response.json()
      clientName.value = data.name
    } else {
      clientName.value = 'Viajero'
    }
  } catch (error) {
    clientName.value = 'Viajero'
  }
}

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

onMounted(() => {
  fetchClientData() // Obtenemos el nombre del cliente
  fetchItineraries()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col relative font-sans">
    
    <HeroHeader 
      :agentName="agenteName" 
      :title="`Viajes de ${clientName}`"
      description="Diseña, organiza y exporta en PDF todos los detalles de las aventuras de este viajero."
      @logout="logout" 
    />

    <main class="flex-grow max-w-4xl mx-auto w-full p-6 mt-6 mb-12">
      
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100" :class="{ 'print:hidden': printingTripId }">
        <BaseButton variant="secondary" @click="goBack" class="shadow-sm w-full sm:w-auto text-slate-700 bg-slate-100 hover:bg-slate-200">
          ← Volver al Panel
        </BaseButton>
        <BaseButton @click="openCreateModal" class="shadow-md w-full sm:w-auto">
          + Nuevo Viaje
        </BaseButton>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-slate-500 animate-pulse">Cargando la hoja de ruta...</p>
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

      <div v-else class="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
        <span class="text-5xl mb-4 block">🗺️</span>
        <h3 class="text-xl font-bold text-slate-700 mb-2">Lienzo en blanco</h3>
        <p class="text-slate-500 mb-6 max-w-md mx-auto">
          Aún no has diseñado ninguna ruta para este viajero. Haz clic en "Nuevo Viaje" para empezar a organizar su próxima aventura.
        </p>
      </div>
    </main>

    <BaseModal :isOpen="isTripModalOpen" :title="editingTripId ? 'Editar Viaje' : 'Crear Nuevo Viaje'" @close="isTripModalOpen = false">
      <form @submit.prevent="saveItinerary" class="space-y-4">
        <BaseInput v-model="newTripName" label="Nombre del Itinerario" placeholder="Ej: Luna de Miel en Bali" required />
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton type="button" variant="secondary" @click="isTripModalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :disabled="isCreatingTrip">{{ isCreatingTrip ? 'Guardando...' : (editingTripId ? 'Actualizar Viaje' : 'Crear Viaje') }}</BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal :isOpen="isFlightModalOpen" :title="editingFlightId ? 'Editar Tramo de Vuelo' : 'Añadir Tramo de Vuelo'" @close="isFlightModalOpen = false">
      <form @submit.prevent="saveFlight" class="space-y-4">
        <BaseInput v-model="newFlight.airline" label="Aerolínea" placeholder="Ej: Iberia" required />
        <BaseInput v-model="newFlight.flightNumber" label="Número de Vuelo" placeholder="Ej: IB-3450" required />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="newFlight.origin" label="Origen (IATA)" placeholder="MAD" required />
          <BaseInput v-model="newFlight.destination" label="Destino (IATA)" placeholder="JFK" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="newFlight.departureTime" label="Salida" type="datetime-local" required />
          <BaseInput v-model="newFlight.arrivalTime" label="Llegada" type="datetime-local" required />
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton type="button" variant="secondary" @click="isFlightModalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :disabled="isCreatingFlight">{{ isCreatingFlight ? 'Guardando...' : (editingFlightId ? 'Actualizar Vuelo' : 'Añadir Vuelo') }}</BaseButton>
        </div>
      </form>
    </BaseModal>

    <AppFooter />

  </div>
</template>