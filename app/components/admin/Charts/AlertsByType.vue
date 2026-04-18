<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: { type: string; count: number }[]
}>()

const chartData = computed(() => ({
  labels: props.data.map(d => d.type),
  datasets: [{
    data: props.data.map(d => d.count),
    backgroundColor: ['#ef4444', '#22c55e', '#f97316', '#3b82f6', '#a855f7'],
    borderWidth: 0
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10
      }
    }
  }
}
</script>