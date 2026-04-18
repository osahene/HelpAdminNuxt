<template>
  <div class="relative h-72 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">

    <!-- Map container -->
    <div ref="mapContainer" class="h-full w-full" />

    <!-- Loading overlay -->
    <Transition name="fade">
      <div v-if="!mapReady" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 gap-3 z-10">
        <div class="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <MapIcon class="h-5 w-5 text-slate-400" />
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Loading heatmap…</p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ points?.length ?? 0 }} data points</p>
        </div>
        <!-- Placeholder grid to suggest a map -->
        <div class="absolute inset-0 opacity-30" style="background-image: linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px); background-size: 32px 32px;"></div>
      </div>
    </Transition>

    <!-- Point count badge -->
    <div v-if="mapReady && points?.length" class="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-700/60">
      <span class="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ points.length }} hotspots</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { MapIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  points: Array<{ lat: number; lng: number; intensity?: number }>
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapReady = ref(false)

let mapInstance: any = null

onMounted(async () => {
  if (!mapContainer.value) return

  try {
    // Dynamically import Leaflet to avoid SSR issues
    const L = await import('leaflet').then(m => m.default || m)
    await import('leaflet/dist/leaflet.css')

    // Centre on Ghana (Accra) as a sensible default for this app
    mapInstance = L.map(mapContainer.value, {
      center: [5.6037, -0.187],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    })

    // Use a clean tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© CartoDB'
    }).addTo(mapInstance)

    // Attribution small
    L.control.attribution({ position: 'bottomright', prefix: '' })
      .addTo(mapInstance)

    // Try to load leaflet.heat if available
    try {
      const heat = await import('leaflet.heat')
      if (props.points?.length && (L as any).heatLayer) {
        const heatData = props.points.map(p => [p.lat, p.lng, p.intensity ?? 0.5])
        ;(L as any).heatLayer(heatData, {
          radius: 25,
          blur: 20,
          maxZoom: 17,
          gradient: { 0.2: '#3b82f6', 0.4: '#f59e0b', 0.6: '#ef4444', 1.0: '#7c3aed' }
        }).addTo(mapInstance)
      }
    } catch {
      // leaflet.heat not installed — fall back to circle markers
      if (props.points?.length) {
        props.points.forEach(p => {
          L.circleMarker([p.lat, p.lng], {
            radius: 8 + (p.intensity ?? 0.5) * 12,
            fillColor: '#ef4444',
            fillOpacity: 0.4 + (p.intensity ?? 0.5) * 0.4,
            color: '#ef4444',
            weight: 1,
            opacity: 0.7
          }).addTo(mapInstance)
        })
      }
    }

    mapReady.value = true

    // Fit bounds if we have points
    if (props.points?.length) {
      const bounds = L.latLngBounds(props.points.map(p => [p.lat, p.lng] as [number, number]))
      mapInstance.fitBounds(bounds, { padding: [32, 32] })
    }

  } catch (err) {
    console.warn('HeatmapView: Leaflet could not be loaded.', err)
    mapReady.value = true // Show map container even without tiles
  }
})

// Re-render when points change
watch(() => props.points, async (newPoints) => {
  if (!mapInstance || !newPoints?.length) return
  // Trigger a map invalidate and re-fit
  mapInstance.invalidateSize()
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>