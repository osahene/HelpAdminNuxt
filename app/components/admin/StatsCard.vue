<template>
  <div class="overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:p-6">
    <div class="flex items-center">
      <div class="shrink-0">
        <div :class="[bgColor, 'rounded-md p-3']">
          <component :is="icon" :class="[iconColor, 'h-6 w-6']" aria-hidden="true" />
        </div>
      </div>
      <div class="ml-5 w-0 flex-1">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{{ title }}</dt>
        <dd class="flex items-baseline">
          <div class="text-2xl font-semibold text-gray-900 dark:text-white">{{ value }}</div>
          <div v-if="trend" class="ml-2 flex items-baseline text-sm font-semibold" :class="trendUp ? 'text-green-600' : 'text-red-600'">
            <ArrowUpIcon v-if="trendUp" class="h-4 w-4 shrink-0 self-center" />
            <ArrowDownIcon v-else class="h-4 w-4 shrink-0 self-center" />
            <span class="sr-only">{{ trendUp ? 'Increased' : 'Decreased' }} by</span>
            {{ trend }}
          </div>
        </dd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/solid'

defineProps<{
  title: string
  value: string | number
  icon: any
  trend?: string
  trendUp?: boolean
  bgColor: string
  iconColor: string
}>()
</script>