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
        <div class="pt-1 border-t border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
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
              :disabled="generatingId === report.id || !!dateRangeError(report)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95 shrink-0"
            >
              <ArrowPathIcon v-if="generatingId === report.id" class="h-3.5 w-3.5 animate-spin" />
              <DocumentArrowDownIcon v-else class="h-3.5 w-3.5" />
              {{ generatingId === report.id ? 'Generating…' : 'Generate' }}
            </button>
          </div>
          <p v-if="dateRangeError(report)" class="mt-1.5 text-[11px] font-medium text-red-500">
            {{ dateRangeError(report) }}
          </p>
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
            <td class="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</td>
            <td class="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">{{ item.period || '—' }}</td>
            <td class="px-5 py-3.5">
              <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {{ item.format }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right">
              <button
                @click="downloadReport(item)"
                :disabled="downloadingId === item.id"
                class="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              >
                <ArrowPathIcon v-if="downloadingId === item.id" class="h-3.5 w-3.5 animate-spin" />
                <ArrowDownTrayIcon v-else class="h-3.5 w-3.5" />
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
import { isAfter } from 'date-fns'
import DatePicker from '~/components/ui/DatePicker.vue'
// jsPDF/jspdf-autotable are browser-only — statically importing them here
// would pull them into the SSR bundle and crash server rendering of this
// page, so they're loaded dynamically, client-side only, inside buildReportPdf.

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

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
  report_type: string
  format: string
  period?: string
  period_start?: string | null
  period_end?: string | null
  download_url: string
  created_at: string
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
const downloadingId = ref<string | null>(null)

const formatDate = (date: string) => new Date(date).toLocaleString()

const toDateParam = (d: Date) => d.toISOString().slice(0, 10)

// Show an inline error in the "Generate" area when the chosen range is invalid.
const dateRangeError = (report: ReportType): string => {
  const { start, end } = report.dateRange
  if (!start || !end) return ''
  if (isAfter(start, end)) return 'Start date must be before the end date.'
  if (isAfter(end, new Date())) return 'End date cannot be in the future.'
  return ''
}

const loadReports = async () => {
  try {
    const { data } = await $api.reports()
    generatedReports.value = Array.isArray(data) ? data : (data?.results ?? [])
  } catch (error) {
    console.error('Failed to load generated reports:', error)
  }
}

const generateReport = async (report: ReportType) => {
  if (dateRangeError(report)) return
  generatingId.value = report.id
  try {
    const { data } = await $api.reportsGenerate({
      type: report.id,
      date_range: report.dateRange.start && report.dateRange.end
        ? {
            start: toDateParam(report.dateRange.start),
            end: toDateParam(report.dateRange.end)
          }
        : undefined,
      format: 'pdf'
    })
    if (data) {
      generatedReports.value.unshift(data)
    }
  } catch (error) {
    console.error('Failed to generate report:', error)
  } finally {
    generatingId.value = null
  }
}

const formatSeconds = (s?: number | null) => {
  if (s === null || s === undefined) return '—'
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

// Builds the PDF entirely on the client from live analytics data, since the
// backend's report file-generation endpoint isn't implemented. jsPDF is
// dynamically imported so it never loads during SSR.
const buildReportPdf = async (item: GeneratedReport, data: any) => {
  const { jsPDF } = await import('jspdf')
  const { autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(item.name, 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(110)
  doc.text(`Period: ${item.period || 'All time'}`, 14, 25)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

  let startY = 38

  if (item.report_type === 'monthly-summary') {
    autoTable(doc, {
      startY,
      head: [['Metric', 'Value']],
      body: [
        ['Total Alerts', String(data.kpis?.totalAlerts ?? '—')],
        ['Avg Response Time', formatSeconds(data.kpis?.avgResponseTime)],
        ['False Alarm Rate', `${data.kpis?.falseAlarmRate ?? 0}%`],
        ['User Activation Rate', `${data.kpis?.userActivationRate ?? 0}%`],
      ]
    })
    startY = (doc as any).lastAutoTable.finalY + 8
    autoTable(doc, {
      startY,
      head: [['Type', 'Date', 'Count']],
      body: (data.alertsByTypeTime ?? []).map((r: any) => [r.type, r.date, r.count])
    })
  } else if (item.report_type === 'response-time') {
    autoTable(doc, {
      startY,
      head: [['Alert Type', 'Avg Response Time']],
      body: (data.responseTimeByAgency ?? []).map((r: any) => [r.agency, formatSeconds(r.avgTime)])
    })
  } else if (item.report_type === 'user-acquisition') {
    autoTable(doc, {
      startY,
      head: [['Metric', 'Value']],
      body: [['User Activation Rate', `${data.kpis?.userActivationRate ?? 0}%`]]
    })
    startY = (doc as any).lastAutoTable.finalY + 8
    autoTable(doc, {
      startY,
      head: [['Month', 'New Users']],
      body: (data.userGrowthCoverage ?? []).map((r: any) => [r.month, r.count])
    })
  } else if (item.report_type === 'geographic-heatmap') {
    autoTable(doc, {
      startY,
      head: [['Area', 'Alerts', 'Avg Response', 'Dominant Type']],
      body: (data.hotspots ?? []).map((r: any) => [r.area, r.alertCount, formatSeconds(r.avgResponseTime), r.dominantType])
    })
  }

  doc.save(`${item.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

const downloadAsPdf = async (item: GeneratedReport) => {
  downloadingId.value = item.id
  try {
    const { data } = await $api.analytics({
      params: {
        start: item.period_start || undefined,
        end: item.period_end || undefined
      }
    })
    await buildReportPdf(item, data)
  } catch (error) {
    console.error('Failed to build PDF report:', error)
  } finally {
    downloadingId.value = null
  }
}

const downloadReport = (item: GeneratedReport) => {
  if (item.format === 'pdf') {
    downloadAsPdf(item)
  } else {
    window.open(item.download_url, '_blank')
  }
}

onMounted(loadReports)
</script>