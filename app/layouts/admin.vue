<template>
  <div class="h-screen flex overflow-hidden" :class="isDark ? 'dark' : ''">
    <!-- ===== DESKTOP SIDEBAR ===== -->
    <aside class="hidden md:flex md:shrink-0">
      <div class="flex flex-col w-64 safelink-sidebar">
        <!-- Brand -->
        <div class="flex items-center h-16 px-5 shrink-0 safelink-sidebar-brand">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
              </svg>
            </div>
            <span class="text-white font-semibold text-base tracking-wide">Help OO Help</span>
            <span
              class="text-[10px] text-sky-400 font-medium bg-sky-500/15 px-1.5 py-0.5 rounded uppercase tracking-widest">Admin</span>
          </div>
        </div>

        <!-- Nav label -->
        <div class="px-5 pt-6 pb-2">
          <span class="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Main Menu</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          <SidebarLink to="/dashboard" icon="HomeIcon">Dashboard</SidebarLink>
          <SidebarLink to="/users" icon="UsersIcon">Users</SidebarLink>
          <SidebarLink to="/contacts" icon="PhoneIcon">Contacts</SidebarLink>
          <SidebarLink to="/alerts" icon="BellAlertIcon">
            Alerts
            <template #badge>
              <span
                class="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white">{{
                  stats.activeAlerts }}</span>
            </template>
          </SidebarLink>

          <div class="px-2 pt-5 pb-2">
            <span class="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Insights</span>
          </div>

          <SidebarLink to="/analytics" icon="ChartBarIcon">Analytics</SidebarLink>
          <SidebarLink to="/reports" icon="DocumentTextIcon">Reports</SidebarLink>
          <SidebarLink to="/marketing" icon="MegaphoneIcon">Marketing</SidebarLink>

          <div class="px-2 pt-5 pb-2">
            <span class="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">System</span>
          </div>

          <SidebarLink to="/settings" icon="CogIcon">Settings</SidebarLink>
        </nav>

        <!-- Live status indicator: reflects the actual admin realtime
             WebSocket (AdminAlertConsumer), not a decorative always-on dot —
             if this says offline, the alert feed elsewhere on screen is
             stale. -->
        <div
          :class="[
            'px-4 py-3 mx-3 mb-3 rounded-xl border',
            isConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-500/10 border-slate-500/20'
          ]"
        >
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span
                v-if="isConnected"
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span :class="['relative inline-flex rounded-full h-2 w-2', isConnected ? 'bg-emerald-500' : 'bg-slate-400']"></span>
            </span>
            <span :class="['text-xs font-medium', isConnected ? 'text-emerald-400' : 'text-slate-400']">
              {{ isConnected ? 'System Online' : 'Reconnecting…' }}
            </span>
          </div>
        </div>

        <!-- User section -->
        <div class="shrink-0 border-t border-slate-700/50 p-4">
          <div class="flex items-center gap-3">
            <div
              class="h-8 w-8 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
              {{ userInitials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-200 truncate">{{ user?.name || 'Admin User' }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ user?.email || 'admin@helpoohelp.com' }}</p>
            </div>
            <button @click="logout" title="Logout"
              class="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10">
              <ArrowRightStartOnRectangleIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- ===== MOBILE SIDEBAR (slide-over) ===== -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="fixed inset-0 z-40 flex md:hidden" @close="sidebarOpen = false">
        <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0"
          enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100"
          leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild as="template" enter="transition ease-in-out duration-300 transform"
          enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0" leave-to="-translate-x-full">
          <div class="relative flex-1 flex flex-col max-w-xs w-full safelink-sidebar">
            <div class="absolute top-0 right-0 -mr-12 pt-2">
              <button @click="sidebarOpen = false"
                class="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-white">
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>

            <div class="flex items-center h-16 px-5 safelink-sidebar-brand">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center">
                  <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
                  </svg>
                </div>
                <span class="text-white font-semibold text-base">Help OO Help Admin</span>
              </div>
            </div>

            <nav class="flex-1 px-3 pt-4 pb-4 space-y-0.5 overflow-y-auto">
              <SidebarLink to="/dashboard" icon="HomeIcon">Dashboard</SidebarLink>
              <SidebarLink to="/users" icon="UsersIcon">Users</SidebarLink>
              <SidebarLink to="/contacts" icon="PhoneIcon">Contacts</SidebarLink>
              <SidebarLink to="/alerts" icon="BellAlertIcon">Alerts</SidebarLink>
              <SidebarLink to="/analytics" icon="ChartBarIcon">Analytics</SidebarLink>
              <SidebarLink to="/reports" icon="DocumentTextIcon">Reports</SidebarLink>
              <SidebarLink to="/marketing" icon="MegaphoneIcon">Marketing</SidebarLink>
              <SidebarLink to="/settings" icon="CogIcon">Settings</SidebarLink>
            </nav>
          </div>
        </TransitionChild>
      </Dialog>
    </TransitionRoot>

    <!-- ===== MAIN CONTENT ===== -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
      <AdminHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 relative overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Dialog, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { ArrowRightStartOnRectangleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import SidebarLink from '~/components/admin/Sidebar.vue'
import AdminHeader from '~/components/admin/Header.vue'
import { useAuthStore } from '~/stores/auth'
import { useAuth } from '~/composables/useAuth'
import { useDarkMode } from '~/composables/useDarkMode'
import { useRealtimeStatus } from '~/composables/useRealtime'
import { useAnalyticsStore } from '~/stores/analytics'


const analyticsStore = useAnalyticsStore()
const { stats } = storeToRefs(analyticsStore)
const sidebarOpen = ref(false)
const { user } = useAuth()
const { isDark } = useDarkMode()
const { isConnected } = useRealtimeStatus()

const userInitials = computed(() => {
  if (!user.value?.name) return 'A'
  const parts = user.value.name.split(' ')
  return parts.length > 1
    ? parts[0][0] + parts[1][0]
    : parts[0].slice(0, 2).toUpperCase()
})

const logout = async () => {
  const authStore = useAuthStore()
  await authStore.logout()
  navigateTo('/auth/login')
}

useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
    }
  ]
})
</script>
