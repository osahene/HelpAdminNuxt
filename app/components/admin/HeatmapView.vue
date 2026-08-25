<template>
  <div ref="wrapperEl" :class="['relative w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900', isFullscreen ? 'h-screen' : 'h-72']">
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
      class="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700/60 max-w-[calc(100%-5.5rem)]">
      <span v-for="type in presentTypes" :key="type" class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full shrink-0" :style="{ backgroundColor: alertColor(type) }"></span>
        <span class="text-[11px] font-medium text-slate-600 dark:text-slate-300 capitalize">{{ type }}</span>
      </span>
      <span class="text-[11px] text-slate-400 border-l border-slate-200 dark:border-slate-600 pl-2">{{ points.length }} alerts</span>
    </div>

    <button
      type="button"
      @click="toggleFullscreen"
      :title="isFullscreen ? 'Exit fullscreen' : 'Expand map'"
      class="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/60 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm transition-colors"
    >
      <ArrowsPointingInIcon v-if="isFullscreen" class="h-4 w-4" />
      <ArrowsPointingOutIcon v-else class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { MapIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/outline'
import { Deck } from '@deck.gl/core'
import { ScatterplotLayer } from '@deck.gl/layers'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css' // Crucial for map tiles formatting

type PointData = { lat: number; lng: number; intensity?: number; type?: string }

const props = defineProps<{
  points: Array<PointData>
}>()

// Same palette as AlertMap.vue's getAlertColor, kept in sync so an alert
// type reads as the same color everywhere in the admin.
const ALERT_COLORS: Record<string, string> = {
  robbery: '#ef4444',
  health: '#22c55e',
  fire: '#f97316',
  flood: '#3b82f6',
  violence: '#a855f7',
}
const DEFAULT_COLOR = '#6b7280'
const alertColor = (type?: string) => ALERT_COLORS[type ?? ''] ?? DEFAULT_COLOR
const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

const presentTypes = computed(() => {
  const seen = new Set<string>()
  for (const p of props.points) if (p.type) seen.add(p.type)
  return Array.from(seen)
})

// No key/style-JSON fetch required (unlike the previous stadiamaps.com URL,
// which 404'd — CORS Missing Allow Origin — since it needs an API key).
// Raster tiles as plain images sidestep that: CARTO serves them with an
// open Access-Control-Allow-Origin.
const basemapStyle = (dark: boolean) => ({
  version: 8 as const,
  sources: {
    basemap: {
      type: 'raster' as const,
      tiles: [0, 1, 2, 3].map(n => `https://${'abcd'[n]}.basemaps.cartocdn.com/${dark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`),
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [{ id: 'basemap', type: 'raster' as const, source: 'basemap' }],
})

const wrapperEl = ref<HTMLElement | null>(null)
const mapContainer = ref<HTMLElement | null>(null)
const mapReady = ref(false)
const isFullscreen = ref(false)

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

const createScatterLayer = () => {
  return new ScatterplotLayer<PointData>({
    id: 'AlertPointsLayer',
    data: props.points,
    pickable: true,
    stroked: true,
    getPosition: (d: PointData) => [d.lng, d.lat],
    getFillColor: (d: PointData) => [...hexToRgb(alertColor(d.type)), 200],
    getLineColor: [255, 255, 255, 220],
    lineWidthMinPixels: 1,
    getRadius: (d: PointData) => 40 + (d.intensity ?? 0.5) * 40,
    radiusMinPixels: 5,
    radiusMaxPixels: 18,
  })
}

const drawPoints = () => {
  if (!deckInstance.value) return
  deckInstance.value.setProps({
    layers: [createScatterLayer()]
  })
}

const toggleFullscreen = async () => {
  if (!wrapperEl.value) return
  if (!document.fullscreenElement) {
    await wrapperEl.value.requestFullscreen?.()
  } else {
    await document.exitFullscreen?.()
  }
}

const onFullscreenChange = () => {
  isFullscreen.value = document.fullscreenElement === wrapperEl.value
  // MapLibre/deck.gl both observe their container's size, but a fullscreen
  // transition can land a frame before that observer fires — nudge both.
  requestAnimationFrame(() => {
    mapInstance.value?.resize()
  })
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)

  if (!mapContainer.value) return

  try {
    const viewState = getInitialViewState()
    const isDark = document.documentElement.classList.contains('dark')

    // 1. Initialize MapLibre GL Basemap
    mapInstance.value = new maplibregl.Map({
      container: mapContainer.value,
      style: basemapStyle(isDark) as any,
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      interactive: false // Let deck.gl handle zoom/pan interactions
    })

    // 2. Initialize Deck.gl and sync it with MapLibre's view state
    deckInstance.value = new Deck({
      parent: mapContainer.value,
      initialViewState: viewState,
      controller: true,
      layers: [createScatterLayer()],
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
  document.removeEventListener('fullscreenchange', onFullscreenChange)
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
