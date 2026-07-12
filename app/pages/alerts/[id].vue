<template>
  <div class="space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          @click="navigateTo('/alerts')"
          class="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-800 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
        >
          <ArrowLeftIcon class="h-4 w-4" />
        </button>
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="text-xl font-bold text-slate-900 dark:text-white font-mono">
              #{{ alert?.id?.slice(0, 8) }}
            </h1>
            <span :class="statusBadgeClass(alert?.status)">
              <span :class="statusDotClass(alert?.status)" class="inline-block h-1.5 w-1.5 rounded-full mr-1.5"></span>
              {{ statusLabel(alert?.status) }}
            </span>
            <span v-if="alert?.type" :class="typeBadgeClass(alert.type)">
              {{ alert.type }}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Triggered {{ alert?.created_at ? formatDistanceToNow(new Date(alert.created_at)) + ' ago' : '' }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="alert?.status === 'active'"
          @click="markAsFalseAlarm"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        >
          <ExclamationTriangleIcon class="h-4 w-4 text-amber-500" />
          False Alarm
        </button>
        <button
          v-if="alert?.status === 'active'"
          @click="resolveAlert"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 transition-all"
        >
          <CheckCircleIcon class="h-4 w-4" />
          Resolve Alert
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Alert Type</p>
        <div class="mt-3 flex items-center gap-3">
          <div :class="['h-10 w-10 rounded-xl flex items-center justify-center shrink-0', typeIconBg(alert?.type)]">
            <component :is="typeIcon(alert?.type)" :class="['h-5 w-5', typeIconColor(alert?.type)]" />
          </div>
          <span class="text-lg font-bold text-slate-900 dark:text-white capitalize">{{ alert?.type || '—' }}</span>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Triggered At</p>
        <p class="mt-3 text-lg font-bold text-slate-900 dark:text-white">
          {{ alert?.created_at ? formatDateTime(alert.created_at) : '—' }}
        </p>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Elapsed Time</p>
        <p class="mt-3 text-lg font-bold text-slate-900 dark:text-white font-mono">{{ elapsedTime }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <MapPinIcon class="h-4 w-4 text-sky-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Incident Location</h3>
          <span v-if="alert?.location?.address" class="text-xs text-slate-500 dark:text-slate-400 ml-1">— {{ alert.location.address }}</span>
        </div>
        <div class="h-72 p-1">
          <ClientOnly>
            <AlertDetailMap :alerts="alert ? [alert] : []" />
          </ClientOnly>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <UserCircleIcon class="h-4 w-4 text-sky-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">User Information</h3>
        </div>
        <div class="p-5">
          <div v-if="alert?.user">
            <div class="flex items-center gap-3 mb-5">
              <div class="h-11 w-11 rounded-full bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow shrink-0">
                {{ getInitials(alert.user.name) }}
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ alert.user.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Registered user</p>
              </div>
            </div>
            <dl class="space-y-3">
              <div class="flex items-center gap-2">
                <PhoneIcon class="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span class="text-sm text-slate-700 dark:text-slate-300">{{ alert.user.phone }}</span>
              </div>
              <div class="flex items-center gap-2">
                <EnvelopeIcon class="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span class="text-sm text-slate-700 dark:text-slate-300 truncate">{{ alert.user.email }}</span>
              </div>
            </dl>
            <NuxtLink
              :to="`/users/${alert.user.id}`"
              class="mt-5 flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors"
            >
              View full profile
              <ArrowRightIcon class="h-3 w-3" />
            </NuxtLink>
          </div>
          <div v-else class="text-sm text-slate-400 py-4 text-center">User data unavailable</div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <ClockIcon class="h-4 w-4 text-sky-500" />
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Response Timeline</h3>
      </div>
      <div class="p-6">
        <ol class="relative border-l-2 border-slate-200 dark:border-slate-700 space-y-0">
          <li v-for="(event, i) in timelineEvents" :key="event.id" class="ml-6 pb-8 last:pb-0">
            <span :class="['absolute -left-2.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-800', event.iconBg]">
              <component :is="event.icon" class="h-2.5 w-2.5 text-white" />
            </span>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ event.content }}</p>
                <p v-if="event.detail" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{{ event.detail }}</p>
              </div>
              <time class="shrink-0 text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/60 px-2 py-1 rounded-lg">
                {{ event.time }}
              </time>
            </div>
          </li>
        </ol>

        <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">Update Response Times</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Agency Notified At</label>
              <input
                v-model="responseForm.agency_notified_at"
                type="datetime-local"
                class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Agency Arrived At</label>
              <input
                v-model="responseForm.agency_arrived_at"
                type="datetime-local"
                class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <button
              @click="updateResponseTimes"
              class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all"
            >
              <CheckIcon class="h-4 w-4" />
              Save Times
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <UsersIcon class="h-4 w-4 text-sky-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Contacts Notified</h3>
          <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium ml-auto">
            {{ alert?.contactsNotifiedDetails?.length ?? 0 }}
          </span>
        </div>
        <ul class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <li
            v-for="contact in alert?.contacts_notified_details"
            :key="contact.id"
            class="px-5 py-3.5 flex items-center justify-between"
          >
            <div class="flex items-center gap-2.5">
              <div class="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {{ getInitials(contact.name) }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ contact.name }}</p>
                <p class="text-xs text-slate-400">{{ contact.phone }}</p>
              </div>
            </div>
            <div class="text-right">
              <span :class="contactStatusClass(contact.notification_status)">{{ contact.notification_status }}</span>
              <p v-if="contact.verified_at" class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                ✓ Verified {{ formatTime(contact.verified_at) }}
              </p>
            </div>
          </li>
          <li v-if="!alert?.contacts_notified_details?.length" class="px-5 py-10 text-center text-sm text-slate-400">
            No contacts notified
          </li>
        </ul>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <ShieldCheckIcon class="h-4 w-4 text-sky-500" />
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Verification Links</h3>
        </div>
        <div class="p-5">
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Each contact receives a unique link to verify the alert was triggered by their known user.</p>
          <div class="space-y-2.5">
            <div
              v-for="link in verificationLinks"
              :key="link.contactId"
              class="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-700/60 rounded-xl border border-slate-200/80 dark:border-slate-600/60"
            >
              <LinkIcon class="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span class="text-xs text-slate-600 dark:text-slate-400 truncate flex-1 font-mono">{{ link.url }}</span>
              <button
                @click="copyLink(link.url)"
                class="shrink-0 p-1 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                title="Copy link"
              >
                <ClipboardIcon class="h-3.5 w-3.5" />
              </button>
            </div>
            <div v-if="!verificationLinks.length" class="text-sm text-slate-400 text-center py-6">
              No verification links available
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, formatDistanceToNow, differenceInSeconds } from 'date-fns'
import {
  ArrowLeftIcon, ExclamationTriangleIcon, CheckCircleIcon, CheckIcon,
  ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, ClipboardIcon,
  ArrowRightIcon, UserCircleIcon, UsersIcon, LinkIcon, ShieldCheckIcon,
  FireIcon, HeartIcon, BoltIcon
} from '@heroicons/vue/24/outline'
import AlertDetailMap from '~/components/admin/AlertMap.vue'
import type { Alert } from '~/types'

