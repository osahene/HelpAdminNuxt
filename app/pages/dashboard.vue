<template>
  <div class="space-y-6">

    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {{ today }} · Real-time overview of all system activity
        </p>
      </div>
      <button
        @click="analyticsStore.fetchDashboardData()"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
      >
        <ArrowPathIcon class="h-4 w-4" />
        Refresh
      </button>
    </div>

    <!-- ===== STATS GRID ===== -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Active Alerts"
        :value="stats.activeAlerts"
        :icon="BellAlertIcon"
        trend="+12%"
        :trendUp="true"
        bgColor="bg-red-100 dark:bg-red-500/15"
        iconColor="text-red-600 dark:text-red-400"
        accentColor="#ef4444"
      />
      <StatsCard
        title="Avg Response Time"
        :value="formatTime(stats.avgResponseTime)"
        :icon="ClockIcon"
        :trend="responseTimeTrendString"
        :trendUp="responseTimeTrendIsUp"
        bgColor="bg-amber-100 dark:bg-amber-500/15"
        iconColor="text-amber-600 dark:text-amber-400"
        accentColor="#f59e0b"
      />
      <StatsCard
        title="Total Users"
        :value="stats.totalUsers"
        :icon="UsersIcon"
        trend="+5.2%"
        :trendUp="true"
        bgColor="bg-emerald-100 dark:bg-emerald-500/15"
        iconColor="text-emerald-600 dark:text-emerald-400"
        accentColor="#10b981"
      />
      <StatsCard
        title="Contact Coverage"
        :value="`${stats.avgContactsPerUser?.toFixed(1) ?? '0.0'}/5`"
        :icon="UserGroupIcon"
        :trend="coverageTrendString"
        :trendUp="coverageTrend > 0"
        bgColor="bg-sky-100 dark:bg-sky-500/15"
        iconColor="text-sky-600 dark:text-sky-400"
        accentColor="#0ea5e9"
      />
    </div>

    <!-- ===== MAP & ALERTS BY TYPE ===== -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Map card -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <MapPinIcon class="h-4 w-4 text-sky-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Live Alert Locations</h3>
            <span class="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Live
            </span>
          </div>
          <button @click="refreshMap" class="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium flex items-center gap-1 transition-colors">
            <ArrowPathIcon class="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
        <div class="h-80 p-1">
          <ClientOnly>
            <AlertMap :alerts="activeAlerts" @marker-click="handleAlertClick" />
          </ClientOnly>
        </div>
      </div>

      <!-- Alerts by type -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <ChartPieIcon class="h-4 w-4 text-sky-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Alerts by Type</h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Today's breakdown</p>
        </div>
        <div class="p-4 h-72">
          <AlertsByTypeChart :data="alertsByType" />
        </div>
      </div>
    </div>

    <!-- ===== TREND CHARTS ===== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <ClockIcon class="h-4 w-4 text-amber-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Response Time Trend</h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Last 7 days</p>
        </div>
        <div class="p-4">
          <ResponseTimeChart :data="responseTimeTrend" />
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <UsersIcon class="h-4 w-4 text-emerald-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">User Growth</h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Monthly</p>
        </div>
        <div class="p-4">
          <UserGrowthChart :data="userGrowth" />
        </div>
      </div>
    </div>

    <!-- ===== RECENT ALERTS TABLE ===== -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
      <!-- Table header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <BellAlertIcon class="h-4 w-4 text-red-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
          <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ recentAlerts?.length ?? 0 }} records
          </span>
        </div>
        <NuxtLink to="/alerts" class="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors">
          View all →
        </NuxtLink>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-700/40">
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
              <th scope="col" class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th scope="col" class="relative px-5 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr
              v-for="alert in recentAlerts"
              :key="alert.id"
              class="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
            >
              <!-- User -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="h-7 w-7 rounded-full bg-linear-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {{ getInitials(alert.user?.name) }}
                  </div>
                  <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ alert.user?.name }}</span>
                </div>
              </td>

              <!-- Type badge -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span :class="alertTypeBadgeClass(alert.type)">
                  <span :class="alertTypeDotClass(alert.type)" class="inline-block h-1.5 w-1.5 rounded-full mr-1.5"></span>
                  {{ alert.type }}
                </span>
              </td>

              <!-- Location -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <MapPinIcon class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {{ alert.location?.address || 'Coordinates available' }}
                </div>
              </td>

              <!-- Time -->
              <td class="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {{ formatDistanceToNow(new Date(alert.createdAt)) }} ago
              </td>

              <!-- Status -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
                  :class="alert.agencyNotifiedAt
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                    : 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10'"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="alert.agencyNotifiedAt ? 'bg-emerald-500' : 'bg-amber-500'"
                  ></span>
                  {{ alert.agencyNotifiedAt ? 'Notified' : 'Pending' }}
                </span>
              </td>

              <!-- Action -->
              <td class="px-5 py-3.5 whitespace-nowrap text-right">
                <NuxtLink
                  :to="`/alerts/${alert.id}`"
                  class="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  View
                  <ArrowRightIcon class="h-3 w-3" />
                </NuxtLink>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="!recentAlerts?.length">
              <td colspan="6" class="px-5 py-12 text-center">
                <BellAlertIcon class="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p class="text-sm text-slate-400">No recent alerts</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow, format } from 'date-fns'
