<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '../atoms/BaseButton.vue'

// 1. Recibimos los datos del cliente
const props = defineProps({
  client: { type: Object, required: true }
})

// 2. Definimos qué "gritos" (eventos) puede dar esta tarjeta hacia el Dashboard
defineEmits(['edit-client', 'delete-client'])

const router = useRouter()

// 3. Función de navegación a sus viajes
const verItinerarios = () => {
  router.push(`/cliente/${props.client.id}/itinerarios`)
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
    
    <div class="flex justify-between items-start mb-4">
      
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
          {{ client.name.charAt(0).toUpperCase() }}
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-800 leading-tight">{{ client.name }}</h3>
          <p class="text-sm text-slate-500">{{ client.email }}</p>
        </div>
      </div>

      <div class="flex gap-2 shrink-0">
        <button @click="$emit('edit-client', client)" class="text-sm hover:scale-110 transition-transform" title="Editar Cliente">✏️</button>
        <button @click="$emit('delete-client', client.id)" class="text-sm hover:scale-110 transition-transform text-red-500 hover:text-red-700" title="Borrar Cliente">🗑️</button>
      </div>

    </div>

    <div class="flex-grow space-y-2 mb-6">
      <p v-if="client.phone" class="text-sm text-slate-600">
        <span class="font-medium">📞 Teléfono:</span> {{ client.phone }}
      </p>
      <p v-if="client.notes" class="text-sm text-slate-600 line-clamp-2">
        <span class="font-medium">📝 Notas:</span> {{ client.notes }}
      </p>
    </div>

    <BaseButton class="w-full mt-auto" variant="secondary" @click="verItinerarios">
      Ver Itinerarios
    </BaseButton>

  </div>
</template>