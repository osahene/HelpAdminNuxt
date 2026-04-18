<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6" aria-label="Pagination">
    <div class="hidden sm:block">
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Page <span class="font-medium">{{ currentPage }}</span> of <span class="font-medium">{{ totalPages }}</span>
      </p>
    </div>
    <div class="flex flex-1 justify-between sm:justify-end">
      <button
        :disabled="currentPage === 1"
        class="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(currentPage - 1)"
      >
        Previous
      </button>
      <div class="hidden md:flex mx-2">
        <template v-for="page in displayedPages" :key="page">
          <button
            v-if="page !== '...'"
            :class="[
              'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0',
              currentPage === page
                ? 'bg-primary-600 text-white ring-primary-600 dark:bg-primary-500 dark:ring-primary-500'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
            :aria-current="currentPage === page ? 'page' : undefined"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
          <span v-else class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0">
            ...
          </span>
        </template>
      </div>
      <button
        :disabled="currentPage === totalPages"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="goToPage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  maxVisible?: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const maxVisible = props.maxVisible || 5

const displayedPages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  // Always show first page
  pages.push(1)

  const start = Math.max(2, current - Math.floor(maxVisible / 2))
  const end = Math.min(total - 1, current + Math.floor(maxVisible / 2))

  if (start > 2) pages.push('...')

  for (let i = start; i <= end; i++) {
    if (i !== 1 && i !== total) pages.push(i)
  }

  if (end < total - 1) pages.push('...')

  // Always show last page
  pages.push(total)

  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('change', page)
  }
}
</script>