<template>
  <div class="stats-card relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
    <!-- Subtle background gradient orb -->
    <div
      class="absolute -top-4 -right-4 h-20 w-20 rounded-full opacity-30 dark:opacity-20 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-50"
      :style="`background: ${accentColor}`"
    />

    <div class="flex items-start justify-between">
      <!-- Icon -->
      <div :class="['relative rounded-xl p-2.5 shadow-sm', bgColor]">
        <component :is="icon" :class="['h-5 w-5', iconColor]" aria-hidden="true" />
      </div>

      <!-- Trend badge -->
      <div
        v-if="trend"
        class="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
        :class="trendUp
          ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
          : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10'"
      >
        <component :is="trendUp ? ArrowTrendingUpIcon : ArrowTrendingDownIcon" class="h-3 w-3" />
        {{ trend }}
      </div>
    </div>

    <!-- Value and title -->
    <div class="mt-4">
      <p class="stat-value text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
        {{ value }}
      </p>
      <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">{{ title }}</p>
    </div>

    <!-- Bottom accent line -->
    <div
      class="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
      :style="`background: ${accentColor}`"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  title: string
  value: string | number
  icon: any
  trend?: string
  trendUp?: boolean
  bgColor: string
  iconColor: string
  accentColor?: string
}>()
</script>

<style scoped>
.stat-value {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-variant-numeric: tabular-nums;
}
</style>