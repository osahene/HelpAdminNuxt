<template>
  <div ref="mapContainer" class="h-full w-full rounded-lg"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { Alert } from '~/types'


const config = useRuntimeConfig()
const MAPAPIKEY = config.public.mapAPI as string || ''

const props = defineProps<{
  alerts: Alert[]
}>()

const emit = defineEmits<{
  (e: 'marker-click', alert: Alert): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: google.maps.Map | null = null
let markerCluster: MarkerClusterer | null = null
let markers: google.maps.Marker[] = []
let infoWindow: google.maps.InfoWindow | null = null

// Initialize Google Maps
const initMap = async () => {
  if (!mapContainer.value) return

  // 1. Configure the loader globally
  setOptions({
    key: MAPAPIKEY, 
    v: 'weekly',
  })

  // 2. Import the required maps library
  const { Map } = await importLibrary('maps')

  map = new Map(mapContainer.value, {
    center: { lat: 5.556, lng: -0.196 }, // Accra coordinates
    zoom: 2,
    mapId: 'DEMO_MAP_ID', 
    streetViewControl: false,
    mapTypeControl: false,
  })

  // Reusable InfoWindow for popups
  infoWindow = new google.maps.InfoWindow()

  updateMarkers()
}

const updateMarkers = () => {
  if (!map) return

  if (markerCluster) {
    markerCluster.clearMarkers()
  } else {
    markers.forEach(m => m.setMap(null))
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

      // Recreate your custom CSS dot using Google's native Vector shapes
      const svgIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: getAlertColor(alert.type),
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: 'white',
        scale: 6 // Represents the radius, giving you a ~12px dot
      }

      const marker = new google.maps.Marker({
        position,
        icon: svgIcon,
        title: alert.type
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
    // Optional: Add a slight delay then zoom out a bit if it's too tight
    // setTimeout(() => { if (map.getZoom() > 16) map.setZoom(16) }, 100)
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

onMounted(() => {
  // The Loader automatically handles checking if window is available, 
  // so we don't strictly need a process.client check, but it's safe to keep if preferred.
  if (process.client) {
    initMap()
  }
})

onUnmounted(() => {
  if (markerCluster) {
    markerCluster.clearMarkers()
  }
})
</script>