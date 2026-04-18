import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Alert } from '~/types'


export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [] as Alert[],
    activeAlertCount: 0,
    loading: false,
  }),
  actions: {
    async fetchAlerts(filters?: any) {
      this.loading = true
      const { data } = await useApi('/alerts', { params: filters })
      this.alerts = data.value
      this.loading = false
    },
    async updateResponseTimes(alertId: string, times: any) {
      await useApi(`/alerts/${alertId}/response`, { method: 'PATCH', body: times })
    },
  },
})