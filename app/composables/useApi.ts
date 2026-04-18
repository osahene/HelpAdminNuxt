import type { UseFetchOptions } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

export const useApi = <T>(url: string, options: UseFetchOptions<T> = {}) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  // Safely construct headers
  const headers = new Headers((options.headers as HeadersInit) || {})
  
  if (authStore.token) {
    headers.set('Authorization', `Bearer ${authStore.token}`)
  }
  
  return useFetch<T, Error>(url, {
    ...options as any,
    baseURL: config.public.apiBase , // Cast to string to satisfy TS
    headers,
    onResponseError({ response }) {
      if (response?.status === 401) {
        authStore.logout()
        navigateTo('/login')
      }
    }
  })
}