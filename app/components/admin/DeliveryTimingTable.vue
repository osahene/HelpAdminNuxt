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

    <!-- Per-provider volume, most-used first -->
    <div v-if="providerCounts.length" class="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-700/20">
      <span
        v-for="p in providerCounts" :key="p.provider"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600/60 text-xs"
      >
        <span class="font-medium text-slate-700 dark:text-slate-300 capitalize">{{ p.provider }}</span>
        <span class="font-mono font-semibold text-sky-600 dark:text-sky-400">{{ p.count }}</span>
      </span>
    </div>

    <div v-if="!rows.length" class="px-5 py-12 text-center text-sm text-slate-400">
      {{ emptyText }}
    </div>

    <template v-else>
      <div class="overflow-x-auto">
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
            <tr v-for="row in visibleRows" :key="row.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
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

      <button
        v-if="rows.length > VISIBLE_LIMIT"
        type="button"
        @click="showAll = true"
        class="w-full text-center text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-3 py-2.5 bg-slate-50 dark:bg-slate-700/40 border-t border-slate-100 dark:border-slate-700 transition-colors"
      >
        View all {{ rows.length.toLocaleString() }}
      </button>
    </template>

    <TransitionRoot as="template" :show="showAll">
      <Dialog as="div" class="relative z-50" @close="showAll = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
              leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                  <DialogTitle class="text-sm font-semibold text-slate-900 dark:text-white">
                    {{ title }} ({{ rows.length.toLocaleString() }})
                  </DialogTitle>
                  <button
                    @click="showAll = false"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XMarkIcon class="h-5 w-5" />
                  </button>
                </div>
                <div class="overflow-y-auto">
                  <table class="min-w-full">
                    <thead class="sticky top-0">
                      <tr class="bg-slate-50/95 dark:bg-slate-700/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
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
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
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

const VISIBLE_LIMIT = 10
const showAll = ref(false)

const visibleRows = computed(() => props.rows.slice(0, VISIBLE_LIMIT))
const avgSeconds = computed(() => averageDurationSeconds(props.rows))

// Most-used provider first, e.g. "Arkesel 5", "Mnotify 3" — computed over
// the full fetched set, not just the visible/capped rows.
const providerCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const r of props.rows) {
    if (!r.provider) continue
    counts.set(r.provider, (counts.get(r.provider) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count)
})

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
