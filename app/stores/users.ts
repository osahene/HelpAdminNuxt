// stores/users.ts
import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    selectedUser: null as User | null,
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
        if (process.client) {
          useToast().add({
            title: 'Failed to load users',
            description: 'Could not load the users list. Please refresh the page.',
            color: 'error',
          })
        }
      } finally {
        this.loading = false
      }
    },
    // Rethrows without its own toast — both callers (pages/users/index.vue
    // and pages/users/[id].vue) already wrap this in their own try/catch
    // and show a contextual toast there; adding one here too would double up.
    async sendContactReminder(userId: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.usersIdRemindContacts(userId)
        return response?.data || response
      } catch (error) {
        console.error(`Failed execution dispatching contact profile synchronization reminder for ${userId}:`, error)
        throw error
      }
    },

    /**
     * Fetches a single user's detail record — UserDetailSerializer already
     * embeds `contacts` and `alerts` on this response, so no separate calls
     * are needed to populate a profile page.
     */
    async fetchUser(id: string) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.usersId(id)
        const payload = response?.data || response
        this.selectedUser = payload ?? null
        return payload
      } catch (error) {
        console.error(`Failed loading user detail for ID ${id}:`, error)
        this.selectedUser = null
        // The primary caller (pages/users/[id].vue's top-level await on page
        // load) has no catch of its own, so this is the only feedback point.
        if (process.client) {
          useToast().add({
            title: 'Failed to load user',
            description: 'Could not load this user. Please try again.',
            color: 'error',
          })
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    clearSelectedUser() {
      this.selectedUser = null
    }
  }
})