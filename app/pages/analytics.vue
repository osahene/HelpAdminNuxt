<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Business intelligence &amp; performance insights</p>
      </div>
      <!-- Date range filter -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
          <CalendarIcon class="h-4 w-4 text-slate-400 shrink-0" />
          <DatePicker v-model="dateRange" range placeholder="Select date range" class="text-sm border-0 bg-transparent focus:outline-none" />
        </div>
        <button
          @click="refreshAnalytics"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
        >
          <ArrowPathIcon class="h-4 w-4" />
          Apply
        </button>
      </div>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatsCard
        title="Total Alerts"
        :value="kpis.totalAlerts"
        :icon="BellAlertIcon"
        bgColor="bg-blue-100 dark:bg-blue-500/15"
        iconColor="text-blue-600 dark:text-blue-400"
        accentColor="#3b82f6"
      />
      <StatsCard
        title="Avg Response Time"
        :value="formatTime(kpis.avgResponseTime)"
        :icon="ClockIcon"
        bgColor="bg-amber-100 dark:bg-amber-500/15"
        iconColor="text-amber-600 dark:text-amber-400"
        accentColor="#f59e0b"
      />
      <StatsCard
        title="False Alarm Rate"
        :value="`${kpis.falseAlarmRate?.toFixed(1) ?? 0}%`"
        :icon="ExclamationTriangleIcon"
        bgColor="bg-red-100 dark:bg-red-500/15"
        iconColor="text-red-600 dark:text-red-400"
        accentColor="#ef4444"
      />
      <StatsCard
        title="User Activation Rate"
        :value="`${kpis.userActivationRate?.toFixed(1) ?? 0}%`"
        :icon="UserPlusIcon"
        bgColor="bg-emerald-100 dark:bg-emerald-500/15"
        iconColor="text-emerald-600 dark:text-emerald-400"
        accentColor="#10b981"
      />
    </div>

    <!-- Charts row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <ChartBarIcon class="h-4 w-4 text-blue-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Alerts by Type Over Time</h3>
          </div>
        </div>
        <div class="p-4">
          <AlertsByTypeTimeChart :data="alertsByTypeTime" />
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <ClockIcon class="h-4 w-4 text-amber-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Response Time by Agency</h3>
          </div>
        </div>
        <div class="p-4">
          <ResponseTimeByAgencyChart :data="responseTimeByAgency" />
        </div>
      </div>
    </div>

    <!-- Charts row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <MapPinIcon class="h-4 w-4 text-red-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Geographic Alert Heatmap</h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Powered by PostGIS spatial data</p>
        </div>
        <div class="p-2">
          <ClientOnly>
            <HeatmapView :points="heatmapData || []" />
          </ClientOnly>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <UsersIcon class="h-4 w-4 text-emerald-500" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">User Growth &amp; Contact Coverage</h3>
          </div>
        </div>
        <div class="p-4">
          <UserGrowthCoverageChart :data="userGrowthCoverage" />
        </div>
      </div>
    </div>

    <!-- Hotspots table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2 flex-wrap">
          <FireIcon class="h-4 w-4 text-orange-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Alert Hotspots</h3>
          <span class="text-xs text-slate-400 ml-1">
            {{ currentHotspotLevel < hotspotLevels.length - 1 ? 'click a row to drill down' : 'finest level reached' }}
          </span>
        </div>
        <!-- Breadcrumb trail -->
        <div class="flex items-center gap-1 flex-wrap mt-2 text-xs">
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <ChevronRightIcon v-if="i > 0" class="h-3 w-3 text-slate-300 dark:text-slate-600" />
            <button
              @click="drillTo(i - 1)"
              :disabled="i === breadcrumbs.length - 1"
              :class="i === breadcrumbs.length - 1
                ? 'font-semibold text-slate-700 dark:text-slate-200 cursor-default'
                : 'text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline'"
            >
              {{ crumb }}
            </button>
          </template>
        </div>
      </div>
      <DataTable
        :columns="hotspotColumns"
        :data="hotspots"
        :loading="loadingHotspots"
        @row-click="drillInto"
      >
        <template #cell-area="{ row }">
          <span class="font-medium">{{ row.area }}</span>
          <ChevronRightIcon v-if="row.hasChildren" class="inline h-3 w-3 text-slate-400 ml-1" />
        </template>
        <template #cell-alertCount="{ row }">
          <div class="flex items-center gap-2">
            <div class="h-1.5 rounded-full bg-red-400" :style="{ width: `${Math.min((row.alertCount / maxAlertCount) * 80, 80)}px` }"></div>
            <span class="font-mono text-sm font-medium">{{ row.alertCount }}</span>
          </div>
        </template>
        <template #cell-dominantType="{ row }">
          <span :class="alertTypeBadge(row.dominantType)">{{ row.dominantType }}</span>
        </template>
      </DataTable>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  CalendarIcon, ArrowPathIcon, BellAlertIcon, ClockIcon,
  ExclamationTriangleIcon, UsersIcon, ChartBarIcon, MapPinIcon, FireIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { UserPlusIcon } from '@heroicons/vue/24/solid'
