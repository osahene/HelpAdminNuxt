<template>
  <div ref="mapContainer" class="h-full w-full rounded-lg"></div>
</template>


<script setup lang="ts">
import * as L from 'leaflet'
import type { Alert } from '~/types'

const props = defineProps<{
  alerts: Alert[]
}>()

const emit = defineEmits<{
  (e: 'marker-click', alert: Alert): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markerClusterGroup: L.MarkerClusterGroup | null = null

const initMap = () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([0, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  markerClusterGroup = L.markerClusterGroup()
  map.addLayer(markerClusterGroup)

  updateMarkers()
}

const updateMarkers = () => {
  if (!markerClusterGroup || !map) return

  markerClusterGroup.clearLayers()

  if (props.alerts.length === 0) return

  const markers: L.Marker[] = []
  props.alerts.forEach(alert => {
    if (alert.location?.coordinates) {
      const marker = L.marker([alert.location.coordinates.lat, alert.location.coordinates.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:${getAlertColor(alert.type)}; width:12px; height:12px; border-radius:50%; border:2px solid white;"></div>`,
          iconSize: [16, 16]
        })
      })
      marker.bindPopup(`
        <b>${alert.type.toUpperCase()}</b><br>
        User: ${alert.user?.name || 'Unknown'}<br>
        <a href="/alerts/${alert.id}" target="_blank">View Details</a>
      `)
      marker.on('click', () => emit('marker-click', alert))
      markers.push(marker)
    }
  })

  markerClusterGroup.addLayers(markers)

  if (markers.length > 0) {
    const group = new L.FeatureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.5))
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

watch(() => props.alerts, updateMarkers, { deep: true })

onMounted(async () => {
  if (process.client) {
    // This ensures the plugin is only imported in the browser!
    await import('leaflet.markercluster')
    initMap()
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>
<style>
@import 'leaflet.markercluster/dist/MarkerCluster.css';
@import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>