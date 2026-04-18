// stores/analytics.ts
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { DashboardStats, Alert, DashboardResponse, ActiveAlertsResponse } from '~/types'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    stats: {
      activeAlerts: 0,
      avgResponseTime: 0,
      totalUsers: 0,
      avgContactsPerUser: 0
    } as DashboardStats,
    activeAlerts: [] as Alert[],
    alertsByType: [] as { type: string; count: number }[],
    responseTimeTrend: [] as { date: string; value: number }[],
    userGrowth: [] as { month: string; count: number }[],
    recentAlerts: [] as Alert[],
    loading: false
  }),
  actions: {
    async fetchDashboardData() {
      this.loading = true
      try {
        // Use generic type to tell TypeScript what to expect
        const { data } = await useApi<DashboardResponse>('/admin/dashboard')
        if (data.value) {
          this.stats = data.value.stats
          this.alertsByType = data.value.alertsByType
          this.responseTimeTrend = data.value.responseTimeTrend
          this.userGrowth = data.value.userGrowth
          this.recentAlerts = data.value.recentAlerts
        }
      } finally {
        this.loading = false
      }
    },
    async fetchActiveAlerts() {
      const { data } = await useApi<Alert[]>('/alerts/active')
      if (data.value) {
        this.activeAlerts = data.value
      }
    },
    addNewAlert(alert: Alert) {
      this.activeAlerts.unshift(alert)
      this.stats.activeAlerts++
    },
    updateAlert(updatedAlert: Alert) {
      const index = this.activeAlerts.findIndex(a => a.id === updatedAlert.id)
      if (index !== -1) {
        this.activeAlerts[index] = updatedAlert
      }
    }
  }
})