import { storeToRefs } from 'pinia'
import { useAlertsStore } from '~/stores/alerts'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const alertId = route.params.id as string

const alertsStore = useAlertsStore()
// Alias selectedAlert to alert to keep template intact
const { selectedAlert: alert, loading } = storeToRefs(alertsStore)

// Fetch data properly avoiding hydration mismatches
await useAsyncData(`alert-${alertId}`, () => alertsStore.fetchAlertById(alertId))

const responseForm = reactive({
  agencyNotifiedAt: '',
  agencyArrivedAt: ''
})

// Ensures form stays synced if store updates after initialization
watch(
  alert,
  (newAlert) => {
    if (newAlert) {
      responseForm.agencyNotifiedAt = newAlert.agencyNotifiedAt?.slice(0, 16) || ''
      responseForm.agencyArrivedAt = newAlert.agencyArrivedAt?.slice(0, 16) || ''
    }
  },
  { immediate: true }
)

// --- Computed ---
const elapsedTime = computed(() => {
  if (!alert.value?.created_at) return 'N/A'
  const s = differenceInSeconds(new Date(), new Date(alert.value.created_at))
  return `${Math.floor(s / 60)}m ${s % 60}s`
})

const timelineEvents = computed(() => {
  if (!alert.value) return []
  const events: any[] = [
    { id: 'created', icon: ExclamationTriangleIcon, iconBg: 'bg-red-500',
      content: 'Alert triggered by user', detail: alert.value.type,
      time: format(new Date(alert.value.created_at), 'HH:mm:ss') }
  ]
  if (alert.value.agencyNotifiedAt) events.push({
    id: 'notified', icon: PhoneIcon, iconBg: 'bg-sky-500',
    content: 'Emergency contacts notified via call, SMS & email',
    time: format(new Date(alert.value.agencyNotifiedAt), 'HH:mm:ss')
  })
  if (alert.value.agencyArrivedAt) events.push({
    id: 'arrived', icon: MapPinIcon, iconBg: 'bg-emerald-500',
    content: 'Agency arrived at incident location',
    time: format(new Date(alert.value.agencyArrivedAt), 'HH:mm:ss')
  })
  if (alert.value.status === 'resolved') events.push({
    id: 'resolved', icon: CheckCircleIcon, iconBg: 'bg-emerald-600',
    content: 'Alert marked as resolved',
    time: alert.value.resolvedAt ? format(new Date(alert.value.resolvedAt), 'HH:mm:ss') : 'N/A'
  })
  return events
})

