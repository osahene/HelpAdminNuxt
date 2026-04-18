<template>
  <header class="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      <!-- Mobile menu button -->
      <button
        type="button"
        class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        @click="emit('toggle-sidebar')"
      >
        <span class="sr-only">Open sidebar</span>
        <Bars3Icon class="h-6 w-6" />
      </button>

      <!-- Search bar -->
      <div class="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
        <div class="max-w-lg w-full lg:max-w-xs">
          <label for="search" class="sr-only">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              v-model="searchQuery"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search users, alerts..."
              type="search"
              @keyup.enter="performSearch"
            />
          </div>
        </div>
      </div>

      <!-- Right side icons and dropdown -->
      <div class="flex items-center ml-4 md:ml-6 space-x-3">
        <!-- Notifications -->
        <button
          type="button"
          class="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative"
        >
          <span class="sr-only">View notifications</span>
          <BellIcon class="h-6 w-6" />
          <span
            v-if="unreadNotifications > 0"
            class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"
          />
        </button>

        <!-- Dark mode toggle -->
        <button
          type="button"
          class="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          @click="toggleDarkMode"
        >
          <span class="sr-only">Toggle dark mode</span>
          <SunIcon v-if="isDark" class="h-6 w-6" />
          <MoonIcon v-else class="h-6 w-6" />
        </button>

        <!-- Profile dropdown -->
        <Menu as="div" class="relative">
          <div>
            <MenuButton
              class="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span class="sr-only">Open user menu</span>
              <div class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                {{ userInitials }}
              </div>
            </MenuButton>
          </div>
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <MenuItems
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            >
              <MenuItem v-slot="{ active }">
                <NuxtLink
                  to="/settings"
                  :class="[active ? 'bg-gray-100 dark:bg-gray-700' : '', 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200']"
                >
                  Settings
                </NuxtLink>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  @click="logout"
                  :class="[active ? 'bg-gray-100 dark:bg-gray-700' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200']"
                >
                  Sign out
                </button>
              </MenuItem>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon, MagnifyingGlassIcon, BellIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '~/composables/useAuth'
import { useDarkMode } from '~/composables/useDarkMode'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const { user, logout } = useAuth()
const { isDark, toggle: toggleDarkMode } = useDarkMode()
const searchQuery = ref('')
const unreadNotifications = ref(3) // Example - replace with real data

const userInitials = computed(() => {
  if (!user.value?.name) return 'A'
  const parts = user.value.name.split(' ')
  return parts.length > 1
    ? parts[0][0] + parts[1][0]
    : parts[0].slice(0, 2).toUpperCase()
})

const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}
</script>