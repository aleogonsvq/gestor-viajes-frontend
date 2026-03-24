<script setup>
const props = defineProps({
  itinerary: { type: Object, required: true }
})

// 1. Guardamos el defineEmits en la variable "emit" y añadimos 'print-itinerary'
const emit = defineEmits(['add-flight', 'edit-itinerary', 'delete-itinerary', 'edit-flight', 'delete-flight', 'print-itinerary'])

const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }
  return new Date(dateString).toLocaleDateString('es-ES', options)
}

// 2. Ahora, en lugar de imprimir directamente, emitimos el evento con el ID de esta tarjeta
const downloadPDF = () => {
  emit('print-itinerary', props.itinerary.id)
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6 print:shadow-none print:border-slate-400">
    
    <div class="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center print:bg-slate-100 print:border-slate-300">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-bold text-blue-900 print:text-slate-900">🗺️ {{ itinerary.name }}</h3>
        <span class="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider print:bg-slate-200 print:text-slate-800">
          {{ itinerary.status }}
        </span>
      </div>
      
      <div class="flex gap-3 print:hidden">
        <button @click="downloadPDF" class="text-xl hover:scale-110 transition-transform" title="Guardar como PDF">📄</button>
        <button @click="$emit('edit-itinerary', itinerary)" class="text-lg hover:scale-110 transition-transform" title="Editar Viaje">✏️</button>
        <button @click="$emit('delete-itinerary', itinerary.id)" class="text-lg hover:scale-110 transition-transform" title="Borrar Viaje">🗑️</button>
      </div>
    </div>

    <div class="p-6">
      <h4 class="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider print:text-slate-800">Tramos de Vuelo</h4>
      
      <div v-if="itinerary.flights && itinerary.flights.length > 0" class="space-y-4">
        <div v-for="flight in itinerary.flights" :key="flight.id" class="flex items-center bg-slate-50 border border-slate-100 p-4 rounded-lg relative print:border-slate-300 print:bg-white">
          
          <div class="w-1/4">
            <p class="font-bold text-slate-800">{{ flight.airline }}</p>
            <p class="text-xs text-slate-500">{{ flight.flightNumber }}</p>
          </div>

          <div class="w-1/4 text-right">
            <p class="text-xl font-bold text-slate-700">{{ flight.origin }}</p>
            <p class="text-xs text-slate-500">{{ formatDate(flight.departureTime) }}</p>
          </div>

          <div class="w-1/4 flex justify-center text-blue-400 print:text-slate-500">
            <span>✈️</span>
          </div>

          <div class="w-1/4">
            <p class="text-xl font-bold text-slate-700">{{ flight.destination }}</p>
            <p class="text-xs text-slate-500">{{ formatDate(flight.arrivalTime) }}</p>
          </div>

          <div class="absolute right-3 top-3 flex gap-3 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200 print:hidden">
            <button @click="$emit('edit-flight', flight)" class="text-sm hover:scale-110" title="Editar Vuelo">✏️</button>
            <button @click="$emit('delete-flight', flight.id)" class="text-sm hover:scale-110" title="Borrar Vuelo">🗑️</button>
          </div>

        </div>
      </div>

      <div v-else class="text-center py-6 text-slate-500 text-sm italic">
        No hay vuelos añadidos a este itinerario todavía.
      </div>
      
      <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end print:hidden">
        <button @click="$emit('add-flight', itinerary.id)" class="text-sm font-semibold text-blue-600">
          + Añadir Tramo de Vuelo
        </button>
      </div>

    </div>
  </div>
</template>