import { defineStore } from 'pinia'
import type { Contact, ContactsState } from '~/types/index'

export const useContactsStore = defineStore('contacts', {
  state: (): ContactsState => ({
    contacts: [] as Contact[],
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
        const response = await $api.contacts({ params: queryParams })
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
        if (process.client) {
          useToast().add({
            title: 'Failed to load contacts',
            description: 'Could not load the contacts list. Please refresh the page.',
            color: 'error',
          })
        }
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
        // Callers (pages/contacts/[id].vue) await this with no catch of
        // their own, so this toast is the only feedback the admin gets.
        if (process.client) {
          useToast().add({
            title: 'Failed to load contact',
            description: 'Could not load this contact. Please try again.',
            color: 'error',
          })
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async inviteContact( id: string) {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.inviteContact(id)
        return response?.data || response
      } catch (error) {
        console.error(`Failed executing registration dispatch protocol rules for contact ${id}:`, error)
        // Callers (pages/contacts/index.vue and pages/contacts/[id].vue)
        // invoke this with no try/catch of their own.
        if (process.client) {
          useToast().add({
            title: 'Invitation failed',
            description: 'Could not send the registration invite. Please try again.',
            color: 'error',
          })
        }
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
        if (process.client) {
          useToast().add({
            title: 'Invitation not resent',
            description: 'Could not resend the invitation. Please try again.',
            color: 'error',
          })
        }
        throw error
      }
    },

    clearSelectedContact() {
      this.selectedContact = null
    }
  }
})