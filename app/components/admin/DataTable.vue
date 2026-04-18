<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-6 py-4 text-center text-gray-500">Loading...</td>
        </tr>
        <tr v-else-if="!data.length">
          <td :colspan="columns.length" class="px-6 py-4 text-center text-gray-500">No data</td>
        </tr>
        <tr
          v-for="(row, index) in data"
          v-else
          :key="index"
          class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
          @click="$emit('row-click', row)"
        >
          <td v-for="col in columns" :key="col.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ formatValue(row, col) }}
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

defineProps<{
  columns: Column[]
  data: any[]
  loading?: boolean
}>()

defineEmits<{
  (e: 'row-click', row: any): void
}>()

const formatValue = (row: any, col: Column) => {
  const value = row[col.key]
  return col.format ? col.format(value) : value
}
</script>