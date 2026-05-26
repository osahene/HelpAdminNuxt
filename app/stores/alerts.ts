import { defineStore } from 'pinia'
import type { Alert } from '~/types'


export const useAlertsStore = defineStore('alerts', {
  state: () => ({
    alerts: [] as Alert[],
    activeAlertCount: 0,
    loading: false,
  }),
  actions: {
    async fetchAlerts(filters?: any) {
      const { $api } = useNuxtApp(); 
      this.loading = true
      const { data } = await $api.alerts({ params: filters })
      this.alerts = data.value
      this.loading = false
    },
    async updateResponseTimes(alertId: string, times: any) {
      const { $api } = useNuxtApp(); 
      await $api.alertsResponseTime(alertId)
    },
  },
})