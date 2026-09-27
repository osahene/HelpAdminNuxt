<template>
  <div class="space-y-5">

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">System Errors</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Everything logged at WARNING or above, backend-wide — this is what used to only exist in Render's console log.
        </p>
      </div>
      <button
        @click="fetchErrors"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
      >
        <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in summaryStats" :key="stat.label" class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm px-4 py-3.5">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
        <p class="text-xl font-bold font-mono mt-1" :class="stat.color ?? 'text-slate-900 dark:text-white'">{{ stat.value }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 gap-3">
        <div class="flex items-center gap-2">
          <ExclamationTriangleIcon class="h-4 w-4 text-amber-500" />
          <span class="text-sm font-semibold text-slate-900 dark:text-white">Log Entries</span>
          <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ errors.length }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="levelFilter"
            @change="fetchErrors"
            class="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1.5 focus:outline-none"
          >
            <option value="">All levels</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select
            v-model="resolvedFilter"
            @change="fetchErrors"
            class="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1.5 focus:outline-none"
          >
            <option value="">All</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
        </div>
      </div>

      <DataTable
        :columns="columns"
        :data="errors"
        :loading="loading"
        @row-click="openErrorDetail"
      >
        <template #cell-level="{ row }">
          <span :class="levelBadge(row.level)">{{ row.level }}</span>
        </template>

        <template #cell-message="{ row }">
          <span class="font-mono text-xs text-slate-700 dark:text-slate-300 line-clamp-1">{{ row.message }}</span>
        </template>

        <template #cell-created_at="{ row }">
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ new Date(row.created_at).toLocaleString() }}</span>
        </template>

        <template #cell-resolved_at="{ row }">
          <span v-if="row.resolved_at" class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon class="h-3.5 w-3.5" /> Resolved
          </span>
          <span v-else class="text-xs font-medium text-slate-400">Open</span>
        </template>
      </DataTable>

      <div v-if="!loading && errors.length === 0" class="px-5 py-10 text-center text-sm text-slate-400">
        Nothing logged at this level — either everything's healthy, or check that EmergencyBackend.log_handler.DatabaseLogHandler is actually wired into LOGGING.
      </div>
    </div>

    <TransitionRoot as="template" :show="selectedError !== null">
      <Dialog as="div" class="relative z-50" @close="selectedError = null">
        <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-16">
              <TransitionChild as="template" enter="transform transition ease-in-out duration-300" enter-from="translate-x-full"
                enter-to="translate-x-0" leave="transform transition ease-in-out duration-300" leave-from="translate-x-0"
                leave-to="translate-x-full">
                <DialogPanel class="pointer-events-auto w-screen max-w-lg">
                  <div class="flex h-full flex-col bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto">

                    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <span v-if="selectedError" :class="levelBadge(selectedError.level)">{{ selectedError.level }}</span>
                        <DialogTitle class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {{ selectedError?.logger_name || 'root' }}
                        </DialogTitle>
                      </div>
                      <button @click="selectedError = null" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <XMarkIcon class="h-5 w-5" />
                      </button>
                    </div>

                    <div v-if="selectedError" class="flex-1 px-5 py-5 space-y-5">
                      <div>
                        <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Message</dt>
                        <dd class="mt-1 text-sm text-slate-800 dark:text-slate-200 font-mono break-words">{{ selectedError.message }}</dd>
                      </div>

                      <div v-if="selectedError.request_path" class="grid grid-cols-2 gap-4">
                        <div>
                          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Request</dt>
                          <dd class="mt-1 text-sm text-slate-700 dark:text-slate-300 font-mono">{{ selectedError.request_method }} {{ selectedError.request_path }}</dd>
                        </div>
                        <div>
                          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">When</dt>
                          <dd class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ new Date(selectedError.created_at).toLocaleString() }}</dd>
                        </div>
                      </div>

                      <div v-if="selectedError.suggested_solution" class="bg-sky-50 dark:bg-sky-500/10 border border-sky-200/80 dark:border-sky-500/20 rounded-xl p-4">
                        <p class="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400 mb-1.5 flex items-center gap-1.5">
                          <LightBulbIcon class="h-3.5 w-3.5" /> Suggested solution
                        </p>
                        <p class="text-sm text-sky-900 dark:text-sky-200 leading-relaxed">{{ selectedError.suggested_solution }}</p>
                        <p class="text-[11px] text-sky-600/70 dark:text-sky-400/60 mt-2">
                          Pattern-matched against known failure signatures, not diagnosed live — treat as a starting point.
                        </p>
                      </div>

                      <div v-if="selectedError.traceback">
                        <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Traceback</dt>
                        <pre class="text-[11px] leading-relaxed bg-slate-900 text-slate-200 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{{ selectedError.traceback }}</pre>
                      </div>

                      <div v-if="selectedError.resolved_at" class="text-xs text-emerald-600 dark:text-emerald-400">
                        Resolved {{ new Date(selectedError.resolved_at).toLocaleString() }}{{ selectedError.resolved_by_name ? ` by ${selectedError.resolved_by_name}` : '' }}
                      </div>
                    </div>

                    <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                      <button
                        v-if="selectedError && !selectedError.resolved_at"
                        :disabled="resolving"
                        @click="resolveError"
                        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <CheckCircleIcon class="h-4 w-4" />
                        {{ resolving ? 'Marking resolved…' : 'Mark Resolved' }}
                      </button>
                    </div>

                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon, LightBulbIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

