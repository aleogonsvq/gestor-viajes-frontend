<template>
  <footer class="bg-slate-900 text-slate-400 py-8 mt-auto border-t border-slate-800 print:hidden">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
      
      <div class="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
        <span class="text-2xl">✈️</span>
        <span class="text-white font-bold text-lg tracking-wide">Amadeus Studio</span>
      </div>
      
      <p class="text-sm">
        © {{ new Date().getFullYear() }} Desarrollado por Alberto. Todos los derechos reservados.
      </p>
      
      <div class="flex gap-6 text-sm">
        <a href="#" class="hover:text-white transition-colors">Soporte</a>
        <a href="#" class="hover:text-white transition-colors">Privacidad</a>
      </div>
      
    </div>
  </footer>
</template>