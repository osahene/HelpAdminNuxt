<template>
  <div ref="rootEl" class="relative">
    <input
      :value="displayValue"
      type="text"
      :placeholder="placeholder"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm cursor-pointer"
      @click="togglePicker"
      readonly
    />

    <div
      v-if="open"
      class="absolute z-30 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 p-3"
    >
      <div class="flex items-center justify-between mb-2">
        <button
          type="button"
          class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          @click="viewMonth = subMonths(viewMonth, 1)"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {{ format(viewMonth, 'MMMM yyyy') }}
        </span>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          @click="viewMonth = addMonths(viewMonth, 1)"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="grid grid-cols-7 gap-0.5 mb-1">
        <span
          v-for="d in weekdayLabels"
          :key="d"
          class="text-center text-[10px] font-semibold text-slate-400 uppercase py-1"
        >{{ d }}</span>
      </div>

      <div class="grid grid-cols-7 gap-0.5">
        <button
          v-for="day in calendarDays"
          :key="day.toISOString()"
          type="button"
          :disabled="!isSameMonth(day, viewMonth)"
          class="h-8 text-xs rounded-lg transition-colors"
          :class="dayClasses(day)"
          @click="selectDay(day)"
        >
          {{ format(day, 'd') }}
        </button>
      </div>

      <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button
          type="button"
          class="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          @click="clearSelection"
        >
          Clear
        </button>
        <button
          type="button"
          class="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
          @click="open = false"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay,
  isWithinInterval, isBefore
} from 'date-fns'

const props = defineProps<{
  modelValue?: { start: Date | null; end: Date | null } | null
  range?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { start: Date | null; end: Date | null }): void
}>()

const rootEl = ref<HTMLElement | null>(null)
const open = ref(false)
const viewMonth = ref(props.modelValue?.start ?? new Date())

const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const displayValue = computed(() => {
  if (!props.modelValue?.start) return ''
  const start = format(props.modelValue.start, 'MMM d, yyyy')
  const end = props.modelValue.end ? format(props.modelValue.end, 'MMM d, yyyy') : ''
  return props.range && end ? `${start} - ${end}` : start
})

const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(viewMonth.value))
  const end = endOfWeek(endOfMonth(viewMonth.value))
  return eachDayOfInterval({ start, end })
})

const togglePicker = () => {
  if (!open.value && props.modelValue?.start) viewMonth.value = props.modelValue.start
  open.value = !open.value
}

const dayClasses = (day: Date) => {
  const { start, end } = props.modelValue ?? { start: null, end: null }
  const inCurrentMonth = isSameMonth(day, viewMonth.value)
  const isStart = start && isSameDay(day, start)
  const isEnd = end && isSameDay(day, end)
  const inRange = props.range && start && end && isWithinInterval(day, { start, end })

  if (!inCurrentMonth) return 'text-slate-300 dark:text-slate-600 cursor-default'
  if (isStart || isEnd) return 'bg-sky-500 text-white font-semibold'
  if (inRange) return 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300'
  return 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
}

const selectDay = (day: Date) => {
  if (!isSameMonth(day, viewMonth.value)) return

  if (!props.range) {
    emit('update:modelValue', { start: day, end: day })
    open.value = false
    return
  }

  const { start, end } = props.modelValue ?? { start: null, end: null }

  if (!start || (start && end)) {
    // Begin a fresh range selection
    emit('update:modelValue', { start: day, end: null })
  } else if (isBefore(day, start)) {
    // Picked a day before the current start — treat it as the new start
    emit('update:modelValue', { start: day, end: null })
  } else {
    emit('update:modelValue', { start, end: day })
    open.value = false
  }
}

const clearSelection = () => {
  emit('update:modelValue', { start: null, end: null })
}

const onClickOutside = (e: MouseEvent) => {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>
