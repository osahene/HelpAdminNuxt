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
        const { $api } = useNuxtApp()
        
        // Prepare clean API query params matching backend Django expectations
        const queryParams = {
          ...filters,
          page: this.pagination.currentPage
        }

        // Axios directly unwraps the network packet payload structure under response.data
        const response = await $api.contacts(queryParams)
        const payload = response?.data || response

        if (payload && 'results' in payload) {
          // Explicit standard DRF page format parsing
          this.contacts = payload.results ?? []
          this.pagination.total = payload.count ?? this.contacts.length
          this.pagination.totalPages = Math.max(1, Math.ceil(this.pagination.total / this.pagination.perPage))
        } else {
          // Direct fallback hook if list returns standard arrays
          this.contacts = Array.isArray(payload) ? payload : []
          this.pagination.total = this.contacts.length
          this.pagination.totalPages = 1
        }
      } catch (error) {
        console.error('Failed fetching app emergency contact register directories:', error)
        this.contacts = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    async fetchContact(id: string) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.contactsId(id)
        
        const payload = response?.data || response
        this.selectedContact = payload ?? null
        return payload
      } catch (error) {
        console.error(`Failed loading target metadata timeline view context for ID ${id}:`, error)
        this.selectedContact = null
        throw error
      } finally {
        this.loading = false
      }
    },

    async inviteContact(id: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.inviteContact(id)
        return response?.data || response
      } catch (error) {
        console.error(`Failed executing registration dispatch protocol rules for contact ${id}:`, error)
        throw error
      }
    },

  
    async resendInvite(id: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.resendInvite(id)
        return response?.data || response
      } catch (error) {
        console.error(`Failed executing infrastructure re-invite operation commands on ID ${id}:`, error)
        throw error
      }
    },

    clearSelectedContact() {
      this.selectedContact = null
    }
  }
})