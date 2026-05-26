// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
      baseURL: process.env.VITE_baseURL || 'http://127.0.0.1:8000/',
    }
  },
plugins: [
    '~/plugins/axiosInstance.ts',
    '~/plugins/axiosKeys.ts',
  ],
})
