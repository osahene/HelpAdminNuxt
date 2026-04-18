<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button @click="navigateTo('/contacts')" class="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
        <ArrowLeftIcon class="h-4 w-4" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ contact?.name }}</h1>
        <p class="text-xs text-slate-400 mt-0.5">Contact detail</p>
      </div>
      <span v-if="contact?.status" :class="statusBadge(contact.status)" class="ml-2">
        {{ contact.status }}
      </span>
    </div>

    <!-- Profile card -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-6">
      <div class="flex items-start gap-5">
        <!-- Avatar -->
        <div class="h-14 w-14 rounded-2xl bg-linear-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
          {{ getInitials(contact?.name) }}
        </div>
        <!-- Details grid -->
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</dt>
            <dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{{ contact?.phone || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
            <dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{{ contact?.email || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Registered User</dt>
            <dd class="mt-1">
              <span v-if="contact?.isUser" class="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircleIcon class="h-3.5 w-3.5" /> Yes
              </span>
              <span v-else class="text-sm text-slate-400">No</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Added By</dt>
            <dd class="mt-1">
              <NuxtLink :to="`/users/${contact?.userId}`" class="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                {{ contact?.user?.name || '—' }}
              </NuxtLink>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Added On</dt>
            <dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{{ contact?.createdAt ? formatDate(contact.createdAt) : '—' }}</dd>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2 pt-5 border-t border-slate-100 dark:border-slate-700">
        <button
          v-if="!contact?.isUser"
          @click="inviteContact"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all"
        >
          <EnvelopeIcon class="h-4 w-4" />
          Invite to Register
        </button>
        <button
          v-if="contact?.status === 'pending'"
          @click="resendInvite"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all"
        >
          <ArrowPathIcon class="h-4 w-4" />
          Resend Nomination Request
        </button>
      </div>
    </div>

    <!-- Notification History -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <BellIcon class="h-4 w-4 text-sky-500" />
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Notification History</h3>
      </div>
      <DataTable :columns="notificationColumns" :data="notifications || []" :loading="!!loadingNotifications">
        <template #cell-alertType="{ row }">
          <span :class="alertTypeBadge(row.alertType)">{{ row.alertType }}</span>
        </template>
        <template #cell-deliveryStatus="{ row }">
          <span :class="deliveryStatusBadge(row.deliveryStatus)">{{ row.deliveryStatus }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, CheckCircleIcon, EnvelopeIcon, ArrowPathIcon, BellIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const contactId = route.params.id as string
const { data: contact } = await useApi(`/admin/contacts/${contactId}`)
const { data: notifications, pending: loadingNotifications } = await useApi(`/admin/contacts/${contactId}/notifications`)

const notificationColumns = [
  { key: 'alertType', label: 'Alert Type' },
  { key: 'sentAt', label: 'Sent At', format: (v: string) => v ? new Date(v).toLocaleString() : '—' },
  { key: 'deliveryStatus', label: 'Status' },
  { key: 'verifiedAt', label: 'Verified At', format: (v: string) => v ? new Date(v).toLocaleString() : '—' },
]

const getInitials = (name?: string) => {
  if (!name) return '?'
  const p = name.split(' ')
  return p.length > 1 ? p[0][0] + p[1][0] : name.slice(0, 2).toUpperCase()
}

const statusConfig: Record<string, string> = {
  approved: 'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10',
  pending:  'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10',
  rejected: 'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
}
const statusBadge = (s: string) => statusConfig[s] ?? 'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize text-slate-600 bg-slate-100 dark:bg-slate-700'

const alertTypeBadge = (t: string) => {
  const map: Record<string, string> = {
    robbery: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
    health: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10',
    fire: 'text-orange-700 bg-orange-50',
    flood: 'text-blue-700 bg-blue-50',
    violence: 'text-purple-700 bg-purple-50',
  }
  return `inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[t] ?? 'text-slate-600 bg-slate-100'}`
}

const deliveryStatusBadge = (s: string) => {
  const map: Record<string, string> = {
    delivered: 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-500/10',
    read: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10',
    failed: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
  }
  return `inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[s] ?? 'text-slate-600 bg-slate-100'}`
}

const formatDate = (d: string) => new Date(d).toLocaleDateString()
const inviteContact = async () => { await useApi(`/admin/contacts/${contactId}/invite`, { method: 'POST' }) }
const resendInvite = async () => { await useApi(`/admin/contacts/${contactId}/resend-invite`, { method: 'POST' }) }
</script>