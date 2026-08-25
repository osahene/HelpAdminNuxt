<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <component :is="icon" v-if="icon" class="h-4 w-4 text-sky-500" />
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
        <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
          {{ rows.length }}
        </span>
      </div>
      <span v-if="avgSeconds !== null" class="text-xs text-slate-500 dark:text-slate-400">
        Avg {{ toLabel.toLowerCase() }} time:
        <span class="font-semibold text-slate-700 dark:text-slate-300 font-mono">{{ formatDuration(avgSeconds) }}</span>
      </span>
    </div>

    <div v-if="!rows.length" class="px-5 py-12 text-center text-sm text-slate-400">
      {{ emptyText }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="bg-slate-50/80 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700">
            <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
            <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{{ fromLabel }}</th>
            <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{{ toLabel }}</th>
            <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
            <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
            <td class="px-5 py-3">
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ row.subject || '—' }}</p>
              <p v-if="row.meta" class="text-xs text-slate-400 mt-0.5">{{ row.meta }}</p>
            </td>
            <td class="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ formatDateTime(row.from) }}</td>
            <td class="px-5 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ row.to ? formatDateTime(row.to) : '—' }}</td>
            <td class="px-5 py-3 text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
              {{ row.to ? formatDuration(secondsBetween(row.from, row.to)) : '—' }}
            </td>
            <td class="px-5 py-3">
              <span :class="statusBadge(row.status)">{{ row.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { TimingRow } from '~/types'

const props = withDefaults(defineProps<{
  title: string
  icon?: any
  rows: TimingRow[]
  fromLabel?: string
  toLabel?: string
  emptyText?: string
}>(), {
  fromLabel: 'Triggered',
  toLabel: 'Delivered',
  emptyText: 'Nothing to show yet',
})

const avgSeconds = computed(() => averageDurationSeconds(props.rows))

const formatDateTime = (d: string) => format(new Date(d), 'MMM d, HH:mm')

const GOOD_STATES = ['delivered', 'read', 'approved', 'sent']
const BAD_STATES = ['failed', 'expired', 'rejected', 'skipped', 'cancelled']

const statusBadge = (status: string) => {
  const base = 'inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full capitalize'
  const s = (status || '').toLowerCase()
  if (GOOD_STATES.includes(s)) return `${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300`
  if (BAD_STATES.includes(s)) return `${base} bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300`
  return `${base} bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300`
}
</script>
