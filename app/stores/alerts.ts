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
        this.selectedAlert = null
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
        throw error
      }
    }
  }
})