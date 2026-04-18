<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Active Alerts"
        :value="stats.activeAlerts"
        :icon="BellAlertIcon"
        trend="+12%"
        trendUp
        bgColor="bg-red-50 dark:bg-red-900/20"
        iconColor="text-red-600"
      />
      <StatsCard
        title="Avg Response Time"
        :value="formatTime(stats.avgResponseTime)"
        :icon="ClockIcon"
        :trend="responseTimeTrendString"
        :trendUp="responseTimeTrend > 0"
        bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        iconColor="text-yellow-600"
      />
      <StatsCard
        title="Total Users"
        :value="stats.totalUsers"
        :icon="UsersIcon"
        trend="+5.2%"
        trendUp
        bgColor="bg-green-50 dark:bg-green-900/20"
        iconColor="text-green-600"
      />
      <StatsCard
        title="Contact Coverage"
        :value="`${stats.avgContactsPerUser.toFixed(1)}/5`"
        :icon="UserGroupIcon"
        :trend="coverageTrendString"
        :trendUp="coverageTrend > 0"
        bgColor="bg-blue-50 dark:bg-blue-900/20"
        iconColor="text-blue-600"
      />
    </div>

    <!-- Map and Alerts by Type -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 h-96 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Live Alert Locations</h3>
          <button @click="refreshMap" class="text-sm text-primary-600 hover:text-primary-800">
            <ArrowPathIcon class="h-4 w-4 inline" /> Refresh
          </button>
        </div>
        <ClientOnly>
          <AlertMap :alerts="activeAlerts" @marker-click="handleAlertClick" />
        </ClientOnly>
      </div>
      <div class="h-96 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Alerts by Type (Today)</h3>
        <AlertsByTypeChart :data="alertsByType" />
      </div>
    </div>

    <!-- Response Time & User Growth Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Response Time Trend (Last 7 Days)</h3>
        <ResponseTimeChart :data="responseTimeTrend" />
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">User Growth (Monthly)</h3>
        <UserGrowthChart :data="userGrowth" />
      </div>
    </div>

    <!-- Recent Alerts Table -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent Alerts</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Response</th>
              <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="alert in recentAlerts" :key="alert.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ alert.user?.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="alertTypeBadgeClass(alert.type)">{{ alert.type }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ alert.location?.address || 'Coordinates' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDistanceToNow(new Date(alert.createdAt)) }} ago</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ alert.agencyNotifiedAt ? 'Notified' : 'Pending' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <NuxtLink :to="`/alerts/${alert.id}`" class="text-primary-600 hover:text-primary-900">View</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <NuxtLink to="/alerts" class="text-sm text-primary-600 hover:text-primary-900">View all alerts →</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { storeToRefs } from 'pinia'
import { BellAlertIcon, ClockIcon, UsersIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useAnalyticsStore } from '~/stores/analytics'
import { useRealtime } from '~/composables/useRealtime'
import StatsCard from '~/components/admin/StatsCard.vue'
import type { Alert } from '~/types'

definePageMeta({
  layout: 'admin'
})

const analyticsStore = useAnalyticsStore()
const { stats, activeAlerts, alertsByType, responseTimeTrend, userGrowth, recentAlerts } = storeToRefs(analyticsStore)

// Formatting helpers
const formatTime = (seconds: number) => {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const responseTimeTrendData = computed(() => analyticsStore.responseTimeTrend)

const responseTimeTrendString = computed(() => {
  const trend = responseTimeTrendData.value
  if (!trend || trend.length < 2) return '0%'
  const last = trend[trend.length - 1].value
  const prev = trend[trend.length - 2].value
  const diff = ((last - prev) / prev) * 100
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`
})

const responseTimeTrendIsUp = computed(() => {
  const trend = responseTimeTrendData.value
  if (!trend || trend.length < 2) return false
  return trend[trend.length - 1].value > trend[trend.length - 2].value
})




const coverageTrend = computed(() => {
  // Example: compare this month vs last month average contacts per user
  return 0.2 // placeholder
})
const coverageTrendString = computed(() => `${coverageTrend.value > 0 ? '+' : ''}${coverageTrend.value.toFixed(1)}%`)

const alertTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    robbery: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    fire: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    flood: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    violence: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return `px-2 py-1 text-xs font-medium rounded-full ${classes[type] || 'bg-gray-100 text-gray-800'}`
}

const handleAlertClick = (alert: Alert) => {
  navigateTo(`/alerts/${alert.id}`)
}

const refreshMap = () => {
  analyticsStore.fetchActiveAlerts()
}

// Real-time updates
onMounted(() => {
  analyticsStore.fetchDashboardData()
  
  // Subscribe to WebSocket events
  useRealtime('alert:new', (payload) => {
    analyticsStore.addNewAlert(payload)
  })
  useRealtime('alert:updated', (payload) => {
    analyticsStore.updateAlert(payload)
  })
})
</script>