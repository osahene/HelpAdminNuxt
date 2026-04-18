<template>
  <div class="relative" style="height: 220px;">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  data: { month: string; count: number }[]
}>()

const chartData = computed(() => ({
  labels: (props.data || []).map(d => d.month),
  datasets: [
    {
      label: 'New Users',
      data: (props.data || []).map(d => d.count),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0ea5e9',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#94a3b8',
      bodyColor: '#f1f5f9',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (ctx: any) => ` ${ctx.raw} new users`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11 } }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148,163,184,0.1)' },
      border: { display: false, dash: [4, 4] },
      ticks: { color: '#94a3b8', font: { size: 11 }, precision: 0 }
    }
  }
}
</script>