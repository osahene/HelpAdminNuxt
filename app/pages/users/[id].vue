<template>
  <div class="space-y-6">
    <div class="flex items-center space-x-4">
      <button @click="navigateTo('/users')" class="text-gray-500 hover:text-gray-700">
        <ArrowLeftIcon class="h-5 w-5" />
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user?.name }}</h1>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">Email</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ user?.email }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Phone</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ user?.phone }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Registered On</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(user?.createdAt) }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Contact Coverage</dt>
          <dd class="mt-1 text-sm">
            <span :class="coverageClass">{{ approvedContactsCount }}/5 approved</span>
          </dd>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 border-b flex justify-between items-center">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Emergency Contacts</h3>
        <button v-if="approvedContactsCount < 5" @click="sendContactReminder" class="btn-secondary text-sm">
          <EnvelopeIcon class="h-4 w-4 mr-2" />
          Send Reminder to Add Contacts
        </button>
      </div>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Is User?</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200">
          <tr v-for="contact in contacts || []" :key="contact.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ contact.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ contact.phone }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ contact.email || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="contactStatusBadge(contact.status)">{{ contact.status }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span v-if="contact.isUser" class="text-green-600">Yes</span>
              <button v-else @click="inviteContact(contact)" class="text-primary-600 hover:underline">
                Invite to Register
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <button v-if="contact.status === 'pending'" @click="resendInvite(contact.id)" class="text-sm text-primary-600 hover:underline">
                Resend Invite
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 border-b">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Alert History</h3>
      </div>
      <DataTable
        :columns="alertColumns"
        :data="alerts || []"
        :loading="loadingAlerts"
        @row-click="(row) => navigateTo(`/alerts/${row.id}`)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'
import { useApi } from '~/composables/useApi'
import { useRoute, navigateTo } from '#app'
import type { User, Alert, Contact } from '~/types'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const userId = route.params.id as string

const { data: user } = await useApi<User>(`/admin/users/${userId}`)
const { data: contacts } = await useApi<Contact[]>(`/admin/users/${userId}/contacts`)
const { data: alerts, pending: loadingAlerts } = await useApi<Alert[]>(`/admin/users/${userId}/alerts`)

const approvedContactsCount = computed(() => 
  // FIX: Provide fallback array so .filter() always works
  (contacts.value || []).filter((c: Contact) => c.status === 'approved').length
)

const coverageClass = computed(() => {
  const count = approvedContactsCount.value
  if (count === 5) return 'text-green-600'
  if (count >= 3) return 'text-yellow-600'
  return 'text-red-600'
})

const alertColumns = [
  { key: 'type', label: 'Type' },
  { key: 'createdAt', label: 'Date', format: (val: string) => formatDate(val) },
  { key: 'status', label: 'Status' }
]

const contactStatusBadge = (status: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'approved': return `${base} bg-green-100 text-green-800`
    case 'pending': return `${base} bg-yellow-100 text-yellow-800`
    case 'rejected': return `${base} bg-red-100 text-red-800`
    default: return `${base} bg-gray-100 text-gray-800`
  }
}

const sendContactReminder = async () => {
  await useApi(`/admin/users/${userId}/remind-contacts`, { method: 'POST' })
  // show success toast
}

// FIX: Explicitly typed 'contact' using your Contact interface instead of 'any'
const inviteContact = async (contact: Contact) => {
  await useApi(`/admin/contacts/${contact.id}/invite`, { method: 'POST' })
  // show success toast
}

const resendInvite = async (contactId: string) => {
  await useApi(`/admin/contacts/${contactId}/resend-invite`, { method: 'POST' })
}

// FIX: Made parameter optional so it won't crash if user data is still loading
const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}
</script>