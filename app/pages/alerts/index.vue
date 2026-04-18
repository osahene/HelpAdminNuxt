<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
      <button class="btn-primary" @click="exportAlerts">Export</button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input v-model="filters.search" type="text" placeholder="User name / phone" class="block w-full rounded-md border-gray-300 text-sm" />
        <select v-model="filters.type" class="block w-full rounded-md border-gray-300 text-sm">
          <option value="">All Types</option>
          <option value="robbery">Robbery</option>
          <option value="health">Health</option>
          <option value="fire">Fire</option>
          <option value="flood">Flood</option>
          <option value="violence">Violence</option>
        </select>
        <select v-model="filters.status" class="block w-full rounded-md border-gray-300 text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="false_alarm">False Alarm</option>
        </select>
        <DatePicker v-model="filters.dateRange" range placeholder="Date range" class="col-span-2" />
        <button @click="applyFilters" class="btn-primary">Filter</button>
      </div>
    </div>

    <!-- Alerts Table -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <DataTable
        :columns="columns"
        :data="alerts"
        :loading="loading"
        @row-click="(row) => navigateTo(`/alerts/${row.id}`)"
      >
        <template #cell-type="{ row }">
          <span :class="typeBadgeClass(row.type)">{{ row.type }}</span>
        </template>
        <template #cell-status="{ row }">
          <span :class="statusBadgeClass(row.status)">{{ row.status }}</span>
        </template>
        <template #cell-responseTime="{ row }">
          {{ formatResponseTime(row) }}
        </template>
      </DataTable>

      <Pagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        @change="changePage"
        class="border-t px-4 py-3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DatePicker from '~/components/ui/DatePicker.vue'
import DataTable from '~/components/admin/DataTable.vue'
import Pagination from '~/components/ui/Pagination.vue'

definePageMeta({ layout: 'admin' })

const filters = reactive({
  search: '',
  type: '',
  status: '',
  dateRange: { start: null, end: null }
})

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  from: 0,
  to: 0,
  total: 0
})

const alerts = ref([])
const loading = ref(false)

const columns = [
  { key: 'id', label: 'Alert ID', format: (val: string) => val.slice(0, 8) },
  { key: 'user.name', label: 'User' },
  { key: 'type', label: 'Type' },
  { key: 'location.address', label: 'Location' },
  { key: 'createdAt', label: 'Time', format: (val: string) => new Date(val).toLocaleString() },
  { key: 'status', label: 'Status' },
  { key: 'responseTime', label: 'Response Time' }
]

const fetchAlerts = async () => {
  loading.value = true
  const { data } = await useApi('/admin/alerts', {
    params: {
      ...filters,
      page: pagination.value.currentPage,
      dateStart: filters.dateRange.start?.toISOString(),
      dateEnd: filters.dateRange.end?.toISOString()
    }
  })
  alerts.value = data.value.data
  pagination.value = data.value.pagination
  loading.value = false
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  fetchAlerts()
}

const changePage = (page: number) => {
  pagination.value.currentPage = page
  fetchAlerts()
}

const typeBadgeClass = (type: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  const colors: Record<string, string> = {
    robbery: 'bg-red-100 text-red-800',
    health: 'bg-green-100 text-green-800',
    fire: 'bg-orange-100 text-orange-800',
    flood: 'bg-blue-100 text-blue-800',
    violence: 'bg-purple-100 text-purple-800'
  }
  return `${base} ${colors[type] || 'bg-gray-100 text-gray-800'}`
}

const statusBadgeClass = (status: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'active': return `${base} bg-red-100 text-red-800`
    case 'resolved': return `${base} bg-green-100 text-green-800`
    case 'false_alarm': return `${base} bg-gray-100 text-gray-800`
    default: return `${base} bg-gray-100 text-gray-800`
  }
}

const formatResponseTime = (alert: any) => {
  if (!alert.agencyNotifiedAt) return 'N/A'
  const diff = new Date(alert.agencyArrivedAt || Date.now()).getTime() - new Date(alert.agencyNotifiedAt).getTime()
  const mins = Math.floor(diff / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  return `${mins}m ${secs}s`
}

const exportAlerts = () => {
  // Trigger CSV download with current filters
  window.open(`/api/admin/alerts/export?${new URLSearchParams(filters).toString()}`, '_blank')
}

onMounted(() => {
  fetchAlerts()
})
</script>