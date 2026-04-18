<template>
  <div class="relative">
    <input
      :value="displayValue"
      type="text"
      :placeholder="placeholder"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
      @click="openPicker"
      readonly
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: { start: Date | null; end: Date | null } | null
  range?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { start: Date | null; end: Date | null }): void
}>()

const displayValue = computed(() => {
  if (!props.modelValue?.start) return ''
  const start = props.modelValue.start.toLocaleDateString()
  const end = props.modelValue.end ? props.modelValue.end.toLocaleDateString() : ''
  return props.range && end ? `${start} - ${end}` : start
})

const openPicker = () => {
  // Placeholder - integrate a real date picker library (e.g., v-calendar, flatpickr)
  console.warn('DatePicker: Integrate a real date picker component')
}
</script>