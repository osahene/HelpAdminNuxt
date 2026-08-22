<template>
  <div class="relative h-72 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
    <!-- MapLibre and Deck.gl share this container -->
    <div ref="mapContainer" class="h-full w-full absolute inset-0 z-0" />

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
import { Deck } from '@deck.gl/core'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css' // Crucial for map tiles formatting

type PointData = { lat: number; lng: number; intensity?: number }

const props = defineProps<{
  points: Array<PointData>
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapReady = ref(false)

const deckInstance = shallowRef<Deck | null>(null)
const mapInstance = shallowRef<any | null>(null)

const getInitialViewState = () => {
  if (!props.points || props.points.length === 0) {
    return { longitude: -0.187, latitude: 5.6037, zoom: 2 }
  }
  const lats = props.points.map(p => p.lat)
  const lngs = props.points.map(p => p.lng)
  return {
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    zoom: 11
  }
}

const createHeatmapLayer = () => {
  return new HeatmapLayer<PointData>({
    id: 'HeatmapLayer',
    data: props.points,
    aggregation: 'SUM',
    getPosition: (d: PointData) => [d.lng, d.lat],
    getWeight: (d: PointData) => d.intensity ?? 0.5,
    radiusPixels: 25,
    opacity: 0.8
  })
}

const drawPoints = () => {
  if (!deckInstance.value) return
  deckInstance.value.setProps({
    layers: [createHeatmapLayer()]
  })
}

onMounted(() => {
  if (!mapContainer.value) return

  try {
    const viewState = getInitialViewState()

    // 1. Initialize MapLibre GL Basemap
    mapInstance.value = new maplibregl.Map({
      container: mapContainer.value,
      style: 'https://stadiamaps.com/styles/alidade_smooth.json', // Basemap style
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      interactive: false // Let deck.gl handle zoom/pan interactions
    })

    // 2. Initialize Deck.gl and sync it with MapLibre's view state
    deckInstance.value = new Deck({
      parent: mapContainer.value,
      initialViewState: viewState,
      controller: true,
      layers: [createHeatmapLayer()],
      // Synchronize changes made by user mouse scrolling / panning
      onViewStateChange: ({ viewState }) => {
        mapInstance.value.jumpTo({
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
          bearing: viewState.bearing,
          pitch: viewState.pitch
        })
      },
      onLoad: () => {
        mapReady.value = true
      }
    })
  } catch (err) {
    console.warn('HeatmapView: map setup failed.', err)
    mapReady.value = true
  }
})

watch(() => props.points, () => {
  drawPoints()
}, { deep: true })

onUnmounted(() => {
  if (deckInstance.value) {
    deckInstance.value.finalize()
    deckInstance.value = null
  }
  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
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
