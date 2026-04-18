<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Business Intelligence</h1>

    <!-- Date Range Selector -->
    <div class="flex items-center space-x-4">
      <DatePicker v-model="dateRange" range placeholder="Select date range" />
      <button @click="refreshAnalytics" class="btn-primary">Apply</button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard title="Total Alerts" :value="kpis.totalAlerts" icon="BellAlertIcon"
        bgColor="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" />
      <StatsCard title="Avg Response Time" :value="formatTime(kpis.avgResponseTime)" icon="ClockIcon"
        bgColor="bg-yellow-50 dark:bg-yellow-900/20" iconColor="text-yellow-600" />
      <StatsCard title="False Alarm Rate" :value="`${kpis.falseAlarmRate.toFixed(1)}%`" icon="ExclamationTriangleIcon"
        bgColor="bg-red-50 dark:bg-red-900/20" iconColor="text-red-600" />
      <StatsCard title="User Activation Rate" :value="`${kpis.userActivationRate.toFixed(1)}%`" icon="UserPlusIcon"
        bgColor="bg-green-50 dark:bg-green-900/20" iconColor="text-green-600" />
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-medium mb-2">Alerts by Type Over Time</h3>
        <AlertsByTypeTimeChart :data="alertsByTypeTime" />
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-medium mb-2">Response Time by Agency</h3>
        <ResponseTimeByAgencyChart :data="responseTimeByAgency" />
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-medium mb-2">Geographic Alert Heatmap (PostGIS)</h3>
        <ClientOnly>
          <HeatmapView :points="heatmapData" />
        </ClientOnly>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-lg font-medium mb-2">User Growth & Contact Coverage</h3>
        <UserGrowthCoverageChart :data="userGrowthCoverage" />
      </div>
    </div>

    <!-- Drill-down Table: Alerts by Location -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 border-b">
        <h3 class="text-lg font-medium">Alert Hotspots (by Area)</h3>
      </div>
      <DataTable :columns="hotspotColumns" :data="hotspots" :loading="loadingHotspots"
        @row-click="(row) => zoomToArea(row)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DatePicker from '~/components/ui/DatePicker.vue'
import StatsCard from '~/components/admin/StatsCard.vue'
import AlertsByTypeTimeChart from '~/components/admin/Charts/AlertsByType.vue'
import ResponseTimeByAgencyChart from '~/components/admin/Charts/ResponseTimeChart.vue'
import UserGrowthCoverageChart from '~/components/admin/Charts/UserGrowthChart.vue'
import HeatmapView from '~/components/admin/HeatmapView.vue'
import DataTable from '~/components/admin/DataTable.vue'
import { useApi } from '~/composables/useApi'


definePageMeta({ layout: 'admin' })

const dateRange = ref({ start: null, end: null })

const kpis = ref({
  totalAlerts: 0,
  avgResponseTime: 0,
  falseAlarmRate: 0,
  userActivationRate: 0
})

const alertsByTypeTime = ref([])
const responseTimeByAgency = ref([])
const userGrowthCoverage = ref([])
const heatmapData = ref([])
const hotspots = ref([])
const loadingHotspots = ref(false)

const hotspotColumns = [
  { key: 'area', label: 'Area' },
  { key: 'alertCount', label: 'Alerts' },
  { key: 'avgResponseTime', label: 'Avg Response', format: (val: number) => formatTime(val) },
  { key: 'dominantType', label: 'Main Alert Type' }
]

const formatTime = (seconds: number) => {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const fetchAnalytics = async () => {
  const params: Record<string, string> = {}
  
  // FIX: Type cast to Date to use toISOString() safely
  if (dateRange.value.start) {
    params.start = (dateRange.value.start as Date).toISOString()
  }
  if (dateRange.value.end) {
    params.end = (dateRange.value.end as Date).toISOString()
  }

  // FIX: Pass the expected structure to useApi so data.value is typed
  const { data } = await useApi<any>('/admin/analytics', { params })
  
  if (data.value) {
    kpis.value = data.value.kpis
    alertsByTypeTime.value = data.value.alertsByTypeTime
    responseTimeByAgency.value = data.value.responseTimeByAgency
    userGrowthCoverage.value = data.value.userGrowthCoverage
    heatmapData.value = data.value.heatmap
    hotspots.value = data.value.hotspots
  }
} // <--- Added missing closing brace for fetchAnalytics

// FIX: These must be outside fetchAnalytics to be visible to the <template>
const refreshAnalytics = () => {
  fetchAnalytics()
}

  const zoomToArea = (row: any) => {
    // Trigger map zoom on heatmap component
    console.log('Zooming to:', row)
  }

  onMounted(() => {
    fetchAnalytics()
  })
</script>