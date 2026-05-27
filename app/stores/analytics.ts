// stores/analytics.ts
import { defineStore } from 'pinia'
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
        const { $api } = useNuxtApp()
        const response = await $api.dashboardData()
        
        // Extract raw payload data safely across plugin variants
        const payload = response?.data || response

        if (payload) {
          this.stats = {
            activeAlerts: payload.stats?.activeAlerts ?? 0,
            totalUsers: payload.stats?.totalUsers ?? 0,
            avgResponseTime: payload.stats?.avgResponseTime ?? 0,
            avgContactsPerUser: payload.stats?.avgContactsPerUser ?? 0
          }
          this.alertsByType = payload.alertsByType ?? []
          this.responseTimeTrend = payload.responseTimeTrend ?? []
          this.userGrowth = payload.userGrowth ?? []
          this.recentAlerts = payload.recentAlerts ?? []
          
          // Hydrate map elements with initial dashboard active entries safely
          if (payload.activeAlerts) {
            this.activeAlerts = payload.activeAlerts
          }
        }
      } catch (error) {
        console.error('Failed processing analytics dashboard payload sync:', error)
      } finally {
        this.loading = false
      }
    },
    async fetchActiveAlerts() {
      try {
        const { $api } = useNuxtApp()
        const response = await $api.alertsActive()
        
        const payload = response?.data || response
        this.activeAlerts = Array.isArray(payload) ? payload : (payload?.results ?? [])
      } catch (error) {
        console.error('Failed refreshing isolated active system notifications:', error)
      }
    },
    addNewAlert(alert: Alert) {
      const exists = this.activeAlerts.some(a => a.id === alert.id)
      if (!exists) {
        this.activeAlerts.unshift(alert)
        this.stats.activeAlerts++
      }
    },
    updateAlert(updatedAlert: Alert) {
      const index = this.activeAlerts.findIndex(a => a.id === updatedAlert.id)
      if (index !== -1) {
        this.activeAlerts[index] = { ...this.activeAlerts[index], ...updatedAlert }
      }
      
      const recentIndex = this.recentAlerts.findIndex(a => a.id === updatedAlert.id)
      if (recentIndex !== -1) {
        this.recentAlerts[recentIndex] = { ...this.recentAlerts[recentIndex], ...updatedAlert }
      }
    }
  }
})