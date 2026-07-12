<template>
  <div class="space-y-5">

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">All registered app users</p>
      </div>
      <button 
        @click="exportUsers"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        Export
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative sm:col-span-2">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name, email or phone…"
            class="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
            @keyup.enter="applyFilters"
          />
        </div>
        <select 
          v-model="filters.coverageStatus" 
          class="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          <option value="">All Coverage</option>
          <option value="full">Full (5/5)</option>
          <option value="partial">Partial (1–4)</option>
          <option value="none">No contacts (0)</option>
        </select>
        <button 
          @click="applyFilters" 
          class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
        >
          <FunnelIcon class="h-3.5 w-3.5" />
          Apply
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <UsersIcon class="h-4 w-4 text-emerald-500" />
          <span class="text-sm font-semibold text-slate-900 dark:text-white">Registered Users</span>
          <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ pagination.total }} total
          </span>
        </div>
      </div>

      <DataTable
        :columns="columns"
        :data="users"
        :loading="loading"
        @row-click="(row) => navigateTo(`/users/${row.id}`)"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="h-7 w-7 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {{ getInitials(row.name) }}
            </div>
            <div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ row.name }}</p>
              <p class="text-xs text-slate-400">{{ row.email }}</p>
            </div>
          </div>
        </template>

        <template #cell-contactCount="{ row }">
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">
              <span 
                v-for="i in 5" 
                :key="i" 
                :class="['h-1.5 w-3 rounded-full', i <= (row.approved_contact_count ?? row.approvedContactCount ?? 0) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600']"
              ></span>
            </div>
            <span :class="['text-xs font-mono font-medium', coverageColor(row.approved_contact_count ?? row.approvedContactCount ?? 0)]">
              {{ row.approved_contact_count ?? row.approvedContactCount ?? 0 }}/5
            </span>
          </div>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              v-if="(row.approved_contact_count ?? row.approvedContactCount ?? 0) < 5"
              @click.stop="sendReminder(row.id)"
              class="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              Remind
            </button>
          </div>
        </template>
      </DataTable>

      <div class="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Showing <span class="font-medium text-slate-700 dark:text-slate-300">{{ displayFrom }}–{{ displayTo }}</span>
          of <span class="font-medium text-slate-700 dark:text-slate-300">{{ pagination.total }}</span>
        </p>
        <div class="flex items-center gap-1">
          <button 
            @click="changePage(pagination.currentPage - 1)" 
            :disabled="pagination.currentPage <= 1 || loading"
            class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <span class="px-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ pagination.currentPage }} / {{ totalPagesCalculated }}
          </span>
          <button 
            @click="changePage(pagination.currentPage + 1)" 
            :disabled="pagination.currentPage >= totalPagesCalculated || loading"
            class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon, 
  UsersIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'
import { useUsersStore } from '~/stores/users'

definePageMeta({ layout: 'admin' })

// 1. Initialize the Pinia Store and extract reactive state variables
const usersStore = useUsersStore()
const { users, loading, pagination } = storeToRefs(usersStore)

// 2. Local filter layout state stays local to the component UI context
const filters = reactive({ 
  search: '', 
  coverageStatus: '' 
})

// Column configurations maps key metrics with case fallbacks included
const columns = [
  { key: 'name', label: 'User' },
  { key: 'phone', label: 'Phone' },
  { key: 'contactCount', label: 'Contact Coverage' },
  { key: 'alert_count', label: 'Alerts', format: (v: number) => v ?? '0' },
  { key: 'created_at', label: 'Registered', format: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  { key: 'actions', label: '' },
]

// 3. Computed properties mapping directly to the central store state
const totalPagesCalculated = computed(() => pagination.value.totalPages)
const displayFrom = computed(() => pagination.value.total === 0 ? 0 : (pagination.value.currentPage - 1) * pagination.value.perPage + 1)
const displayTo = computed(() => Math.min(pagination.value.total, pagination.value.currentPage * pagination.value.perPage))

const getInitials = (name?: string) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2).toUpperCase()
}

const coverageColor = (count: number) => {
  if (count >= 5) return 'text-emerald-600 dark:text-emerald-400'
  if (count >= 3) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

// 4. Delegation Layer linking user events to the global actions
const loadUsers = async () => {
  // Map the local UI properties into the keys required by the backend API query parameter schema
  const apiParams = {
    search: filters.search || undefined,
    coverage_status: filters.coverageStatus || undefined,
  }
  await usersStore.fetchUsers(apiParams)
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  loadUsers()
}

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > totalPagesCalculated.value) return
  pagination.value.currentPage = newPage
  loadUsers()
}

const sendReminder = async (userId: string) => {
  try {
    await usersStore.sendContactReminder(userId)
    // Add toast or success notification triggers here if available
  } catch (error) {
    console.error(`Failed executing administrative notification task on id ${userId}:`, error)
  }
}

const exportUsers = () => {
  console.log('Export context called. Construct logic via browser file streams or link endpoints.')
}

// Fetch base array elements during page bootstrapping lifecycle
onMounted(loadUsers)
</script>