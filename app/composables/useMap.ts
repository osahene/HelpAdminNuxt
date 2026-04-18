// composables/useMap.ts
import L from 'leaflet'
import 'leaflet.markercluster'

export interface MapOptions {
  center?: [number, number]
  zoom?: number
  cluster?: boolean
}

export function useMap(container: Ref<HTMLElement | null>, options: MapOptions = {}) {
  let map: L.Map | null = null
  let markerClusterGroup: L.MarkerClusterGroup | null = null
  const markersLayer = L.layerGroup()

  const initMap = () => {
    if (!container.value) return

    const defaultCenter: [number, number] = [0, 0]
    const defaultZoom = 2

    map = L.map(container.value).setView(options.center || defaultCenter, options.zoom || defaultZoom)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    if (options.cluster) {
      markerClusterGroup = L.markerClusterGroup()
      map.addLayer(markerClusterGroup)
    } else {
      map.addLayer(markersLayer)
    }
  }

  const addMarker = (lat: number, lng: number, popupContent?: string, options?: L.MarkerOptions) => {
    if (!map) return null
    const marker = L.marker([lat, lng], options)
    if (popupContent) marker.bindPopup(popupContent)
    if (markerClusterGroup) {
      markerClusterGroup.addLayer(marker)
    } else {
      markersLayer.addLayer(marker)
    }
    return marker
  }

  const clearMarkers = () => {
    if (markerClusterGroup) {
      markerClusterGroup.clearLayers()
    } else {
      markersLayer.clearLayers()
    }
  }

  const setView = (center: [number, number], zoom?: number) => {
    map?.setView(center, zoom)
  }

  const fitBounds = (bounds: L.LatLngBoundsExpression) => {
    map?.fitBounds(bounds)
  }

  const destroyMap = () => {
    if (map) {
      map.remove()
      map = null
      markerClusterGroup = null
    }
  }

  return {
    map: readonly(map),
    initMap,
    addMarker,
    clearMarkers,
    setView,
    fitBounds,
    destroyMap
  }
}