// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: [
        'leaflet.heat', // CJS
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'axios',
        'jwt-decode',
        'dayjs', // CJS
        '@headlessui/vue',
        '@heroicons/vue/24/outline',
        'date-fns',
        'vue-chartjs',
        'chart.js',
        'leaflet', // CJS
        'leaflet.markercluster', // CJS
        '@heroicons/vue/24/solid',
        
      ]
    }
  },
  compatibilityDate: '2025-07-15',
    modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/leaflet',
  ],
   css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },
  devtools: { enabled: true },
  runtimeConfig: {
    // Keys within public are also exposed client-side
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
      baseURL: process.env.VITE_baseURL || process.env.NUXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/',
      // Base for the admin realtime WebSocket, without the trailing
      // `/admin/` path — useRealtime.ts appends `admin/?token=...` itself,
      // so this should NOT end in a slash. Mirrors the same host:port as
      // baseURL's local-dev default, just over ws:// instead of http://.
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || 'ws://127.0.0.1:8000/ws',
      mapAPI: process.env.MAP_API_KEY || '',
      // AdvancedMarkerElement requires a Map ID to render at all. 'DEMO_MAP_ID'
      // is Google's own placeholder for trying it out — it works, but prints a
      // console notice and isn't meant for production. Create a real Map ID in
      // Cloud Console (tied to the same project as MAP_API_KEY) and set
      // GOOGLE_MAPS_ID once one exists.
      googleMapsId: process.env.GOOGLE_MAPS_ID || 'DEMO_MAP_ID',
    }
  },
plugins: [
    '~/plugins/axiosInstance.ts',
    '~/plugins/axiosKeys.ts',
  ],
})
