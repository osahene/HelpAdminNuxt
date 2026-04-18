import { defineStore } from 'pinia'
import type { User } from '~/types'
import { useApi } from '~/composables/useApi'



export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    pagination: { page: 1, total: 0, perPage: 20 },
    loading: false
  }),
  actions: {
    async fetchUsers(filters = {}) {
      this.loading = true
      const { data } = await useApi('/admin/users', { params: filters })
      this.users = data.value.users
      this.pagination = data.value.pagination
      this.loading = false
    },
    async sendContactReminder(userId: string) {
      await useApi(`/admin/users/${userId}/remind-contacts`, { method: 'POST' })
    }
  }
})