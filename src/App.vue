<script setup>
// En este punto de la arquitectura, App.vue ya no necesita lógica.
// Todo el control lo tiene ahora el Vue Router y las Vistas (LoginView y DashboardView).
</script>

<template>
  <router-view />
</template>

<style>
/* Los estilos globales ya los tenemos en src/style.css con Tailwind, 
   así que aquí no necesitamos nada */
</style>