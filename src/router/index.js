// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ItinerariesView from '../views/ItinerariesView.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    // Si ya estamos logueados y entramos a '/', nos manda directos al dashboard
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('viajes_token')) {
        next('/dashboard')
      } else {
        next()
      }
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    // Metadato para indicar que esta ruta es secreta
    meta: { requiresAuth: true }
  },
  {
    path: '/cliente/:id/itinerarios',
    name: 'Itinerarios',
    component: ItinerariesView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// GUARDIÁN GLOBAL: Se ejecuta ANTES de cada cambio de página
router.beforeEach((to, from, next) => {
  // Verificamos si la ruta a la que quiere ir requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('viajes_token')

  // Si requiere auth y NO tiene token, lo echamos al Login
  if (requiresAuth && !isAuthenticated) {
    next('/')
  } else {
    // Si todo está bien, le dejamos pasar
    next()
  }
})

export default router