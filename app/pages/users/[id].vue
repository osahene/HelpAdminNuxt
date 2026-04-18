<template>
  <div class="space-y-5">

    <!-- Back + title -->
    <div class="flex items-center gap-3">
      <button @click="navigateTo('/users')" class="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
        <ArrowLeftIcon class="h-4 w-4" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">{{ user?.name }}</h1>
        <p class="text-xs text-slate-400 mt-0.5">User profile</p>
      </div>
    </div>

    <!-- Profile + stats row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Profile card -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-6">
        <div class="flex items-start gap-5">
          <div class="h-14 w-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
            {{ getInitials(user?.name) }}
          </div>
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
              <dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{{ user?.email || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</dt>
              <dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{{ user?.phone || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Registered On</dt>
              <dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{{ formatDate(user?.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Alerts</dt>
              <dd class="mt-1 text-sm font-mono font-bold text-slate-900 dark:text-white">{{ (alerts || []).length }}</dd>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact coverage card -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">Contact Coverage</h3>
          <button
            v-if="approvedContactsCount < 5"
            @click="sendContactReminder"
            class="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
          >
            <EnvelopeIcon class="h-3 w-3" /> Remind
          </button>
        </div>
        <div class="flex items-end gap-3 mb-4">
          <span :class="['text-4xl font-bold font-mono leading-none', coverageColor]">{{ approvedContactsCount }}</span>
          <span class="text-lg text-slate-400 mb-0.5">/ 5</span>
        </div>
        <!-- Coverage dots -->
        <div class="flex gap-2 mb-3">
          <div
            v-for="i in 5"
            :key="i"
            :class="['flex-1 h-2 rounded-full transition-all', i <= approvedContactsCount ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700']"
          ></div>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ approvedContactsCount === 5 ? 'Fully covered ✓' : `${5 - approvedContactsCount} more contact${5 - approvedContactsCount !== 1 ? 's' : ''} needed` }}
        </p>
      </div>
    </div>

    <!-- Emergency contacts table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <PhoneIcon class="h-4 w-4 text-sky-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Emergency Contacts</h3>
          <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ (contacts || []).length }} / 5
          </span>
        </div>
      </div>

      <table class="min-w-full">
        <thead>
          <tr class="bg-slate-50/80 dark:bg-slate-700/40 border-b border-slate-100 dark:border-slate-700">
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Name</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr v-for="contact in contacts || []" :key="contact.id" class="group hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2">
                <div class="h-6 w-6 rounded-full bg-linear-to-br from-violet-400 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                  {{ getInitials(contact.name) }}
                </div>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ contact.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">{{ contact.phone }}</td>
            <td class="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">{{ contact.email || '—' }}</td>
            <td class="px-5 py-3.5">
              <span :class="contactStatusBadge(contact.status)">{{ contact.status }}</span>
            </td>
            <td class="px-5 py-3.5">
              <span v-if="contact.isUser" class="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircleIcon class="h-3.5 w-3.5" /> Yes
              </span>
              <button
                v-else
                @click="inviteContact(contact)"
                class="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium"
              >
                Invite
              </button>
            </td>
            <td class="px-5 py-3.5 text-right">
              <button
                v-if="contact.status === 'pending'"
                @click="resendInvite(contact.id)"
                class="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Resend
              </button>
            </td>
          </tr>
          <tr v-if="!(contacts || []).length">
            <td colspan="6" class="px-5 py-12 text-center text-sm text-slate-400">No contacts added yet</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Alert history -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <BellAlertIcon class="h-4 w-4 text-red-500" />
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Alert History</h3>
      </div>
      <DataTable
        :columns="alertColumns"
        :data="alerts || []"
        :loading="!!loadingAlerts"
        @row-click="(row) => navigateTo(`/alerts/${row.id}`)"
      >
        <template #cell-type="{ row }">
          <span :class="alertTypeBadge(row.type)">{{ row.type }}</span>
        </template>
        <template #cell-status="{ row }">
          <span :class="alertStatusBadge(row.status)">{{ row.status }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, CheckCircleIcon, BellAlertIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'
import type { User, Alert, Contact } from '~/types'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const userId = route.params.id as string

const { data: user } = await useApi<User>(`/admin/users/${userId}`)
const { data: contacts } = await useApi<Contact[]>(`/admin/users/${userId}/contacts`)
const { data: alerts, pending: loadingAlerts } = await useApi<Alert[]>(`/admin/users/${userId}/alerts`)

const approvedContactsCount = computed(() =>
  (contacts.value || []).filter((c: Contact) => c.status === 'approved').length
)

const coverageColor = computed(() => {
  const c = approvedContactsCount.value
  if (c >= 5) return 'text-emerald-600 dark:text-emerald-400'
  if (c >= 3) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
})

const alertColumns = [
  { key: 'type', label: 'Type' },
  { key: 'createdAt', label: 'Date', format: (v: string) => formatDate(v) },
  { key: 'status', label: 'Status' },
]

const getInitials = (name?: string) => {
  if (!name) return '?'
  const p = name.split(' ')
  return p.length > 1 ? p[0][0] + p[1][0] : name.slice(0, 2).toUpperCase()
}

const contactStatusBadge = (s: string) => {
  const map: Record<string, string> = {
    approved: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10',
    pending:  'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10',
    rejected: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
  }
  return `inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[s] ?? 'text-slate-600 bg-slate-100 dark:bg-slate-700'}`
}

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

const alertStatusBadge = (s: string) => {
  const map: Record<string, string> = {
    active: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
    resolved: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10',
    false_alarm: 'text-slate-600 bg-slate-100 dark:bg-slate-700',
  }
  return `inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[s] ?? 'text-slate-600 bg-slate-100'}`
}

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : '—'

const sendContactReminder = async () => { await useApi(`/admin/users/${userId}/remind-contacts`, { method: 'POST' }) }
const inviteContact = async (contact: Contact) => { await useApi(`/admin/contacts/${contact.id}/invite`, { method: 'POST' }) }
const resendInvite = async (contactId: string) => { await useApi(`/admin/contacts/${contactId}/resend-invite`, { method: 'POST' }) }
</script>