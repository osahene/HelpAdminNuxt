<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Reports</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Generate and download system reports</p>
      </div>
    </div>

    <!-- Report type cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="report in reportTypes"
        :key="report.id"
        class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-5 flex flex-col gap-4"
      >
        <div class="flex items-start gap-4">
          <div :class="['h-10 w-10 rounded-xl flex items-center justify-center shrink-0', report.iconBg]">
            <component :is="report.icon" :class="['h-5 w-5', report.iconColor]" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ report.name }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ report.description }}</p>
          </div>
        </div>

        <!-- Date range + generate -->
        <div class="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
          <div class="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl px-3 py-1.5">
            <CalendarIcon class="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <DatePicker
              v-model="report.dateRange"
              range
              placeholder="Select date range"
              class="text-xs text-slate-700 dark:text-slate-200 bg-transparent border-0 focus:outline-none w-full"
            />
          </div>
          <button
            @click="generateReport(report)"
            :disabled="generatingId === report.id"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95 shrink-0"
          >
            <ArrowPathIcon v-if="generatingId === report.id" class="h-3.5 w-3.5 animate-spin" />
            <DocumentArrowDownIcon v-else class="h-3.5 w-3.5" />
            {{ generatingId === report.id ? 'Generating…' : 'Generate' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Generated reports table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <DocumentTextIcon class="h-4 w-4 text-sky-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Generated Reports</h3>
          <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ generatedReports.length }}
          </span>
        </div>
      </div>

      <div v-if="!generatedReports.length" class="px-5 py-16 text-center">
        <DocumentTextIcon class="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p class="text-sm text-slate-400">No reports generated yet</p>
        <p class="text-xs text-slate-400 mt-0.5">Generate a report above to see it here</p>
      </div>

      <table v-else class="min-w-full">
        <thead>
          <tr class="bg-slate-50/80 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700">
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Report</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Generated</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Period</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Format</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr
            v-for="item in generatedReports"
            :key="item.id"
            class="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
          >
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="h-7 w-7 rounded-lg bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                  <DocumentTextIcon class="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ formatDate(item.createdAt) }}</td>
            <td class="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">{{ item.period || '—' }}</td>
            <td class="px-5 py-3.5">
              <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {{ item.format }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right">
              <button
                @click="downloadReport(item)"
                class="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ArrowDownTrayIcon class="h-3.5 w-3.5" />
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  CalendarIcon, ArrowPathIcon, DocumentArrowDownIcon,
  DocumentTextIcon, ArrowDownTrayIcon, ChartBarIcon,
  ClockIcon, UsersIcon, MapPinIcon
} from '@heroicons/vue/24/outline'
import DatePicker from '~/components/ui/DatePicker.vue'

definePageMeta({ layout: 'admin' })

interface ReportType {
  id: string
  name: string
  description: string
  icon: any
  iconBg: string
  iconColor: string
  dateRange: { start: Date | null; end: Date | null }
}

interface GeneratedReport {
  id: string
  name: string
  createdAt: string
  format: string
  period?: string
  downloadUrl: string
}

const reportTypes = ref<ReportType[]>([
  {
    id: 'monthly-summary',
    name: 'Monthly Alert Summary',
    description: 'Aggregated alerts by type, location, and response metrics for the selected period.',
    icon: ChartBarIcon,
    iconBg: 'bg-blue-100 dark:bg-blue-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
    dateRange: { start: null, end: null }
  },
  {
    id: 'response-time',
    name: 'Response Time by Agency',
    description: 'Average and median response times per agency over the selected date range.',
    icon: ClockIcon,
    iconBg: 'bg-amber-100 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
    dateRange: { start: null, end: null }
  },
  {
    id: 'user-acquisition',
    name: 'User Acquisition',
    description: 'New registrations, contact addition rate, and activation funnel conversion.',
    icon: UsersIcon,
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    dateRange: { start: null, end: null }
  },
  {
    id: 'geographic-heatmap',
    name: 'Geographic Heatmap',
    description: 'Alert density by region, powered by PostGIS spatial data analysis.',
    icon: MapPinIcon,
    iconBg: 'bg-red-100 dark:bg-red-500/15',
    iconColor: 'text-red-600 dark:text-red-400',
    dateRange: { start: null, end: null }
  }
])

const generatedReports = ref<GeneratedReport[]>([])
const generatingId = ref<string | null>(null)

const formatDate = (date: string) => new Date(date).toLocaleString()

const generateReport = async (report: ReportType) => {
  generatingId.value = report.id
  try {
    const { data } = await useApi<GeneratedReport>('/admin/reports/generate', {
      method: 'POST',
      body: { type: report.id, dateRange: report.dateRange }
    })
    if (data.value) {
      generatedReports.value.unshift(data.value)
      window.open(data.value.downloadUrl, '_blank')
    }
  } finally {
    generatingId.value = null
  }
}

const downloadReport = (item: GeneratedReport) => {
  window.open(item.downloadUrl, '_blank')
}
</script>