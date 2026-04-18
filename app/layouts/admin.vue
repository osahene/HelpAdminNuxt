<template>
  <AdminHeader />
  <div class="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar for desktop -->
    <div class="hidden md:flex md:shrink-0">
      <div class="flex flex-col w-64">
        <div class="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div class="flex items-center shrink-0 px-4">
              <!-- <img class="h-8 w-auto" src="/logo.svg" alt="Emergency Admin" /> -->
              <span class="ml-2 text-xl font-semibold text-gray-900 dark:text-white">SafeLink Admin</span>
            </div>
            <nav class="mt-5 flex-1 px-2 space-y-1">
              <SidebarLink to="/dashboard" icon="HomeIcon">Dashboard</SidebarLink>
              <SidebarLink to="/users" icon="UsersIcon">Users</SidebarLink>
              <SidebarLink to="/contacts" icon="PhoneIcon">Contacts</SidebarLink>
              <SidebarLink to="/alerts" icon="BellAlertIcon">Alerts</SidebarLink>
              <SidebarLink to="/analytics" icon="ChartBarIcon">Analytics</SidebarLink>
              <SidebarLink to="/marketing" icon="MegaphoneIcon">Marketing</SidebarLink>
              <SidebarLink to="/reports" icon="DocumentTextIcon">Reports</SidebarLink>
              <SidebarLink to="/settings" icon="CogIcon">Settings</SidebarLink>
            </nav>
          </div>
          <div class="shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center">
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">Admin User</p>
                <button @click="logout" class="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile sidebar (slide-over) -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog as="div" class="fixed inset-0 z-40 flex md:hidden" @close="sidebarOpen = false">
        <!-- ... mobile sidebar implementation ... -->
      </Dialog>
    </TransitionRoot>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <div class="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
        <button @click="sidebarOpen = true" class="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900">
          <Bars3Icon class="h-6 w-6" />
        </button>
      </div>
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, TransitionRoot } from '@headlessui/vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import SidebarLink from '~/components/admin/Sidebar.vue'
import { useAuthStore } from '~/stores/auth'

const sidebarOpen = ref(false)

const logout = async () => {
  const authStore = useAuthStore()
  await authStore.logout()
  navigateTo('/login')
}
</script>