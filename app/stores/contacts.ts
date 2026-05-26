// stores/contacts.ts
import { defineStore } from 'pinia'
import type { Contact } from '~/types/index'

interface ContactsState {
  contacts: Contact[]
  selectedContact: Contact | null
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    perPage: number
  }
  loading: boolean
}

export const useContactsStore = defineStore('contacts', {
  state: (): ContactsState => ({
    contacts: [],
    selectedContact: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      perPage: 20
    },
    loading: false
  }),

  actions: {
    async fetchContacts(filters: Record<string, any> = {}) {
      this.loading = true
      try {
        const { $api } = useNuxtApp();
        const { data } = await $api.contacts({ params: { ...filters, page: this.pagination.currentPage } })
        
        const value = data?.value
        this.contacts = value?.data ?? []
        this.pagination = value?.pagination ?? this.pagination
      } finally {
        this.loading = false
      }
    },

    async fetchContact(id: string) {
      this.loading = true
      try {
        const { $api } = useNuxtApp();
        const { data } = await $api.contactsId(id)
        const value = data?.value
        this.selectedContact = value ?? null
        return value
      } finally {
        this.loading = false
      }
    },

    async inviteContact(id: string) {
      const { $api } = useNuxtApp();
      await $api.inviteContact(id)
      // Optionally refresh contact or show success message
    },

    async resendInvite(id: string) {
      const { $api } = useNuxtApp();
      await $api.resendInvite(id)
    },

    clearSelectedContact() {
      this.selectedContact = null
    }
  }
})