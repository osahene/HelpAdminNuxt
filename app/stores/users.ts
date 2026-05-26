import { defineStore } from 'pinia'
import type { User } from '~/types'



export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    pagination: { page: 1, total: 0, perPage: 20 },
    loading: false
  }),
  actions: {
    async fetchUsers(filters = {}) {
      const { $api } = useNuxtApp();
      this.loading = true
      const { data } = await $api.users({ params: filters })
      this.users = data.value.users
      this.pagination = data.value.pagination
      this.loading = false
    },
    async sendContactReminder(userId: string) {
      const { $api } = useNuxtApp();
      await $api.usersIdRemindContacts(userId)
    }
  }
})