<template>
  <div ref="mapContainer" class="h-64 w-full rounded-lg"></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  points: Array<{ lat: number; lng: number; intensity?: number }>
}>()

const mapContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  // Placeholder - use leaflet.heat or similar
  console.warn('HeatmapView: Integrate a heatmap library')
})
</script>