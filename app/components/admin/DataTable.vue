<template>
  <div class="overflow-x-auto">
    <table class="min-w-full">
      <thead>
        <tr class="bg-slate-50/80 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700">
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">

        <!-- Skeleton loading rows -->
        <template v-if="loading">
          <tr v-for="i in skeletonRows" :key="`sk-${i}`">
            <td v-for="col in columns" :key="col.key" class="px-5 py-4">
              <div
                class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"
                :style="{ width: skeletonWidths[(i + columns.indexOf(col)) % skeletonWidths.length] }"
              />
            </td>
          </tr>
        </template>

        <!-- Empty state -->
        <tr v-else-if="!data || !data.length">
          <td :colspan="columns.length" class="px-5 py-16 text-center">
            <div class="flex flex-col items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-.375c0-.621.504-1.125 1.125-1.125H6m0 0h12m0 0h.375c.621 0 1.125.504 1.125 1.125v.375m0 0c0 .621-.504 1.125-1.125 1.125h-.375m-14.25 0v-10.125c0-.621.504-1.125 1.125-1.125h13.5c.621 0 1.125.504 1.125 1.125V18.375" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-500 dark:text-slate-400">No records found</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Try adjusting your filters</p>
              </div>
            </div>
          </td>
        </tr>

        <!-- Data rows -->
        <tr
          v-for="(row, index) in data"
          v-else
          :key="index"
          class="group transition-colors"
          :class="[
            onClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/30' : '',
          ]"
          @click="onClick ? $emit('row-click', row) : undefined"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-5 py-3.5 text-sm text-slate-800 dark:text-slate-200 whitespace-nowrap"
          >
            <slot :name="`cell-${col.key}`" :row="row" :index="index">
              <span :class="!getNestedValue(row, col.key) && col.key !== 'actions' ? 'text-slate-400' : ''">
                {{ col.format ? col.format(getNestedValue(row, col.key)) : (getNestedValue(row, col.key) ?? '—') }}
              </span>
            </slot>
          </td>
        </tr>

      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  format?: (val: any) => string
}

const props = defineProps<{
  columns: Column[]
  data: any[]
  loading?: boolean
  skeletonRows?: number
}>()

defineEmits<{
  (e: 'row-click', row: any): void
}>()

// Detect if parent listens to row-click
const attrs = useAttrs()
const onClick = computed(() => !!attrs['onRow-click'])

const skeletonWidths = ['60%', '80%', '45%', '70%', '55%', '75%', '50%']

// Support nested key access like 'user.name'
const getNestedValue = (obj: any, key: string): any => {
  return key.split('.').reduce((acc, k) => acc?.[k], obj)
}
</script>