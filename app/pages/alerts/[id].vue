<template>
  <div class="space-y-6">
    <!-- Header with back button and actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button @click="navigateTo('/alerts')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeftIcon class="h-5 w-5" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Alert #{{ alert?.id?.slice(0, 8) }}
        </h1>
        <span :class="statusBadgeClass(alert?.status)">{{ alert?.status }}</span>
      </div>
      <div class="flex space-x-3">
        <button v-if="alert?.status === 'active'" @click="markAsFalseAlarm" class="btn-secondary">
          <ExclamationTriangleIcon class="h-4 w-4 mr-2" />
          Mark False Alarm
        </button>
        <button v-if="alert?.status === 'active'" @click="resolveAlert" class="btn-primary">
          <CheckCircleIcon class="h-4 w-4 mr-2" />
          Resolve Alert
        </button>
      </div>
    </div>

    <!-- Alert Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Alert Type</dt>
        <dd class="mt-1 flex items-center">
          <span :class="alertTypeBadgeClass(alert?.type)" class="text-lg font-semibold">
            {{ alert?.type?.toUpperCase() }}
          </span>
        </dd>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Triggered At</dt>
        <dd class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ formatDateTime(alert?.createdAt) }}
        </dd>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Elapsed Time</dt>
        <dd class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ elapsedTime }}
        </dd>
      </div>
    </div>

    <!-- Map and User Info Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 h-80 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-md font-medium mb-2">Incident Location</h3>
        <ClientOnly>
          <AlertDetailMap :location="alert?.location" />
        </ClientOnly>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-md font-medium mb-3">User Information</h3>
        <div v-if="alert?.user" class="space-y-2">
          <p class="text-sm"><span class="font-medium">Name:</span> {{ alert.user.name }}</p>
          <p class="text-sm"><span class="font-medium">Phone:</span> {{ alert.user.phone }}</p>
          <p class="text-sm"><span class="font-medium">Email:</span> {{ alert.user.email }}</p>
          <NuxtLink :to="`/users/${alert.user.id}`" class="text-primary-600 hover:underline text-sm">
            View full profile →
          </NuxtLink>
        </div>
        <div v-else class="text-gray-500">User data unavailable</div>
      </div>
    </div>

    <!-- Response Timeline -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 class="text-md font-medium mb-4">Response Timeline</h3>
      <div class="flow-root">
        <ul role="list" class="-mb-8">
          <li v-for="(event, eventIdx) in timelineEvents" :key="event.id">
            <div class="relative pb-8">
              <span v-if="eventIdx !== timelineEvents.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
              <div class="relative flex space-x-3">
                <div>
                  <span :class="[event.iconBg, 'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800']">
                    <component :is="event.icon" class="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ event.content }}
                      <span v-if="event.detail" class="font-medium text-gray-900 dark:text-white">{{ event.detail }}</span>
                    </p>
                  </div>
                  <div class="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    <time :datetime="event.datetime">{{ event.time }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Manual Response Time Update (admin only) -->
      <div class="mt-6 border-t pt-4">
        <h4 class="text-sm font-medium mb-2">Update Response Times (Admin)</h4>
        <form @submit.prevent="updateResponseTimes" class="flex flex-wrap items-end gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500">Agency Notified At</label>
            <input v-model="responseForm.agencyNotifiedAt" type="datetime-local" class="mt-1 block rounded-md border-gray-300 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500">Agency Arrived At</label>
            <input v-model="responseForm.agencyArrivedAt" type="datetime-local" class="mt-1 block rounded-md border-gray-300 text-sm" />
          </div>
          <button type="submit" class="btn-primary text-sm">Save Times</button>
        </form>
      </div>
    </div>

    <!-- Contacts Notified & Verification Status -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-md font-medium mb-2">Contacts Notified</h3>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          <li v-for="contact in alert?.contactsNotifiedDetails" :key="contact.id" class="py-3 flex justify-between">
            <div>
              <p class="text-sm font-medium">{{ contact.name }}</p>
              <p class="text-xs text-gray-500">{{ contact.phone }}</p>
            </div>
            <div class="text-right">
              <span :class="contactStatusClass(contact.notificationStatus)">{{ contact.notificationStatus }}</span>
              <p v-if="contact.verifiedAt" class="text-xs text-green-600">Verified at {{ formatTime(contact.verifiedAt) }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 class="text-md font-medium mb-2">Verification Links</h3>
        <p class="text-sm text-gray-500 mb-2">Each contact receives a unique verification link in SMS/email.</p>
        <div class="space-y-2">
          <div v-for="link in verificationLinks" :key="link.contactId" class="flex items-center justify-between">
            <span class="text-sm truncate">{{ link.url }}</span>
            <button @click="copyLink(link.url)" class="text-primary-600 hover:text-primary-800">
              <ClipboardIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns'
import { 
  ArrowLeftIcon, ExclamationTriangleIcon, CheckCircleIcon,
  ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ClipboardIcon
} from '@heroicons/vue/24/outline'
import AlertDetailMap from '~/components/admin/AlertMap.vue'
import { useAlertsStore } from '~/stores/alerts'
import type { Alert } from '~/types'

definePageMeta({ layout: 'admin'})

const route = useRoute()
const alertsStore = useAlertsStore()
const alertId = route.params.id as string

const { data: alert, refresh } = await useApi<Alert>(`/alerts/${alertId}`)

const responseForm = reactive({
  agencyNotifiedAt: alert.value?.agencyNotifiedAt?.slice(0, 16) || '',
  agencyArrivedAt: alert.value?.agencyArrivedAt?.slice(0, 16) || ''
})

const elapsedTime = computed(() => {
  if (!alert.value?.createdAt) return 'N/A'
  const seconds = differenceInSeconds(new Date(), new Date(alert.value.createdAt))
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
})

const timelineEvents = computed(() => {
  if (!alert.value) return []
  const events = [
    {
      id: 'created',
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-red-500',
      content: 'Alert triggered by user',
      detail: alert.value.type,
      datetime: alert.value.createdAt,
      time: format(new Date(alert.value.createdAt), 'HH:mm:ss')
    }
  ]
  if (alert.value.agencyNotifiedAt) {
    events.push({
      id: 'notified',
      icon: PhoneIcon,
      iconBg: 'bg-blue-500',
      content: 'Emergency contacts notified',
      datetime: alert.value.agencyNotifiedAt,
      time: format(new Date(alert.value.agencyNotifiedAt), 'HH:mm:ss')
    })
  }
  if (alert.value.agencyArrivedAt) {
    events.push({
      id: 'arrived',
      icon: MapPinIcon,
      iconBg: 'bg-green-500',
      content: 'Agency arrived at scene',
      datetime: alert.value.agencyArrivedAt,
      time: format(new Date(alert.value.agencyArrivedAt), 'HH:mm:ss')
    })
  }
  if (alert.value.status === 'resolved') {
    events.push({
      id: 'resolved',
      icon: CheckCircleIcon,
      iconBg: 'bg-green-600',
      content: 'Alert marked as resolved',
      datetime: alert.value.resolvedAt,
      time: alert.value.resolvedAt ? format(new Date(alert.value.resolvedAt), 'HH:mm:ss') : 'N/A'
    })
  }
  return events
})

const verificationLinks = computed(() => {
  return alert.value?.contactsNotifiedDetails?.map((c: any) => ({
    contactId: c.id,
    url: `${window.location.origin}/verify/${alert.value.id}/${c.token}`
  })) || []
})

// Status badge helpers
const statusBadgeClass = (status?: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'active': return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
    case 'resolved': return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
    case 'false_alarm': return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`
    default: return `${base} bg-gray-100 text-gray-800`
  }
}

const alertTypeBadgeClass = (type?: string) => {
  const classes: Record<string, string> = {
    robbery: 'text-red-600 dark:text-red-400',
    health: 'text-green-600 dark:text-green-400',
    fire: 'text-orange-600 dark:text-orange-400',
    flood: 'text-blue-600 dark:text-blue-400',
    violence: 'text-purple-600 dark:text-purple-400'
  }
  return classes[type || ''] || 'text-gray-600'
}

const contactStatusClass = (status: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'delivered': return `${base} bg-blue-100 text-blue-800`
    case 'read': return `${base} bg-green-100 text-green-800`
    case 'failed': return `${base} bg-red-100 text-red-800`
    default: return `${base} bg-gray-100 text-gray-800`
  }
}

const formatDateTime = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy HH:mm:ss')
}

const formatTime = (date: string) => format(new Date(date), 'HH:mm')

const copyLink = (text: string) => {
  navigator.clipboard.writeText(text)
  // Show toast notification
}

const updateResponseTimes = async () => {
  await useApi(`/alerts/${alertId}/response`, {
    method: 'PATCH',
    body: {
      agencyNotifiedAt: responseForm.agencyNotifiedAt,
      agencyArrivedAt: responseForm.agencyArrivedAt
    }
  })
  refresh()
}

const markAsFalseAlarm = async () => {
  await useApi(`/alerts/${alertId}/status`, { method: 'PATCH', body: { status: 'false_alarm' } })
  refresh()
}

const resolveAlert = async () => {
  await useApi(`/alerts/${alertId}/status`, { method: 'PATCH', body: { status: 'resolved' } })
  refresh()
}
</script>