const errors = ref<any[]>([])
const loading = ref(false)
const selectedError = ref<any>(null)
const resolving = ref(false)
const levelFilter = ref('')
const resolvedFilter = ref('false')

const columns = [
  { key: 'level', label: 'Level' },
  { key: 'message', label: 'Message' },
  { key: 'logger_name', label: 'Logger' },
  { key: 'created_at', label: 'When' },
  { key: 'resolved_at', label: 'Status' },
]

const summaryStats = computed(() => [
  { label: 'Total (loaded)', value: errors.value.length },
  { label: 'Critical', value: errors.value.filter(e => e.level === 'CRITICAL').length, color: 'text-red-600 dark:text-red-400' },
  { label: 'Errors', value: errors.value.filter(e => e.level === 'ERROR').length, color: 'text-amber-600 dark:text-amber-400' },
  { label: 'Unresolved', value: errors.value.filter(e => !e.resolved_at).length },
])

const levelBadge = (level: string) => {
  const styles: Record<string, string> = {
    CRITICAL: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
    ERROR: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10',
    WARNING: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700',
  }
  return `inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full ${styles[level] ?? styles.WARNING}`
}

const openErrorDetail = (row: any) => {
  selectedError.value = row
}

const fetchErrors = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (levelFilter.value) params.level = levelFilter.value
    if (resolvedFilter.value) params.resolved = resolvedFilter.value
    const response = await $api.systemErrors(params)
    errors.value = response.data?.results || response.data || []
  } catch (error) {
    console.error('Error loading system errors:', error)
    errors.value = []
    if (process.client) {
      useToast().add({
        title: 'Failed to load system errors',
        description: 'Could not reach the error log endpoint. Please refresh the page.',
        color: 'error',
      })
    }
  } finally {
    loading.value = false
  }
}

const resolveError = async () => {
  if (!selectedError.value) return
  resolving.value = true
  try {
    const response = await $api.systemErrorsResolve(selectedError.value.id)
    selectedError.value = response.data
    const row = errors.value.find(e => e.id === selectedError.value.id)
    if (row) {
      row.resolved_at = response.data.resolved_at
      row.resolved_by_name = response.data.resolved_by_name
    }
  } catch (error) {
    console.error('Error resolving system error log:', error)
  } finally {
    resolving.value = false
  }
}

onMounted(fetchErrors)
</script>
