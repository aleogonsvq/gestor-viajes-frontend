<script setup>
import BaseButton from '../atoms/BaseButton.vue'

defineProps({
  title: { type: String, default: 'Diseña experiencias únicas' },
  description: { type: String, default: 'Gestiona los perfiles y viajes de tus clientes desde un único panel centralizado.' },
  agentName: { type: String, default: 'Agente' }
})

defineEmits(['logout'])
</script>

<template>
  <header class="relative bg-slate-900 text-white overflow-hidden print:hidden shadow-lg">
    
    <div class="absolute inset-0 opacity-40 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop');"></div>
    
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

    <div class="relative max-w-7xl mx-auto px-6 py-10 md:py-16">
      
      <div class="flex justify-between items-center mb-10 md:mb-16">
        <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
          <span class="text-xl">✈️</span>
          <span class="font-bold tracking-wider uppercase text-sm">Amadeus Studio</span>
        </div>
        
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium hidden sm:block bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            Hola, {{ agentName }}
          </span>
          <button @click="$emit('logout')" class="text-sm font-bold bg-white text-slate-900 px-5 py-2 rounded-lg hover:bg-slate-200 transition-colors shadow-md">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div class="max-w-2xl">
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-md">
          {{ title }}
        </h1>
        <p class="text-lg md:text-xl text-slate-300 font-light max-w-xl drop-shadow">
          {{ description }}
        </p>
      </div>
      
    </div>
  </header>
</template>