<template>
  <NuxtLink
    :to="to"
    class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
    :class="[
      isActive
        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
    ]"
  >
    <component :is="icon" class="mr-3 h-5 w-5 shrink-0" :class="[isActive ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500']" />
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'

const props = defineProps<{
  to: string
  icon: keyof typeof HeroIcons
}>()

const route = useRoute()
const isActive = computed(() => route.path.startsWith(props.to))
const label = computed(() => {
  const parts = props.to.split('/').filter(Boolean)
  return parts.length ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Home'
})
</script>