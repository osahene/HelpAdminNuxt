// stores/auth.ts
import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'moderator'
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true
      try {
        const { data, error } = await useFetch('/api/admin/login', {
          method: 'POST',
          body: credentials
        })
        if (error.value) throw new Error(error.value.message)
        
        this.token = data.value.token
        this.user = data.value.user
        
        // Persist to localStorage for page reloads
        if (process.client) {
          localStorage.setItem('auth_token', this.token)
          localStorage.setItem('auth_user', JSON.stringify(this.user))
        }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
      navigateTo('/login')
    },

    initializeFromStorage() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const user = localStorage.getItem('auth_user')
        if (token && user) {
          this.token = token
          try {
            this.user = JSON.parse(user)
          } catch {
            this.logout()
          }
        }
      }
    }
  }
})