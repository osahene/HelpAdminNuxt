// stores/auth.ts
import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst'
 emailVerified: boolean
  authorised: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  isHydrated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    isHydrated: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
       // ── Registration ──────────────────────────────────────────────────────────
    async register(payload: {
      firstName: string
      lastName: string
      name: string
      role: string
      email: string
      password: string
    }) {
      const { data } = await useApi<{ message: string }>('/auth/register', {
        method: 'POST',
        body: payload,
      })
      // API sends a 6-digit code to the email — no token yet
      return data.value
    },

    // ── Email verification ────────────────────────────────────────────────────
    async verifyEmail(payload: { email: string; code: string }) {
      const { data } = await useApi<{ message: string }>('/auth/verify-email', {
        method: 'POST',
        body: payload,
      })
      return data.value
    },

    async resendEmailVerification(email: string) {
      await useApi('/auth/resend-verification', {
        method: 'POST',
        body: { email },
      })
    },

    // ── Admin authorization PIN ───────────────────────────────────────────────
    async verifyAuthPin(payload: { email: string; pin: string }) {
      const { data } = await useApi<{ message: string }>('/auth/verify-pin', {
        method: 'POST',
        body: payload,
      })
      return data.value
    },

    async resendAuthPin(email: string) {
      await useApi('/auth/resend-pin', {
        method: 'POST',
        body: { email },
      })
    },
    async login(credentials: { email: string; password: string, remember: boolean }) {
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

      // ── Restore session on page load ──────────────────────────────────────────
    async fetchUser() {
      // Restore token from cookie if not already in memory
      if (!this.token) {
        const tokenCookie = useCookie<string | null>('safelink_token')
        this.token = tokenCookie.value ?? null
      }

      if (!this.token) {
        this.isHydrated = true
        return
      }

      try {
        const { data } = await useApi<User>('/auth/me')
        this.user = data.value ?? null
      } catch {
        // Token is invalid / expired — clear it
        this.clearAuth()
      } finally {
        this.isHydrated = true
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
    },
    // ── Helpers ───────────────────────────────────────────────────────────────
    clearAuth() {
      this.user = null
      this.token = null
      const tokenCookie = useCookie('safelink_token')
      tokenCookie.value = null
    },
  }
})