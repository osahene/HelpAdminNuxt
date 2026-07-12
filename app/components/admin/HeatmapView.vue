<template>
  <div class="relative h-72 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">

    <div ref="mapContainer" class="h-full w-full" />

    <Transition name="fade">
      <div v-if="!mapReady"
        class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 gap-3 z-10">
        <div class="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <MapIcon class="h-5 w-5 text-slate-400" />
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Loading heatmap…</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ points?.length ?? 0 }} data points</p>
        </div>
        <div class="absolute inset-0 opacity-30"
          style="background-image: linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px); background-size: 32px 32px;">
        </div>
      </div>
    </Transition>

    <div v-if="mapReady && points?.length"
      class="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700/60">
      <span class="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ points.length }} hotspots</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { MapIcon } from '@heroicons/vue/24/outline'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

const config = useRuntimeConfig()
const MAPAPIKEY = config.public.mapAPI as string || ''

const props = defineProps<{
  points: Array<{ lat: number; lng: number; intensity?: number }>
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapReady = ref(false)

// shallowRef prevents Vue from proxying the Google Maps instances
const mapInstance = shallowRef<google.maps.Map | null>(null)
const heatmapLayer = shallowRef<google.maps.visualization.HeatmapLayer | null>(null)
console.log('HeatmapView initialized with points:', props.points) // Debugging line

const drawPoints = async () => {
  if (!mapInstance.value || !props.points?.length) return

  // 1. Explicitly await the necessary libraries to prevent race conditions
  const { HeatmapLayer } = await importLibrary('visualization') as google.maps.VisualizationLibrary
  const { LatLng, LatLngBounds, MVCArray } = await importLibrary('core') as google.maps.CoreLibrary

  console.log('Drawing heatmap with :', HeatmapLayer) // Debugging line
  console.log('Drawing latlng with :', LatLng) // Debugging line


  // Clear existing layer if data changes
  if (heatmapLayer.value) {
    heatmapLayer.value.setMap(null)
  }

  // Format data for Google Maps Heatmap
  const heatmapData = props.points.map(p => ({
    location: new LatLng(p.lat, p.lng),
    weight: p.intensity ?? 0.5
  }))

  console.log(heatmapData[0].location.lat());

  // 2. Wrap data in MVCArray to completely detach it from Vue's reactivity proxy
  heatmapLayer.value = new HeatmapLayer({
    data: new MVCArray(heatmapData),
    map: mapInstance.value,
    radius: 25,
    opacity: 0.8,
  })

  // Auto-center map to fit all data points
  const bounds = new LatLngBounds()
  props.points.forEach(p => {
    bounds.extend(new LatLng(p.lat, p.lng))
  })

  if (!bounds.isEmpty()) {
    mapInstance.value.fitBounds(bounds)
  }
}

onMounted(async () => {
  if (!mapContainer.value) return

  try {
    setOptions({
      key: MAPAPIKEY,
      v: '3.64'
      // We don't need 'libraries: ["visualization"]' here anymore 
      // because we explicitly import it in drawPoints()
    })

    const { Map } = await importLibrary('maps')

    mapInstance.value = new Map(mapContainer.value, {
      center: { lat: 5.6037, lng: -0.187 }, 
      zoom: 2,
      streetViewControl: false,
      mapTypeControl: false,
    })

    mapReady.value = true
    await drawPoints()

  } catch (err) {
    console.warn('HeatmapView: Google Maps could not be loaded.', err)
    mapReady.value = true
  }
})

// Reactively update map when points prop changes
watch(() => props.points, async () => {
  await drawPoints()
}, { deep: true })

onUnmounted(() => {
  if (heatmapLayer.value) {
    heatmapLayer.value.setMap(null)
  }
  mapInstance.value = null
  heatmapLayer.value = null
})
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>