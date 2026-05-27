// stores/users.ts
import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      perPage: 20 // Standard pagination limit matching DRF configurations
    },
    loading: false
  }),

  actions: {
    /**
     * Fetches paginated registered system end-users with dynamic filters
     */
    async fetchUsers(filters: Record<string, any> = {}) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()

        // Bind core active pagination filters into the parameters object payload
        const queryParams = {
          ...filters,
          page: this.pagination.currentPage
        }

        // Axios cleanly unwraps HTTP payloads directly on response.data
        const response = await $api.users({ params: queryParams })
        const payload = response?.data || response

        if (payload && 'results' in payload) {
          // Standard DRF Paginated Response Extraction
          this.users = payload.results ?? []
          this.pagination.total = payload.count ?? this.users.length
          this.pagination.totalPages = Math.max(1, Math.ceil(this.pagination.total / this.pagination.perPage))
        } else {
          this.users = Array.isArray(payload) ? payload : []
          this.pagination.total = this.users.length
          this.pagination.totalPages = 1
        }
      } catch (error) {
        console.error('Failed processing administrative users synchronization list request:', error)
        this.users = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },
    async sendContactReminder(userId: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.usersIdRemindContacts(userId)
        return response?.data || response
      } catch (error) {
        console.error(`Failed execution dispatching contact profile synchronization reminder for ${userId}:`, error)
        throw error
      }
    }
  }
})