<script setup>
defineProps({
  itinerary: { type: Object, required: true }
})
// NUEVO: Le decimos a Vue que esta tarjeta puede emitir un evento
defineEmits(['add-flight'])
// Función helper para poner las fechas bonitas (ej: "15 oct 2026, 15:30")
const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
    
    <div class="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
      <h3 class="text-lg font-bold text-blue-900">🗺️ {{ itinerary.name }}</h3>
      <span class="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
        {{ itinerary.status }}
      </span>
    </div>

    <div class="p-6">
      <h4 class="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Tramos de Vuelo</h4>
      
      <div v-if="itinerary.flights && itinerary.flights.length > 0" class="space-y-4">
        <div v-for="flight in itinerary.flights" :key="flight.id" class="flex items-center bg-slate-50 border border-slate-100 p-4 rounded-lg">
          
          <div class="w-1/4">
            <p class="font-bold text-slate-800">{{ flight.airline }}</p>
            <p class="text-xs text-slate-500">{{ flight.flightNumber }}</p>
          </div>

          <div class="w-1/4 text-right">
            <p class="text-xl font-bold text-slate-700">{{ flight.origin }}</p>
            <p class="text-xs text-slate-500">{{ formatDate(flight.departureTime) }}</p>
          </div>

          <div class="w-1/4 flex justify-center text-blue-400">
            <span>✈️</span>
          </div>

          <div class="w-1/4">
            <p class="text-xl font-bold text-slate-700">{{ flight.destination }}</p>
            <p class="text-xs text-slate-500">{{ formatDate(flight.arrivalTime) }}</p>
          </div>

        </div>
      </div>

      <div v-else class="text-center py-6 text-slate-500 text-sm italic">
        No hay vuelos añadidos a este itinerario todavía.
      </div>
      <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end">
        <button 
          @click="$emit('add-flight', itinerary.id)" 
          class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          + Añadir Tramo de Vuelo
        </button>
      </div>
    </div>
  </div>
</template>