const verificationLinks = computed(() =>
  alert.value?.contactsNotifiedDetails?.map((c: any) => ({
    contactId: c.id,
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${alertId}/${c.token}`
  })) || []
)

// --- Helpers ---
const getInitials = (name?: string) => {
  if (!name) return '?'
  const p = name.split(' ')
  return p.length > 1 ? p[0][0] + p[1][0] : name.slice(0, 2).toUpperCase()
}

const typeConfig: Record<string, { pill: string; dot: string; bg: string; color: string }> = {
  'Robbery Attack': { pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10', dot: 'bg-red-500' },
  'Health Crisis': { pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  'Fire Outbreak': { pill: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-500/10', dot: 'bg-orange-500' },
  'Flood Alert': { pill: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10', dot: 'bg-blue-500' },
  'Violence Alert': { pill: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-500/10', dot: 'bg-purple-500' },
  'Call Emergency': { pill: 'text-yellow-700 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-500/10', dot: 'bg-yellow-500' },
}

const typeBadgeClass = (t?: string) =>
  `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${typeConfig[t || '']?.pill ?? 'text-slate-600 bg-slate-100'}`
const typeIconBg = (t?: string) => typeConfig[t || '']?.bg ?? 'bg-slate-100 dark:bg-slate-700'
const typeIconColor = (t?: string) => typeConfig[t || '']?.color ?? 'text-slate-500'
const typeIcon = (t?: string) => ({ fire: FireIcon, health: HeartIcon, robbery: BoltIcon }[t || ''] || ExclamationTriangleIcon)

const statusConfig: Record<string, { pill: string; dot: string; label: string }> = {
  active:      { pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10', dot: 'bg-red-500', label: 'Active' },
  resolved:    { pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500', label: 'Resolved' },
  false_alarm: { pill: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700', dot: 'bg-slate-400', label: 'False Alarm' },
}
const statusBadgeClass = (s?: string) =>
  `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig[s || '']?.pill ?? 'text-slate-600 bg-slate-100'}`
const statusDotClass = (s?: string) => statusConfig[s || '']?.dot ?? 'bg-slate-400'
const statusLabel = (s?: string) => statusConfig[s || '']?.label ?? s

const contactStatusClass = (status: string) => {
  const base = 'inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold rounded-full'
  const map: Record<string, string> = {
    delivered: `${base} bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300`,
    read:      `${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300`,
    failed:    `${base} bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300`,
  }
  return map[status] ?? `${base} bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300`
}

const formatDateTime = (d: string) => format(new Date(d), 'MMM d, yyyy HH:mm:ss')
const formatTime = (d: string) => format(new Date(d), 'HH:mm')

const copyLink = (text: string) => navigator.clipboard.writeText(text)

// Actions now use Pinia
const updateResponseTimes = async () => {
  await alertsStore.updateResponseTimes(alertId, {
    agencyNotifiedAt: responseForm.agencyNotifiedAt,
    agencyArrivedAt: responseForm.agencyArrivedAt
  })
}

const markAsFalseAlarm = async () => {
  await alertsStore.updateAlertStatus(alertId, 'false_alarm')
}

const resolveAlert = async () => {
  await alertsStore.updateAlertStatus(alertId, 'resolved')
}
</script>