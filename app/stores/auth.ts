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

          // The user profile is display-only (no credential material), so it
          // lives in Pinia's in-memory state — fetchUser() re-populates it
          // from `/trap_admin/me/` on every fresh load anyway (see below and
          // middleware/auth.global.ts). The tokens themselves must NOT be
          // duplicated into localStorage: cookies (below) are the single
          // source of truth the axios plugin reads, and anything sitting in
          // localStorage is readable by any injected script (XSS exposure).

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
      if (!this.refresh) {
        const refreshTokenCookie = useCookie<string | null>('refreshToken')
        this.refresh = refreshTokenCookie.value ?? null
      }

      if (!this.token) {
        this.isHydrated = true
        return
      }

      try {
        const { $api } = useNuxtApp()
        const response = await $api.me()
        this.user = response?.data || response
      } catch (error: any) {
        console.error('Session restoration request dropped:', error)
        this.clearAuth()
        // Only editorialize with "session expired" for an actual auth
        // rejection (401/403). A network blip or 5xx here already gets a
        // generic toast from the axios response interceptor — adding a
        // second, more specific-but-wrong toast on top would be misleading.
        const status = error?.response?.status
        if (process.client && (status === 401 || status === 403)) {
          useToast().add({
            title: 'Session expired',
            description: 'Please sign in again to continue.',
            color: 'error',
          })
        }
      } finally {
        this.isHydrated = true
      }
    },

    // ── Logout Breakdown Sequence ───────────────────────────────────────────
    async logout() {
      try {
        const { $api } = useNuxtApp()
        if (!this.refresh) {
          const refreshTokenCookie = useCookie<string | null>('refreshToken')
          this.refresh = refreshTokenCookie.value ?? null
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
    // Restores token state from the auth cookies (the single source of
    // truth also read by plugins/axiosInstance.ts). The user profile isn't
    // persisted anywhere — fetchUser() re-fetches it from `/trap_admin/me/`.
    initializeFromStorage() {
      const accessTokenCookie = useCookie<string | null>('accessToken')
      const refreshTokenCookie = useCookie<string | null>('refreshToken')

      if (accessTokenCookie.value) {
        this.token = accessTokenCookie.value
        this.refresh = refreshTokenCookie.value ?? null
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.refresh = null

      const accessTokenCookie = useCookie('accessToken')
      accessTokenCookie.value = null
      const refreshTokenCookie = useCookie('refreshToken')
      refreshTokenCookie.value = null
    }
  }
})