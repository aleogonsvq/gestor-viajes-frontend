<script setup>
// 1. Definimos las propiedades que recibe el input
const props = defineProps({
  // El valor actual (necesario para el v-model)
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // El texto que va encima del input
  label: {
    type: String,
    default: ''
  },
  // Tipo nativo (text, email, password, number...)
  type: {
    type: String,
    default: 'text'
  },
  // El texto fantasma de ayuda
  placeholder: {
    type: String,
    default: ''
  },
  // Si hay un error, le pasamos el mensaje aquí
  error: {
    type: String,
    default: ''
  }
})

// 2. Definimos los eventos que este componente puede emitir hacia afuera
// 'update:modelValue' es el evento estándar de Vue para que funcione v-model
const emit = defineEmits(['update:modelValue'])

// Función que se ejecuta cada vez que el usuario teclea algo
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="flex flex-col w-full mb-4">
    
    <label v-if="label" class="mb-1 text-sm font-semibold text-slate-700">
      {{ label }}
    </label>

    <input 
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput"
      class="px-4 py-2 bg-white border rounded-lg outline-none transition-colors duration-200 focus:ring-2"
      :class="[
        error 
          ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50' 
          : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-400'
      ]"
    />

    <span v-if="error" class="mt-1 text-xs font-medium text-red-500">
      {{ error }}
    </span>

  </div>
</template>