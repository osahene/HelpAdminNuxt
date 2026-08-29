import { defineStore } from 'pinia'
import type { Alert } from '~/types'

export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [] as Alert[],
    selectedAlert: null as Alert | null,
    activeAlertCount: 0,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
      perPage: 20
    },
    loading: false,
  }),

  actions: {
    async fetchAlerts(filters: Record<string, any> = {}) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        
        const queryParams = {
          ...filters,
          page: this.pagination.currentPage
        }
        
        const response = await $api.alerts({ params: queryParams })
        const payload = response?.data || response
        
        if (payload && 'results' in payload) {
          this.alerts = payload.results ?? []
          this.pagination.total = payload.count ?? this.alerts.length
          this.pagination.totalPages = Math.max(1, Math.ceil(this.pagination.total / this.pagination.perPage))
        } else {
          this.alerts = Array.isArray(payload) ? payload : []
          this.pagination.total = this.alerts.length
          this.pagination.totalPages = 1
        }
      } catch (error) {
        console.error('Failed fetching core alerts index collection:', error)
        this.alerts = []
        this.pagination.total = 0
        if (process.client) {
          useToast().add({
            title: 'Failed to load alerts',
            description: 'Could not load the alerts list. Please refresh the page.',
            color: 'error',
          })
        }
      } finally {
        this.loading = false
      }
    },

    async fetchAlertById(alertId: string) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.alertsId(alertId) // Fixed API key usage
        this.selectedAlert = response?.data || response
        return this.selectedAlert
      } catch (error) {
        console.error(`Failed fetching alert detail for ID ${alertId}:`, error)
        this.selectedAlert = null
        // The page consumes this via useAsyncData, which swallows a thrown
        // error into its own `error` ref that nothing reads — without this,
        // a failed fetch here renders a blank detail page with no feedback.
        if (process.client) {
          useToast().add({
            title: 'Failed to load alert',
            description: 'Could not load this alert. Please try again.',
            color: 'error',
          })
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateResponseTimes(alertId: string, times: { agency_notified_at: string; agency_arrived_at: string }) {
      try {
        const { $api } = useNuxtApp()
        const payload = {
          agency_notified_at: times.agency_notified_at || null,
          agency_arrived_at: times.agency_arrived_at || null
        }
        
        const response = await $api.alertsResponseTime(alertId, payload)
        const updatedAlert = response?.data || response
        
        if (this.selectedAlert && this.selectedAlert.id === alertId) {
          this.selectedAlert = updatedAlert
        }
        return updatedAlert
      } catch (error) {
        console.error(`Failed parsing metadata log for alert timeline targets ${alertId}:`, error)
        // No page-level catch calls this (pages/alerts/[id].vue's
        // updateResponseTimes button handler awaits it directly), so this is
        // the only place the admin would otherwise learn the save failed.
        if (process.client) {
          useToast().add({
            title: 'Failed to save response times',
            description: 'Could not update the response times. Please try again.',
            color: 'error',
          })
        }
        throw error
      }
    },

    async updateAlertStatus(alertId: string, status: 'resolved' | 'false_alarm' | 'active') {
      try {
        const { $api } = useNuxtApp()
        
        const response = await $api.alertsIdStatus(alertId, status)
        const updatedAlert = response?.data || response
        
        if (this.selectedAlert && this.selectedAlert.id === alertId) {
          this.selectedAlert = updatedAlert
        }
        return updatedAlert
      } catch (error) {
        console.error(`Failed modifying resolution status flags for target event ${alertId}:`, error)
        // This backs the "Resolve"/"Mark as false alarm" buttons on the
        // alert detail page, which has no try/catch of its own — without a
        // toast here, a click on those buttons that fails does nothing
        // visible at all.
        if (process.client) {
          useToast().add({
            title: 'Failed to update alert',
            description: 'Could not update the alert status. Please try again.',
            color: 'error',
          })
        }
        throw error
      }
    }
  }
})