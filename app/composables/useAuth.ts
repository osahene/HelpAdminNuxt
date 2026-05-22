// composables/useAuth.ts

import { useAuthStore } from "~/stores/auth"

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      await authStore.login({ email, password })
      router.push('/dashboard')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    authStore.logout()
    router.push('/auth/login')
  }

  const isAuthenticated = computed(() => authStore.isAuthenticated)

  return {
    user: computed(() => authStore.user),
    isAuthenticated,
    login,
    logout
  }
}