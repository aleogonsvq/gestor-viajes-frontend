<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import ClientCard from '../components/molecules/ClientCard.vue'
import BaseModal from '../components/molecules/BaseModal.vue'

const router = useRouter()
// Recuperamos tus datos de sesión
const agenteName = ref(localStorage.getItem('agente_nombre') || 'Agente')
const agenteId = localStorage.getItem('agente_id')

// Estado de la Lista de Clientes
const clients = ref([])
const isLoading = ref(true)

// Estado del Modal de Clientes
const isModalOpen = ref(false)
const isSaving = ref(false)
const editingId = ref(null) // Si es null, estamos creando. Si tiene un número, estamos editando.
const form = ref({ name: '', email: '', phone: '', notes: '' })

// --- FUNCIONES DE LECTURA Y SESIÓN ---

const fetchClients = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/clientes/agente/${agenteId}`)
    if (!response.ok) throw new Error('Error al obtener clientes')
    clients.value = await response.json()
  } catch (error) {
    console.error("Error:", error)
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  localStorage.clear()
  router.push('/')
}

// --- FUNCIONES DEL CRUD (CREAR, EDITAR, BORRAR) ---

// Prepara el modal para CREAR
const openCreateModal = () => {
  editingId.value = null
  form.value = { name: '', email: '', phone: '', notes: '' } // Limpiamos campos
  isModalOpen.value = true
}

// Prepara el modal para EDITAR
const openEditModal = (clientData) => {
  editingId.value = clientData.id
  form.value = { 
    name: clientData.name, 
    email: clientData.email, 
    phone: clientData.phone || '', 
    notes: clientData.notes || '' 
  }
  isModalOpen.value = true
}

// Función Híbrida: Guarda un cliente nuevo (POST) o actualiza uno existente (PUT)
const saveClient = async () => {
  isSaving.value = true
  
  const url = editingId.value 
    ? `http://localhost:3000/api/clientes/${editingId.value}`
    : 'http://localhost:3000/api/clientes'
    
  const method = editingId.value ? 'PUT' : 'POST'

  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      notes: form.value.notes,
      agentId: parseInt(agenteId) // Vital para asociarlo a ti
    }

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Error guardando en el servidor')
    
    isModalOpen.value = false // Cerramos el modal
    fetchClients() // Recargamos la lista actualizada
  } catch (error) {
    console.error(error)
    alert("Error al guardar: " + error.message)
  } finally {
    isSaving.value = false
  }
}

// Función para ELIMINAR
const deleteClient = async (id) => {
  if (!window.confirm('¿Borrar este cliente y TODOS sus viajes de forma permanente?')) return

  try {
    const response = await fetch(`http://localhost:3000/api/clientes/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al borrar')
    fetchClients() // Recargamos la lista tras borrar
  } catch (error) {
    console.error(error)
    alert("Error al borrar el cliente")
  }
}

// Cargar los clientes nada más entrar a la página
onMounted(() => {
  fetchClients()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col relative">
    
    <header class="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <span class="text-2xl">✈️</span>
        <h1 class="text-xl font-bold text-slate-800 hidden sm:block">Gestor Amadeus</h1>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-slate-600">Hola, {{ agenteName }}</span>
        <BaseButton variant="secondary" @click="logout" class="text-sm py-1.5 px-3">Salir</BaseButton>
      </div>
    </header>

    <main class="flex-grow max-w-7xl mx-auto w-full p-6 mt-4">
      
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Mis Clientes</h2>
          <p class="text-slate-500">Gestiona los perfiles y viajes de tus viajeros.</p>
        </div>
        <BaseButton @click="openCreateModal">+ Nuevo Cliente</BaseButton>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-slate-500 animate-pulse">Cargando clientes desde la base de datos...</p>
      </div>

      <div v-else-if="clients.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ClientCard 
          v-for="client in clients" 
          :key="client.id" 
          :client="client" 
          @edit-client="openEditModal"
          @delete-client="deleteClient"
        />
      </div>

      <div v-else class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
        <span class="text-4xl mb-3 block">📭</span>
        <h3 class="text-lg font-bold text-slate-700">Aún no tienes clientes</h3>
        <p class="text-slate-500 mb-4">Empieza añadiendo tu primer viajero para crearle itinerarios.</p>
        <BaseButton @click="openCreateModal">Crear mi primer cliente</BaseButton>
      </div>

    </main>

    <BaseModal 
      :isOpen="isModalOpen" 
      :title="editingId ? 'Editar Cliente' : 'Crear Nuevo Cliente'" 
      @close="isModalOpen = false"
    >
      <form @submit.prevent="saveClient" class="space-y-4">
        <BaseInput v-model="form.name" label="Nombre Completo" placeholder="Ej: Marta Viajera" required />
        <BaseInput v-model="form.email" label="Correo Electrónico" type="email" placeholder="marta@ejemplo.com" required />
        <BaseInput v-model="form.phone" label="Teléfono (Opcional)" placeholder="+34 600 000 000" />
        <BaseInput v-model="form.notes" label="Notas Adicionales (Opcional)" placeholder="Ej: Alergias, preferencias..." />
        
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton type="button" variant="secondary" @click="isModalOpen = false">Cancelar</BaseButton>
          <BaseButton type="submit" :disabled="isSaving">
            {{ isSaving ? 'Guardando...' : (editingId ? 'Actualizar Perfil' : 'Crear Cliente') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

  </div>
</template>