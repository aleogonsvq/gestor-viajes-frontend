<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Modal'
  }
})

// Emitimos un evento cuando el usuario quiera cerrarlo
defineEmits(['close'])
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
    
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
      
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-700 transition-colors text-xl font-bold">
          ✕
        </button>
      </div>

      <div class="p-6">
        <slot></slot>
      </div>

    </div>
  </div>
</template>