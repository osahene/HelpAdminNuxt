<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  data: { date: string; value: number }[]
  target?: number
}>()

const chartData = computed(() => ({
  labels: props.data.map(d => d.date),
  datasets: [
    {
      label: 'Avg Response Time (seconds)',
      data: props.data.map(d => d.value),
      borderColor: 'rgb(234, 179, 8)',
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      fill: true,
      tension: 0.4
    },
    ...(props.target
      ? [{
          label: 'Target',
          data: Array(props.data.length).fill(props.target),
          borderColor: 'rgb(34, 197, 94)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointStyle: false,
          fill: false
        }]
      : [])
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.raw
          const minutes = Math.floor(value / 60)
          const seconds = value % 60
          return `${context.dataset.label}: ${minutes}m ${seconds}s`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) => {
          const minutes = Math.floor(value / 60)
          const seconds = value % 60
          return `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
      }
    }
  }
}
</script>