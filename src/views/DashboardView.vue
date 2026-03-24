<script setup>
import { ref, computed, onMounted } from 'vue' // <--- Añadimos computed
import { useRouter } from 'vue-router'
import BaseButton from '../components/atoms/BaseButton.vue'
import BaseInput from '../components/atoms/BaseInput.vue'
import ClientCard from '../components/molecules/ClientCard.vue'
import BaseModal from '../components/molecules/BaseModal.vue'

// NUEVAS IMPORTACIONES
import HeroHeader from '../components/organisms/HeroHeader.vue'
import AppFooter from '../components/organisms/AppFooter.vue'

// NUEVAS LIBRERÍAS UX
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const router = useRouter()
const toast = useToast() // <--- Instanciamos los Toasts

const agenteName = ref(localStorage.getItem('agente_nombre') || 'Agente')
const agenteId = localStorage.getItem('agente_id')

const clients = ref([])
const isLoading = ref(true)

// --- NUEVO: LÓGICA DEL BUSCADOR ---
const searchQuery = ref('') // Lo que el usuario escribe
// Computed property: Filtra la lista en tiempo real sin tocar la base de datos original
const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value
  
  const query = searchQuery.value.toLowerCase()
  return clients.value.filter(client => 
    client.name.toLowerCase().includes(query) || 
    client.email.toLowerCase().includes(query)
  )
})

const isModalOpen = ref(false)
const isSaving = ref(false)
const editingId = ref(null)
const form = ref({ name: '', email: '', phone: '', notes: '' })

const fetchClients = async () => {
  isLoading.value = true
  try {
    const response = await fetch(`http://localhost:3000/api/clientes/agente/${agenteId}`)
    if (!response.ok) throw new Error('Error al obtener clientes')
    clients.value = await response.json()
  } catch (error) {
    toast.error("Error de conexión con el servidor") // <--- Toast de error
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  localStorage.clear()
  router.push('/')
}

const openCreateModal = () => {
  editingId.value = null
  form.value = { name: '', email: '', phone: '', notes: '' }
  isModalOpen.value = true
}

const openEditModal = (clientData) => {
  editingId.value = clientData.id
  form.value = { name: clientData.name, email: clientData.email, phone: clientData.phone || '', notes: clientData.notes || '' }
  isModalOpen.value = true
}

const saveClient = async () => {
  isSaving.value = true
  const url = editingId.value ? `http://localhost:3000/api/clientes/${editingId.value}` : 'http://localhost:3000/api/clientes'
  const method = editingId.value ? 'PUT' : 'POST'

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, agentId: parseInt(agenteId) })
    })

    if (!response.ok) throw new Error('Error guardando en el servidor')
    
    isModalOpen.value = false
    fetchClients() 
    
    // <--- TOAST DE ÉXITO ESTILO PREMIUM --->
    toast.success(editingId.value ? 'Perfil actualizado' : 'Cliente creado con éxito')
    
  } catch (error) {
    toast.error("No se pudo guardar el cliente") // <--- Toast de error
  } finally {
    isSaving.value = false
  }
}

const deleteClient = async (id) => {
  // <--- NUEVO: SWEETALERT2 EN VEZ DEL FEO WINDOW.CONFIRM --->
  const result = await Swal.fire({
    title: '¿Eliminar este cliente?',
    text: "Se borrarán también todos sus viajes. ¡Esta acción no se puede deshacer!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // Rojo de Tailwind
    cancelButtonColor: '#64748b', // Gris de Tailwind
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true // Pone el botón de cancelar a la izquierda (mejor UX)
  })

  // Si el usuario le da a "Cancelar", detenemos la función aquí
  if (!result.isConfirmed) return

  try {
    const response = await fetch(`http://localhost:3000/api/clientes/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Error al borrar')
    
    fetchClients()
    toast.info("Cliente eliminado del sistema") // <--- Toast informativo
  } catch (error) {
    toast.error("No se pudo eliminar el cliente")
  }
}

onMounted(() => { fetchClients() })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col relative font-sans">
    
    <HeroHeader 
      :agentName="agenteName" 
      title="Gestión de Viajeros Premium"
      description="Administra los perfiles de tus clientes, diseña itinerarios inolvidables y mantén todo bajo control desde tu estudio virtual."
      @logout="logout" 
    />

    <main class="flex-grow max-w-7xl mx-auto w-full p-6 mt-8 mb-12">
      
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        
        <div class="relative w-full md:w-96">
          <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar viajero por nombre o correo..." 
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition-all"
          >
        </div>
        
        <BaseButton @click="openCreateModal" class="w-full md:w-auto shadow-md">
          + Añadir Nuevo Viajero
        </BaseButton>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-slate-500 animate-pulse">Cargando clientes desde la base de datos...</p>
      </div>

      <div v-else-if="filteredClients.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ClientCard 
          v-for="client in filteredClients" 
          :key="client.id" 
          :client="client" 
          @edit-client="openEditModal"
          @delete-client="deleteClient"
        />
      </div>

      <div v-else class="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
        <span class="text-5xl mb-4 block">{{ searchQuery ? '🕵️‍♂️' : '📭' }}</span>
        <h3 class="text-xl font-bold text-slate-700 mb-2">
          {{ searchQuery ? 'No hay coincidencias' : 'Tu cartera de clientes está vacía' }}
        </h3>
        <p class="text-slate-500 mb-6 max-w-md mx-auto">
          {{ searchQuery ? `Nadie coincide con la búsqueda "${searchQuery}". Revisa si lo has escrito bien.` : 'Destaca como agente añadiendo tu primer viajero y empezando a crearle itinerarios a medida.' }}
        </p>
        <BaseButton v-if="!searchQuery" @click="openCreateModal">Crear mi primer cliente</BaseButton>
        <BaseButton v-else variant="secondary" @click="searchQuery = ''">Limpiar búsqueda</BaseButton>
      </div>

    </main>

    <BaseModal :isOpen="isModalOpen" :title="editingId ? 'Editar Cliente' : 'Nuevo Cliente'" @close="isModalOpen = false">
      </BaseModal>

    <AppFooter />

  </div>
</template>