import DatePicker from '~/components/ui/DatePicker.vue'
import StatsCard from '~/components/admin/StatsCard.vue'
import AlertsByTypeTimeChart from '~/components/admin/Charts/AlertsByType.vue'
import ResponseTimeByAgencyChart from '~/components/admin/Charts/ResponseTimeChart.vue'
import UserGrowthCoverageChart from '~/components/admin/Charts/UserGrowthChart.vue'
import HeatmapView from '~/components/admin/HeatmapView.vue'
import DataTable from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

const dateRange = ref<{ start: Date | null; end: Date | null }>({ start: null, end: null })

const kpis = ref({ totalAlerts: 0, avgResponseTime: 0, falseAlarmRate: 0, userActivationRate: 0 })
const alertsByTypeTime = ref([])
const responseTimeByAgency = ref([])
const userGrowthCoverage = ref([])
const heatmapData = ref([])
const hotspots = ref<any[]>([])
const loadingHotspots = ref(false)

// Alert Hotspots drill-down: country -> region -> city -> town -> locality,
// matching the geo fields on the Emergency model.
const hotspotLevels = ['country', 'region', 'city', 'town', 'locality']
const hotspotLevelLabels: Record<string, string> = {
  country: 'Country', region: 'Region', city: 'City', town: 'Town', locality: 'Locality',
}
const drillPath = ref<{ level: string; value: string }[]>([])

const currentHotspotLevel = computed(() => Math.min(drillPath.value.length, hotspotLevels.length - 1))

const breadcrumbs = computed(() => [
  `All ${hotspotLevelLabels[hotspotLevels[0]]}s`,
  ...drillPath.value.map(step => step.value)
])

const drillInto = (row: any) => {
  if (!row.hasChildren) return
  drillPath.value.push({ level: row.level, value: row.area })
  fetchAnalytics()
}

// index -1 resets to the root level; otherwise keep drillPath[0..index]
const drillTo = (index: number) => {
  drillPath.value = drillPath.value.slice(0, index + 1)
  fetchAnalytics()
}

const maxAlertCount = computed(() => Math.max(...hotspots.value.map(h => h.alertCount || 0), 1))

const hotspotColumns = computed(() => [
  { key: 'area', label: hotspotLevelLabels[hotspotLevels[currentHotspotLevel.value]] ?? 'Area' },
  { key: 'alertCount', label: 'Alerts' },
  { key: 'avgResponseTime', label: 'Avg Response', format: (v: number) => formatTime(v) },
  { key: 'dominantType', label: 'Main Type' },
])

const formatTime = (s: number) => {
  if (!s) return 'N/A'
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

const alertTypeBadge = (t: string) => {
  const map: Record<string, string> = {
    robbery: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
    health: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10',
    fire: 'text-orange-700 bg-orange-50',
    flood: 'text-blue-700 bg-blue-50',
    violence: 'text-purple-700 bg-purple-50',
  }
  return `inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[t] ?? 'text-slate-600 bg-slate-100'}`
}

const fetchAnalytics = async () => {
  loadingHotspots.value = true
  const params: Record<string, string> = {
    hotspot_level: hotspotLevels[currentHotspotLevel.value],
  }
  if (dateRange.value.start) params.start = dateRange.value.start.toISOString()
  if (dateRange.value.end) params.end = dateRange.value.end.toISOString()
  drillPath.value.forEach(step => { params[`hotspot_${step.level}`] = step.value })

  try {
    const { data } = await $api.analytics({ params })
    if (data) {
      kpis.value = data.kpis
      alertsByTypeTime.value = data.alertsByTypeTime
      responseTimeByAgency.value = data.responseTimeByAgency
      userGrowthCoverage.value = data.userGrowthCoverage
      heatmapData.value = data.heatmap
      hotspots.value = data.hotspots
    }
  } finally {
    loadingHotspots.value = false
  }
}

const refreshAnalytics = () => {
  drillPath.value = []
  fetchAnalytics()
}

onMounted(fetchAnalytics)
</script>