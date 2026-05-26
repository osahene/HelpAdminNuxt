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
  refresh: string | null
  loading: boolean
  isHydrated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refresh: null,
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
      const { $api } = useNuxtApp()  // ← get $api inside the action
      const { data } = await $api.register(payload)
      return data.value
    },

    // ── Email verification ────────────────────────────────────────────────────
    async verifyEmail(payload: { email: string; code: string }) {
      const { $api } = useNuxtApp()
      const { data } = await $api.verifyEmail(payload)
      return data.value
    },

    async resendEmailVerification(email: string) {
      const { $api } = useNuxtApp()
      await $api.resendPin(email)
    },

    // ── Admin authorization PIN ───────────────────────────────────────────────
    async verifyAuthPin(payload: { email: string; pin: string }) {
      const { $api } = useNuxtApp()
      const { data } = await $api.verifyPin(payload)
      return data.value
    },

    async resendAuthPin(email: string) {
      const { $api } = useNuxtApp()
      await $api.resendPin(email)
    },

    async login(credentials: { email: string; password: string; remember: boolean }) {
      const { $api } = useNuxtApp()
      this.loading = true
      try {
        const { data } = await $api.login(credentials)
        this.token = data.value.token
        this.user = data.value.user

        if (process.client) {
          localStorage.setItem('auth_token', this.token as string)
          localStorage.setItem('auth_user', JSON.stringify(this.user))
        }
      } finally {
        this.loading = false
      }
    },

    // ── Restore session on page load ──────────────────────────────────────────
    async fetchUser() {
      const { $api } = useNuxtApp()
      if (!this.token) {
        const tokenCookie = useCookie<string | null>('safelink_token')
        this.token = tokenCookie.value ?? null
      }

      if (!this.token) {
        this.isHydrated = true
        return
      }

      try {
        const { data } = await $api.me({ token: this.token })
        this.user = data.value ?? null
      } catch {
        this.clearAuth()
      } finally {
        this.isHydrated = true
      }
    },

    async logout() {
      const { $api } = useNuxtApp()
      this.refresh = localStorage.getItem('refresh_token') ?? null
      await $api.logout({ refresh: this.refresh })
      this.token = null
      this.user = null
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
      await navigateTo('/auth/login')
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

    clearAuth() {
      this.user = null
      this.token = null
      const tokenCookie = useCookie('safelink_token')
      tokenCookie.value = null
    },
  }
})