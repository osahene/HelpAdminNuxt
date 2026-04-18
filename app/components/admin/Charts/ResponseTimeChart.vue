<template>
  <div class="relative" style="height: 220px;">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  data: { date: string; value: number }[]
  target?: number
}>()

const fmtTime = (v: number) => {
  const m = Math.floor(v / 60), s = v % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const chartData = computed(() => ({
  labels: (props.data || []).map(d => d.date),
  datasets: [
    {
      label: 'Avg Response Time',
      data: (props.data || []).map(d => d.value),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    ...(props.target ? [{
      label: 'Target',
      data: Array((props.data || []).length).fill(props.target),
      borderColor: '#10b981',
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0,
    }] : [])
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      display: !!props.target,
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        padding: 12,
        color: '#94a3b8',
        font: { size: 11, family: "'Outfit', sans-serif" }
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#94a3b8',
      bodyColor: '#f1f5f9',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (ctx: any) => `  ${ctx.dataset.label}: ${fmtTime(ctx.raw)}`
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
      ticks: {
        color: '#94a3b8',
        font: { size: 11 },
        callback: (v: any) => fmtTime(Number(v))
      }
    }
  }
}
</script>