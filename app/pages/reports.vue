<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Reports</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="report in reportTypes" :key="report.id" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 class="text-lg font-medium">{{ report.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ report.description }}</p>
        <div class="mt-4 flex items-center space-x-3">
          <DatePicker v-model="report.dateRange" range />
          <button @click="generateReport(report)" class="btn-primary">Generate</button>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 border-b">
        <h3 class="text-lg font-medium">Generated Reports</h3>
      </div>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in generatedReports" :key="item.id">
            <td class="px-6 py-4">{{ item.name }}</td>
            <td class="px-6 py-4">{{ formatDate(item.createdAt) }}</td>
            <td class="px-6 py-4">{{ item.format }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="downloadReport(item)" class="text-primary-600 hover:text-primary-900">Download</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<!-- <script setup lang="ts">
import DatePicker from '~/components/ui/DatePicker.vue'
import {useApi} from '~/composables/useApi'

const reportTypes = [
  { id: 'monthly-summary', name: 'Monthly Alert Summary', description: 'Aggregated alerts by type, location, and response metrics.' },
  { id: 'response-time', name: 'Response Time by Agency', description: 'Average response times per agency over selected period.' },
  { id: 'user-acquisition', name: 'User Acquisition', description: 'New registrations, contact addition rate, and conversion.' },
  { id: 'geographic-heatmap', name: 'Geographic Heatmap', description: 'Alert density by region (requires PostGIS).' }
]

const generatedReports = ref([])

const generateReport = async (report: any) => {
  const { data } = await useApi('/admin/reports/generate', {
    method: 'POST',
    body: { type: report.id, dateRange: report.dateRange }
  })
  // Add to list and trigger download
  generatedReports.value.unshift(data.value)
  window.open(data.value.downloadUrl, '_blank')
}

const downloadReport = (item: any) => {
  window.open(item.downloadUrl, '_blank')
}
</script> -->


<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import DatePicker from '~/components/ui/DatePicker.vue'

interface ReportType {
  id: string
  name: string
  description: string
  dateRange?: { start: Date | null; end: Date | null }
}

interface GeneratedReport {
  id: string
  name: string
  createdAt: string
  format: string
  downloadUrl: string
}

const reportTypes = ref<ReportType[]>([
  { id: 'monthly-summary', name: 'Monthly Alert Summary', description: 'Aggregated alerts by type, location, and response metrics.', dateRange: { start: null, end: null } },
  { id: 'response-time', name: 'Response Time by Agency', description: 'Average response times per agency over selected period.', dateRange: { start: null, end: null } },
  { id: 'user-acquisition', name: 'User Acquisition', description: 'New registrations, contact addition rate, and conversion.', dateRange: { start: null, end: null } },
  { id: 'geographic-heatmap', name: 'Geographic Heatmap', description: 'Alert density by region (requires PostGIS).', dateRange: { start: null, end: null } }
])

const generatedReports = ref<GeneratedReport[]>([])

const formatDate = (date: string) => new Date(date).toLocaleDateString()

const generateReport = async (report: ReportType) => {
  const { data } = await useApi<GeneratedReport>('/admin/reports/generate', {
    method: 'POST',
    body: { type: report.id, dateRange: report.dateRange }
  })
  if (data.value) {
    generatedReports.value.unshift(data.value)
    window.open(data.value.downloadUrl, '_blank')
  }
}

const downloadReport = (item: GeneratedReport) => {
  window.open(item.downloadUrl, '_blank')
}
</script>