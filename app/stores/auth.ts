// stores/auth.ts
import { defineStore } from 'pinia'

// Maps cleanly against fields transmitted by AdminUserSerializer
interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst'
  email_verified: boolean
  authorised: boolean
  created_at: string
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
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'super_admin'
  },

  actions: {
    // ── Registration Flow ───────────────────────────────────────────────────
    async register(payload: {
      first_name: string
      last_name: string
      role: string
      email: string
      password: string
      confirm_password: string
    }) {
      const { $api } = useNuxtApp()
      const response = await $api.register(payload)
      return response?.data || response
    },

    // ── Verification Subsystem ──────────────────────────────────────────────
    async verifyEmail(payload: { email: string; code: string }) {
      const { $api } = useNuxtApp()
      const response = await $api.verifyEmail(payload)
      return response?.data || response
    },

    async resendEmailVerification(email: string) {
      const { $api } = useNuxtApp()
      // Maps to /trap_admin/resend-pin/ via request data parsing
      const response = await $api.resendPin({ email })
      return response?.data || response
    },

    // ── Security Authorization Verification ───────────────────────────────
    async verifyAuthPin(payload: { email: string; pin: string }) {
      const { $api } = useNuxtApp()
      const response = await $api.verifyPin(payload)
      return response?.data || response
    },

    async resendAuthPin(email: string) {
      const { $api } = useNuxtApp()
      const response = await $api.resendPin({ email })
      return response?.data || response
    },

    // ── Active Core Login Routine ──────────────────────────────────────────
    async login(credentials: { email: string; password: string; remember?: boolean }) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.login(credentials)
        const payload = response?.data || response

        if (payload?.token) {
          this.token = payload.token
          this.refresh = payload.refresh ?? null
          this.user = payload.user ?? null

          // Sync auth state locally if client conditions match
          if (process.client) {
            localStorage.setItem('auth_token', this.token as string)
            if (this.refresh) {
              localStorage.setItem('refresh_token', this.refresh)
            }
            localStorage.setItem('auth_user', JSON.stringify(this.user))
          }

          // Store under the same cookie names the axios plugin reads to build
          // the Authorization header (see plugins/axiosInstance.ts) — writing
          // to a different cookie here left every request unauthenticated.
          const maxAge = credentials.remember ? 60 * 60 * 24 * 7 : undefined
          const accessTokenCookie = useCookie<string | null>('accessToken', { maxAge })
          accessTokenCookie.value = this.token
          if (this.refresh) {
            const refreshTokenCookie = useCookie<string | null>('refreshToken', { maxAge })
            refreshTokenCookie.value = this.refresh
          }
        }
        return payload
      } catch (error) {
        console.error('Login action authentication failure:', error)
        this.clearAuth()
        throw error
      } finally {
        this.loading = false
      }
    },

    // ── Restore User Sessions On Initial Lifecycle Hook ────────────────────
    async fetchUser() {
      // Pull access tokens out of cookie states if state context re-initializes
      if (!this.token) {
        const accessTokenCookie = useCookie<string | null>('accessToken')
        this.token = accessTokenCookie.value ?? null
      }

      if (!this.token) {
        this.isHydrated = true
        return
      }

      try {
        const { $api } = useNuxtApp()
        const response = await $api.me()
        this.user = response?.data || response
      } catch (error) {
        console.error('Session restoration request dropped:', error)
        this.clearAuth()
      } finally {
        this.isHydrated = true
      }
    },

    // ── Logout Breakdown Sequence ───────────────────────────────────────────
    async logout() {
      try {
        const { $api } = useNuxtApp()
        if (process.client && !this.refresh) {
          this.refresh = localStorage.getItem('refresh_token')
        }
        
        if (this.refresh) {
          await $api.logout({ refresh: this.refresh })
        }
      } catch (error) {
        console.warn('API logout blacklist call bypassed during core local state reduction:', error)
      } finally {
        this.clearAuth()
        await navigateTo('/auth/login')
      }
    },

    // ── Synchronous Storage Hydration Hooks ─────────────────────────────────
    initializeFromStorage() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const refresh = localStorage.getItem('refresh_token')
        const user = localStorage.getItem('auth_user')
        
        if (token && user) {
          this.token = token
          this.refresh = refresh
          try {
            this.user = JSON.parse(user)
          } catch {
            this.clearAuth()
          }
        }
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.refresh = null
      
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
      }

      const accessTokenCookie = useCookie('accessToken')
      accessTokenCookie.value = null
      const refreshTokenCookie = useCookie('refreshToken')
      refreshTokenCookie.value = null
    }
  }
})