<template>
  <div class="space-y-5">

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Contacts</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Emergency contacts registered across all users</p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        Export CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="relative sm:col-span-2 lg:col-span-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search name, phone, email…"
            class="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all"
            @keyup.enter="applyFilters"
          />
        </div>
        <select v-model="filters.status" class="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select v-model="filters.isUser" class="py-2 px-3 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400">
          <option value="">All Contacts</option>
          <option value="true">Registered Users</option>
          <option value="false">Non-Users</option>
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

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <PhoneIcon class="h-4 w-4 text-sky-500" />
          <span class="text-sm font-semibold text-slate-900 dark:text-white">All Contacts</span>
          <span class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ pagination.total ?? 0 }} total
          </span>
        </div>
      </div>

      <DataTable
        :columns="columns"
        :data="contacts"
        :loading="loading"
        @row-click="(row) => navigateTo(`/contacts/${row.id}`)"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="h-6 w-6 rounded-full bg-linear-to-br from-violet-400 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
              {{ getInitials(row.name) }}
            </div>
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>

        <template #cell-phone="{ row }">
          <span>{{ row.country_code }}{{ row.phone_number }}</span>
        </template>

        <template #cell-status="{ row }">
          <span :class="statusBadge(row.status)">
            <span :class="statusDot(row.status)" class="inline-block h-1.5 w-1.5 rounded-full mr-1.5"></span>
            {{ row.status }}
          </span>
        </template>

        <template #cell-isUser="{ row }">
          <span v-if="row.is_user" class="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircleIcon class="h-3.5 w-3.5" /> Yes
          </span>
          <span v-else class="text-xs text-slate-400">—</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              v-if="!row.is_user"
              @click.stop="inviteContact(row)"
              class="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-2 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
            >
              Invite
            </button>
            <button
              v-if="row.status === 'pending'"
              @click.stop="resendInvite(row.id)"
              class="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              Resend
            </button>
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Showing
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ displayFrom }}–{{ displayTo }}</span>
          of <span class="font-medium text-slate-700 dark:text-slate-300">{{ pagination.total }}</span>
        </p>
        <div class="flex items-center gap-1">
          <button @click="changePage(pagination.currentPage - 1)" :disabled="pagination.currentPage <= 1"
            class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <span class="px-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
            {{ pagination.currentPage }} / {{ pagination.totalPages }}
          </span>
          <button @click="changePage(pagination.currentPage + 1)" :disabled="pagination.currentPage >= pagination.totalPages"
            class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon,
  PhoneIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'
import type { Contact } from '~/types'
import { useContactsStore } from '~/stores/contacts'

definePageMeta({ layout: 'admin' })

const contactsStore = useContactsStore()
const { contacts, loading, pagination } = storeToRefs(contactsStore)

const filters = reactive({ search: '', status: '', isUser: '' })

const displayFrom = computed(() => pagination.value.total === 0 ? 0 : (pagination.value.currentPage - 1) * pagination.value.perPage + 1)
const displayTo = computed(() => Math.min(pagination.value.total, pagination.value.currentPage * pagination.value.perPage))

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'relation', label: 'Relationship' },
  { key: 'status', label: 'Status' },
  { key: 'is_user', label: 'Registered' },
  { key: 'added_by.name', label: 'Added By' },
  { key: 'created_at', label: 'Added On', format: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  { key: 'actions', label: '' },
]

const getInitials = (name?: string) => {
  if (!name) return '?'
  const p = name.split(' ')
  return p.length > 1 ? p[0][0] + p[1][0] : name.slice(0, 2).toUpperCase()
}

const statusConfig: Record<string, { pill: string; dot: string }> = {
  approved: { pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  pending:  { pill: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  rejected: { pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10', dot: 'bg-red-500' },
}

const statusBadge = (s: string) =>
  `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusConfig[s]?.pill ?? 'text-slate-600 bg-slate-100 dark:bg-slate-700'}`
const statusDot = (s: string) => statusConfig[s]?.dot ?? 'bg-slate-400'

// 3. Store Delegation Methods
const loadContacts = async () => {
  const apiParams = {
    search: filters.search || undefined,
    status: filters.status || undefined,
    isUser: filters.isUser || undefined,
  }
  await contactsStore.fetchContacts(apiParams)
}

const applyFilters = () => { 
  pagination.value.currentPage = 1
  loadContacts() 
}

const changePage = (p: number) => { 
  if (p < 1 || p > pagination.value.totalPages) return
  pagination.value.currentPage = p
  loadContacts() 
}

const inviteContact = async (contact: Contact) => { 
  await contactsStore.inviteContact(contact.id) 
}

const resendInvite = async (id: string) => { 
  await contactsStore.resendInvite(id) 
}

onMounted(loadContacts)
</script>