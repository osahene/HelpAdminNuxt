<template>
  <div class="space-y-5">

    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Alerts</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Monitor and manage all emergency alerts</p>
      </div>
      <button
        @click="exportAlerts"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        Export CSV
      </button>
    </div>

    <!-- Alert type summary pills -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="type in alertTypes"
        :key="type.value"
        @click="setTypeFilter(type.value)"
        :class="[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
          filters.type === type.value
            ? `${type.activePill} border-transparent`
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
        ]"
      >
        <span :class="['h-1.5 w-1.5 rounded-full', type.dot]"></span>
        {{ type.label }}
        <span v-if="type.count" class="ml-0.5 opacity-70">({{ type.count }})</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Search -->
        <div class="relative lg:col-span-2">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by user name or phone…"
            class="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all"
            @keyup.enter="applyFilters"
          />
        </div>

        <!-- Type filter -->
        <select
          v-model="filters.type"
          class="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
        >
          <option value="">All Types</option>
          <option value="robbery">Robbery</option>
          <option value="health">Health Crisis</option>
          <option value="fire">Fire Outbreak</option>
          <option value="flood">Flood Alert</option>
          <option value="violence">Violence</option>
        </select>

        <!-- Status filter -->
        <select
          v-model="filters.status"
          class="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="false_alarm">False Alarm</option>
        </select>

        <!-- Apply button -->
        <button
          @click="applyFilters"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
        >
          <FunnelIcon class="h-3.5 w-3.5" />
          Apply
        </button>
      </div>
    </div>

    <!-- Alerts Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <BellAlertIcon class="h-4 w-4 text-red-500" />
          <span class="text-sm font-semibold text-slate-900 dark:text-white">All Alerts</span>
          <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ pagination.total ?? 0 }} total
          </span>
        </div>
        <!-- Active filters indicator -->
        <div v-if="hasActiveFilters" class="flex items-center gap-2">
          <span class="text-xs text-sky-600 dark:text-sky-400">Filters active</span>
          <button @click="clearFilters" class="text-xs text-slate-400 hover:text-slate-600 underline">Clear</button>
        </div>
      </div>

      <DataTable
        :columns="columns"
        :data="alerts"
        :loading="loading"
        @row-click="(row) => navigateTo(`/alerts/${row.id}`)"
      >
        <!-- User cell with avatar -->
        <template #cell-user.name="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="h-6 w-6 rounded-full bg-linear-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
              {{ getInitials(row.user?.name) }}
            </div>
            <span>{{ row.user?.name ?? '—' }}</span>
          </div>
        </template>

        <!-- Alert ID cell -->
        <template #cell-id="{ row }">
          <span class="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
            #{{ row.id?.slice(0, 8) }}
          </span>
        </template>

        <!-- Type badge -->
        <template #cell-type="{ row }">
          <span :class="typeBadgeClass(row.type)">
            <span :class="typeDotClass(row.type)" class="inline-block h-1.5 w-1.5 rounded-full mr-1.5"></span>
            {{ row.type }}
          </span>
        </template>

        <!-- Status badge -->
        <template #cell-status="{ row }">
          <span :class="statusBadgeClass(row.status)">
            <span :class="statusDotClass(row.status)" class="inline-block h-1.5 w-1.5 rounded-full mr-1.5"></span>
            {{ statusLabel(row.status) }}
          </span>
        </template>

        <!-- Status badge -->
        <template #cell-agency_notified_at="{ row }">
          <span :class="statusBadgeClass(row.agency_notified_at)">
            <span :class="statusDotClass(row.agency_notified_at)" class="inline-block h-1.5 w-1.5 rounded-full mr-1.5"></span>
            {{ statusLabel(row.agency_notified_at) }}
          </span>
        </template>

        <!-- Response time -->
        <template #cell-responseTime="{ row }">
          <span class="font-mono text-xs">{{ formatResponseTime(row) }}</span>
        </template>

        <!-- Location -->
        <template #cell-location.address="{ row }">
          <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <MapPinIcon class="h-3.5 w-3.5 shrink-0" />
            {{ row.location?.address || 'Coordinates' }}
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Showing
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ displayFrom }}–{{ displayTo }}</span>
          of
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ pagination.total }}</span>
          alerts
        </p>
        <div class="flex items-center gap-1">
          <button
            @click="changePage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage <= 1"
            class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <span class="px-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
            {{ pagination.currentPage }} / {{ pagination.totalPages }}
          </span>
          <button
            @click="changePage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage >= pagination.totalPages"
            class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon,
  BellAlertIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'
