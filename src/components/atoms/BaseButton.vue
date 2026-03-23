<script setup>
import { computed } from 'vue'

// 1. Definimos las propiedades (Props) que este botón puede recibir
const props = defineProps({
  // Puede ser: 'primary' (azul), 'secondary' (gris), o 'danger' (rojo)
  variant: {
    type: String,
    default: 'primary' 
  },
  // Tipo nativo del botón (button, submit, reset)
  type: {
    type: String,
    default: 'button'
  },
  // Si está deshabilitado o cargando
  disabled: {
    type: Boolean,
    default: false
  }
})

// 2. Clases de Tailwind que TODOS los botones tendrán siempre
const baseClasses = "px-4 py-2 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"

// 3. Clases dinámicas dependiendo de la variante que elijamos
const variantClasses = computed(() => {
  // Si está deshabilitado, anulamos los colores y lo ponemos gris
  if (props.disabled) {
    return "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
  }

  // Diccionario de colores
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:bg-blue-800",
    secondary: "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 active:bg-gray-300",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700"
  }

  return variants[props.variant] || variants.primary
})
</script>

<template>
  <button 
    :type="type" 
    :disabled="disabled" 
    :class="[baseClasses, variantClasses]"
  >
    <slot>Botón</slot> 
  </button>
</template>