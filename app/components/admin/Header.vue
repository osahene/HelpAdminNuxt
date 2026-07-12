<template>
  <header class="shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm z-30">
    <div class="flex items-center justify-between h-16 px-4 sm:px-6">
      <button
        type="button"
        class="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        @click="emit('toggle-sidebar')"
      >
        <span class="sr-only">Open sidebar</span>
        <Bars3Icon class="h-5 w-5" />
      </button>

      <div class="hidden md:block">
        <div class="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
          <span>Help OO Help</span>
          <ChevronRightIcon class="h-3.5 w-3.5" />
          <span class="text-slate-700 dark:text-slate-200 font-medium capitalize">{{ currentPage }}</span>
        </div>
      </div>

      <div class="flex-1 flex justify-center md:justify-end px-4 md:px-0 md:ml-6 md:max-w-xs lg:max-w-sm">
        <div class="w-full relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          </div>
          <input
            v-model="searchQuery"
            class="block w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-700/60 border border-transparent rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-sky-300 dark:focus:border-sky-600 focus:ring-1 focus:ring-sky-300 dark:focus:ring-sky-700 transition-all"
            placeholder="Search users, alerts..."
            type="search"
            @keyup.enter="performSearch"
          />
          <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded font-mono">
            Ctrl+K
          </kbd>
        </div>
      </div>

      <div class="flex items-center gap-1 ml-4">
        <button
          type="button"
          class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          @click="toggleDarkMode"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <SunIcon v-if="isDark" class="h-5 w-5" />
          <MoonIcon v-else class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <span class="sr-only">Notifications</span>
          <BellIcon class="h-5 w-5" />
          <span
            v-if="unreadNotifications > 0"
            class="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-800"
          >
            {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
          </span>
        </button>

        <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <Menu as="div" class="relative">
          <MenuButton class="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
            <div class="h-7 w-7 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow shrink-0">
              {{ userInitials }}
            </div>
            <span class="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-30 truncate">
              {{ user?.name || 'Admin' }}
            </span>
            <ChevronDownIcon class="hidden sm:block h-3.5 w-3.5 text-slate-400" />
          </MenuButton>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <MenuItems class="absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-slate-200/80 dark:ring-slate-700 py-1 focus:outline-none z-50">
              <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p class="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                <p class="text-sm font-semibold text-slate-800 dark:text-white truncate mt-0.5">{{ user?.email || 'admin@safelink.com' }}</p>
              </div>

              <MenuItem v-slot="{ active }">
                <NuxtLink
                  to="/settings"
                  :class="['flex items-center gap-2.5 px-4 py-2 text-sm transition-colors mt-1', active ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700' : 'text-slate-600 dark:text-slate-300']"
                >
                  <CogIcon class="h-4 w-4 shrink-0" />
                  Settings
                </NuxtLink>
              </MenuItem>

              <MenuItem v-slot="{ active }">
                <NuxtLink
                  to="/profile"
                  :class="['flex items-center gap-2.5 px-4 py-2 text-sm transition-colors', active ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700' : 'text-slate-600 dark:text-slate-300']"
                >
                  <UserCircleIcon class="h-4 w-4 shrink-0" />
                  Your Profile
                </NuxtLink>
              </MenuItem>

              <div class="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="logout"
                    :class="['w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors', active ? 'text-red-600 bg-red-50 dark:bg-red-500/10' : 'text-slate-600 dark:text-slate-300']"
                  >
                    <ArrowRightOnRectangleIcon class="h-4 w-4 shrink-0" />
                    Sign out
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  Bars3Icon, MagnifyingGlassIcon, BellIcon, SunIcon, MoonIcon,
  ChevronRightIcon, ChevronDownIcon, CogIcon, UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { useAuth } from '~/composables/useAuth'
import { useDarkMode } from '~/composables/useDarkMode'
import { useAnalyticsStore } from '~/stores/analytics'

const analyticsStore = useAnalyticsStore()
const { stats } = storeToRefs(analyticsStore)

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const route = useRoute()
const { user, logout } = useAuth()
const { isDark, toggle: toggleDarkMode } = useDarkMode()

const searchQuery = ref('')
const unreadNotifications = computed(() => stats.value.activeAlerts || 0)

const currentPage = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts[0] || 'dashboard'
})

const userInitials = computed(() => {
  if (!user.value?.name) return 'A'
  const parts = user.value.name.trim().split(/\s+/)
  return parts.length > 1
    ? `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
})

const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}
</script>