import { useAlertsStore } from '~/stores/alerts'

definePageMeta({ layout: 'admin' })

// 1. Initialize Store
const alertsStore = useAlertsStore()
const { alerts, loading, pagination } = storeToRefs(alertsStore)

const filters = reactive({
  search: '',
  type: '',
  status: '',
  dateRange: { start: null as Date | null, end: null as Date | null }
})

const hasActiveFilters = computed(() => filters.search || filters.type || filters.status)

// 2. Computed Pagination Helpers
const displayFrom = computed(() => pagination.value.total === 0 ? 0 : (pagination.value.currentPage - 1) * pagination.value.perPage + 1)
const displayTo = computed(() => Math.min(pagination.value.total, pagination.value.currentPage * pagination.value.perPage))

const alertTypes = [
  { value: '', label: 'All', dot: 'bg-slate-400', activePill: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200', count: null },
  { value: 'robbery', label: 'Robbery Attack', dot: 'bg-red-500', activePill: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400', count: null },
  { value: 'health', label: 'Health Crisis', dot: 'bg-emerald-500', activePill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', count: null },
  { value: 'fire', label: 'Fire Outbreak', dot: 'bg-orange-500', activePill: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400', count: null },
  { value: 'flood', label: 'Flood Alert', dot: 'bg-blue-500', activePill: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', count: null },
  { value: 'violence', label: 'Violence Alert', dot: 'bg-purple-500', activePill: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400', count: null },
  { value: 'emergency', label: 'Call Emergency', dot: 'bg-purple-500', activePill: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400', count: null },
]

const columns = [
  { key: 'id', label: 'Alert ID' },
  { key: 'user.name', label: 'User' },
  { key: 'type', label: 'Type' },
  { key: 'location.address', label: 'Location' },
  { key: 'created_at', label: 'Time', format: (val: string) => val ? new Date(val).toLocaleString() : '—' },
  { key: 'status', label: 'Status' },
  { key: 'responseTime', label: 'Response' },
]

const setTypeFilter = (type: string) => {
  filters.type = type
  applyFilters()
}

const clearFilters = () => {
  filters.search = ''
  filters.type = ''
  filters.status = ''
  applyFilters()
}

const getInitials = (name?: string) => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase()
}

const typeConfig: Record<string, { pill: string; dot: string }> = {
  robbery:  { pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10', dot: 'bg-red-500' },
  health:   { pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  fire:     { pill: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-500/10', dot: 'bg-orange-500' },
  flood:    { pill: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10', dot: 'bg-blue-500' },
  violence: { pill: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-500/10', dot: 'bg-purple-500' },
}
const typeBadgeClass = (type: string) =>
  `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${typeConfig[type]?.pill ?? 'text-slate-600 bg-slate-100 dark:bg-slate-700'}`
const typeDotClass = (type: string) => typeConfig[type]?.dot ?? 'bg-slate-400'

const statusConfig: Record<string, { pill: string; dot: string; label: string }> = {
  active:      { pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10', dot: 'bg-red-500 animate-pulse', label: 'Active' },
  resolved:    { pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500', label: 'Resolved' },
  false_alarm: { pill: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700', dot: 'bg-slate-400', label: 'False Alarm' },
}
const statusBadgeClass = (s: string) =>
  `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig[s]?.pill ?? 'text-slate-600 bg-slate-100'}`
const statusDotClass = (s: string) => statusConfig[s]?.dot ?? 'bg-slate-400'
const statusLabel = (s: string) => statusConfig[s]?.label ?? s

const formatResponseTime = (alert: any) => {
  if (!alert.agency_notified_at) return 'N/A'
  const diff = new Date(alert.agency_arrived_at || Date.now()).getTime() - new Date(alert.agency_notified_at).getTime()
  return `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`
}

// 3. Delegation Methods
const loadAlerts = async () => {
  const apiParams = {
    search: filters.search || undefined,
    type: filters.type || undefined,
    status: filters.status || undefined,
  }
  await alertsStore.fetchAlerts(apiParams)
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  loadAlerts()
}

const changePage = (page: number) => {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.currentPage = page
  loadAlerts()
}

const exportAlerts = () => {
  window.open(`/api/admin/alerts/export?${new URLSearchParams(filters as any).toString()}`, '_blank')
}

onMounted(loadAlerts)
</script>