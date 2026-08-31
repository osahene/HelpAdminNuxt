<template>
  <div ref="wrapperEl" :class="['relative w-full h-full', isFullscreen ? 'bg-white dark:bg-slate-900' : '']">
    <div ref="mapContainer" class="h-full w-full rounded-lg"></div>
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
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/outline'
import type { Alert } from '~/types'


const config = useRuntimeConfig()
const MAPAPIKEY = config.public.mapAPI as string || ''
const MAP_ID = config.public.googleMapsId as string || 'DEMO_MAP_ID'

const props = defineProps<{
  alerts: Alert[]
}>()

const emit = defineEmits<{
  (e: 'marker-click', alert: Alert): void
}>()

const wrapperEl = ref<HTMLElement | null>(null)
const mapContainer = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)
let map: google.maps.Map | null = null
let markerCluster: MarkerClusterer | null = null
let markers: google.maps.marker.AdvancedMarkerElement[] = []
let infoWindow: google.maps.InfoWindow | null = null
let PinElementCtor: typeof google.maps.marker.PinElement | null = null

// Initialize Google Maps
const initMap = async () => {
  if (!mapContainer.value) return

  // 1. Configure the loader globally
  setOptions({
    key: MAPAPIKEY,
    v: 'weekly',
  })

  // 2. Import the required maps libraries. 'marker' is what provides
  // AdvancedMarkerElement/PinElement — google.maps.Marker is deprecated
  // (still works, but gets no further bug fixes).
  const [{ Map }, { PinElement }] = await Promise.all([
    importLibrary('maps'),
    importLibrary('marker'),
  ])
  PinElementCtor = PinElement

  map = new Map(mapContainer.value, {
    center: { lat: 5.556, lng: -0.196 }, // Accra coordinates
    zoom: 2,
    mapId: MAP_ID,
    streetViewControl: false,
    mapTypeControl: false,
  })

  // Reusable InfoWindow for popups
  infoWindow = new google.maps.InfoWindow()

  updateMarkers()
}

const updateMarkers = () => {
  if (!map || !PinElementCtor) return

  if (markerCluster) {
    markerCluster.clearMarkers()
  } else {
    markers.forEach(m => { m.map = null })
  }
  markers = []

  if (props.alerts.length === 0) return

  const bounds = new google.maps.LatLngBounds()

  props.alerts.forEach(alert => {
    if (alert.location?.latitude && alert.location?.longitude) {
      const position = {
        lat: alert.location.latitude,
        lng: alert.location.longitude
      }

      // Recreate the custom colored dot with a PinElement instead of the
      // deprecated SymbolPath icon.
      const pin = new PinElementCtor!({
        background: getAlertColor(alert.type),
        borderColor: 'white',
        glyphColor: 'white',
        scale: 0.8,
      })

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        content: pin.element,
        title: alert.type,
      })

      // Bind the click event and the InfoWindow popup
      marker.addListener('click', () => {
        emit('marker-click', alert)

        const contentString = `
          <div style="color: black;">
            <b>${alert.type.toUpperCase()}</b><br>
            User: ${alert.user?.name || 'Unknown'}<br>
            <a href="/alerts/${alert.id}" target="_blank">View Details</a>
          </div>
        `
        infoWindow?.setContent(contentString)
        infoWindow?.open({
          anchor: marker,
          map,
          shouldFocus: false,
        })
      })

      markers.push(marker)
      bounds.extend(position)
    }
  })

  // 3. Re-initialize clustering
  markerCluster = new MarkerClusterer({ map, markers })

  // 4. Auto-zoom map to fit all active missions/alerts
 if (markers.length > 0) {
    map.fitBounds(bounds)
    
    // Fix for single marker zooming in too far
    const listener = google.maps.event.addListener(map, "idle", () => {
      if (map!.getZoom()! > 15) {
        map!.setZoom(15);
      }
      google.maps.event.removeListener(listener);
    });
  }
}

const getAlertColor = (type: string): string => {
  const colors: Record<string, string> = {
    robbery: '#ef4444',
    health: '#22c55e',
    fire: '#f97316',
    flood: '#3b82f6',
    violence: '#a855f7'
  }
  return colors[type] || '#6b7280'
}

// React to Pinia state changes
watch(() => props.alerts, updateMarkers, { deep: true })

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
  // Google Maps doesn't observe container resizes on its own — nudge it,
  // then re-center since fitBounds/idle already ran against the old size.
  if (map) {
    const center = map.getCenter()
    google.maps.event.trigger(map, 'resize')
    if (center) map.setCenter(center)
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  // The Loader automatically handles checking if window is available,
  // so we don't strictly need a process.client check, but it's safe to keep if preferred.
  if (process.client) {
    initMap()
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (markerCluster) {
    markerCluster.clearMarkers()
  }
})
</script>