import { storeToRefs } from 'pinia'
import {
  BellAlertIcon, ClockIcon, UsersIcon, UserGroupIcon,
  ArrowPathIcon, MapPinIcon, ChartPieIcon, ArrowRightIcon
} from '@heroicons/vue/24/outline'
import { useAnalyticsStore } from '~/stores/analytics'
import { useRealtime } from '~/composables/useRealtime'
import StatsCard from '~/components/admin/StatsCard.vue'
import type { Alert } from '~/types'

definePageMeta({ layout: 'admin' })

const analyticsStore = useAnalyticsStore()
const { stats, activeAlerts, alertsByType, responseTimeTrend, userGrowth, recentAlerts } = storeToRefs(analyticsStore)

const today = computed(() => format(new Date(), 'EEEE, d MMMM yyyy'))

const formatTime = (seconds: number) => {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const responseTimeTrendString = computed(() => {
  const trend = analyticsStore.responseTimeTrend
  if (!trend || trend.length < 2) return '0%'
  const last = trend[trend.length - 1].value
  const prev = trend[trend.length - 2].value
  const diff = ((last - prev) / prev) * 100
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`
})

const responseTimeTrendIsUp = computed(() => {
  const trend = analyticsStore.responseTimeTrend
  if (!trend || trend.length < 2) return false
  return trend[trend.length - 1].value > trend[trend.length - 2].value
})

const coverageTrend = computed(() => 0.2)
const coverageTrendString = computed(() => `${coverageTrend.value > 0 ? '+' : ''}${coverageTrend.value.toFixed(1)}%`)

const getInitials = (name?: string) => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase()
}

const alertTypeConfig: Record<string, { pill: string; dot: string }> = {
  robbery:  { pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10', dot: 'bg-red-500' },
  health:   { pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  fire:     { pill: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-500/10', dot: 'bg-orange-500' },
  flood:    { pill: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10', dot: 'bg-blue-500' },
  violence: { pill: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-500/10', dot: 'bg-purple-500' },
}

const alertTypeBadgeClass = (type: string) => {
  const cfg = alertTypeConfig[type]
  return `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${cfg?.pill ?? 'text-slate-600 bg-slate-100 dark:bg-slate-700'}`
}

const alertTypeDotClass = (type: string) => alertTypeConfig[type]?.dot ?? 'bg-slate-400'

const handleAlertClick = (alert: Alert) => navigateTo(`/alerts/${alert.id}`)
const refreshMap = () => analyticsStore.fetchActiveAlerts()

onMounted(() => {
  analyticsStore.fetchDashboardData()
  useRealtime('alert:new', (payload) => analyticsStore.addNewAlert(payload))
  useRealtime('alert:updated', (payload) => analyticsStore.updateAlert(payload))
})
</script>