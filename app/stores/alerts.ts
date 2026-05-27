// stores/alerts.ts
import { defineStore } from 'pinia'
import type { Alert } from '~/types'

export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [] as Alert[],
    selectedAlert: null as Alert | null,
    activeAlertCount: 0,
    loading: false,
  }),

  actions: {
    /**
     * Fetches paginated list of alerts based on type, status or date ranges
     */
    async fetchAlerts(filters: Record<string, any> = {}) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.alerts({ params: filters })
        const payload = response?.data || response
        
        // DRF standard paginated envelope check
        this.alerts = payload && 'results' in payload ? payload.results : (payload || [])
      } catch (error) {
        console.error('Failed fetching core alerts index collection:', error)
        this.alerts = []
      } finally {
        this.loading = false
      }
    },

    /**
     * Retrieves an isolated alert event by UUID/ID string
     */
    async fetchAlertById(alertId: string) {
      this.loading = true
      try {
        const { $api } = useNuxtApp()
        const response = await $api.alerts({ alertId })
        this.selectedAlert = response?.data || response
        return this.selectedAlert
      } catch (error) {
        console.error(`Failed resolving target detail view context for alert ${alertId}:`, error)
        this.selectedAlert = null
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Patches emergency dispatch response timestamps 
     * Target backend endpoint expects: PATCH /trap_admin/alerts/<id>/response-time/
     */
    async updateResponseTimes(alertId: string, times: { agencyNotifiedAt: string; agencyArrivedAt: string }) {
      try {
        const { $api } = useNuxtApp()
        
        // Normalize payload mapping values to match Django fields
        const payload = {
          agency_notified_at: times.agencyNotifiedAt || null,
          agency_arrived_at: times.agencyArrivedAt || null
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

    /**
     * Updates alert lifecycle states (active -> resolved / false_alarm)
     * Target backend endpoint expects: PATCH /trap_admin/alerts/<id>/status/
     */
    async updateAlertStatus(alertId: string, status: 'resolved' | 'false_alarm' | 'active') {
      try {
        const { $api } = useNuxtApp()
        
        // Matches body expectations parsed inside Django's serializer context
        const payload = {
          alert_id: alertId,
          status: status
        }
        
        // pass alertId as first argument and payload as second to match API signature
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