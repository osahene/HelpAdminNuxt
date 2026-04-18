<template>
  <div class="space-y-6">
    <div class="flex items-center space-x-4">
      <button @click="navigateTo('/contacts')" class="text-gray-500 hover:text-gray-700">
        <ArrowLeftIcon class="h-5 w-5" />
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ contact?.name }}</h1>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <dt class="text-sm font-medium text-gray-500">Phone</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ contact?.phone }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Email</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ contact?.email || '-' }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Status</dt>
          <dd class="mt-1">
            <span :class="statusBadge(contact?.status)">{{ contact?.status }}</span>
          </dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Registered User?</dt>
          <dd class="mt-1 text-sm">
            <span v-if="contact?.isUser" class="text-green-600">Yes</span>
            <span v-else class="text-gray-500">No</span>
          </dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Added By</dt>
          <dd class="mt-1 text-sm">
            <NuxtLink :to="`/users/${contact?.userId}`" class="text-primary-600 hover:underline">
              {{ contact?.user?.name }}
            </NuxtLink>
          </dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Added On</dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(contact?.createdAt) }}</dd>
        </div>
      </div>

      <div class="mt-6 flex space-x-3">
        <button v-if="!contact?.isUser" @click="inviteContact" class="btn-primary">
          Invite to Register
        </button>
        <button v-if="contact?.status === 'pending'" @click="resendInvite" class="btn-secondary">
          Resend Nomination Request
        </button>
      </div>
    </div>

    <!-- Alert Notifications History -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 border-b">
        <h3 class="text-lg font-medium">Notification History</h3>
      </div>
      <DataTable
        :columns="notificationColumns"
        :data="notifications"
        :loading="loadingNotifications"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin'})

const route = useRoute()
const contactId = route.params.id as string

const { data: contact } = await useApi(`/admin/contacts/${contactId}`)
const { data: notifications, pending: loadingNotifications } = await useApi(`/admin/contacts/${contactId}/notifications`)

const notificationColumns = [
  { key: 'alertType', label: 'Alert Type' },
  { key: 'sentAt', label: 'Sent At', format: (val: string) => new Date(val).toLocaleString() },
  { key: 'deliveryStatus', label: 'Status' },
  { key: 'verifiedAt', label: 'Verified At', format: (val: string) => val ? new Date(val).toLocaleString() : '-' }
]

const statusBadge = (status: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'approved': return `${base} bg-green-100 text-green-800`
    case 'pending': return `${base} bg-yellow-100 text-yellow-800`
    case 'rejected': return `${base} bg-red-100 text-red-800`
    default: return `${base} bg-gray-100 text-gray-800`
  }
}

const formatDate = (date: string) => new Date(date).toLocaleDateString()

const inviteContact = async () => {
  await useApi(`/admin/contacts/${contactId}/invite`, { method: 'POST' })
  // Refresh data
}

const resendInvite = async () => {
  await useApi(`/admin/contacts/${contactId}/resend-invite`, { method: 'POST' })
}
</script>