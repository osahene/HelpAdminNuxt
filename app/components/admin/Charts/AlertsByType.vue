<template>
  <div class="relative" style="height: 220px;">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: { type: string; count: number }[]
}>()

// Match the alert type color palette used everywhere else
const typeColors: Record<string, string> = {
  robbery:  '#ef4444',
  health:   '#10b981',
  fire:     '#f97316',
  flood:    '#3b82f6',
  violence: '#a855f7',
}

const chartData = computed(() => {
  const d = props.data || []
  return {
    labels: d.map(i => i.type.charAt(0).toUpperCase() + i.type.slice(1)),
    datasets: [{
      data: d.map(i => i.count),
      backgroundColor: d.map(i => typeColors[i.type] || '#94a3b8'),
      hoverBackgroundColor: d.map(i => typeColors[i.type] || '#94a3b8'),
      borderWidth: 3,
      borderColor: 'transparent',
      hoverBorderColor: 'transparent',
      hoverOffset: 6,
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        padding: 14,
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
        label: (ctx: any) => {
          const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0
          return `  ${ctx.raw} alerts (${pct}%)`
        }
      }
    }
  }
}
</script>