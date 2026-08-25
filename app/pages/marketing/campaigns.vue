<template>
  <div class="w-full space-y-5">

    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/marketing"
        class="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
      >
        <ArrowLeftIcon class="h-4 w-4" />
      </NuxtLink>
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">New Campaign</h1>
        <p class="text-xs text-slate-400 mt-0.5">Send a bulk message to your user base</p>
      </div>
    </div>

    <!-- Campaign form -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">

      <!-- Step 1: Basic info -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2 mb-4">
          <div class="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">1</div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Campaign Details</h2>
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Campaign Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. August Safety Reminder"
            class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
          />
        </div>
      </div>

      <!-- Step 2: Recipients -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2 mb-4">
          <div class="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">2</div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Audience</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <label
            v-for="opt in recipientOptions"
            :key="opt.value"
            :class="[
              'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              form.recipientType === opt.value
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10 dark:border-sky-500/50'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <input type="radio" v-model="form.recipientType" :value="opt.value" class="sr-only" />
            <div :class="['h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', form.recipientType === opt.value ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500']">
              <component :is="opt.icon" class="h-4 w-4" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ opt.label }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ opt.description }}</p>
            </div>
          </label>
        </div>

        <!-- Custom filter -->
        <div v-if="form.recipientType === 'custom'" class="mt-3 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Filter by Location</p>
          <p class="text-xs text-slate-400 mb-3">Targets users whose most recent alert was triggered in the selected area. Narrow it down as far as you like — country alone is fine.</p>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div v-for="(level, i) in locationLevels" :key="level.key">
              <label class="block text-xs font-medium text-slate-500 mb-1">{{ level.label }}</label>
              <select
                v-model="form.filters[level.key]"
                @change="onLocationChange(level.key)"
                :disabled="i > 0 && !form.filters[locationLevels[i - 1].key]"
                class="block w-full px-2.5 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Any</option>
                <option v-for="opt in locationOptions[level.key]" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Preview recipients -->
        <div class="mt-3 flex items-center gap-3">
          <button
            type="button"
            @click="previewRecipients"
            :disabled="previewLoading"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-3 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 transition-colors"
          >
            <ArrowPathIcon v-if="previewLoading" class="h-3.5 w-3.5 animate-spin" />
            <UsersIcon v-else class="h-3.5 w-3.5" />
            {{ previewLoading ? 'Estimating…' : 'Preview Recipients' }}
          </button>
          <span v-if="estimatedCount !== null" class="text-xs text-slate-500 dark:text-slate-400">
            ≈ <span class="font-semibold text-slate-700 dark:text-slate-300">{{ estimatedCount.toLocaleString() }}</span> recipients
          </span>
        </div>

        <div v-if="recipientPreview.length" class="mt-3 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-w-sm">
          <table class="min-w-full">
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
              <tr v-for="(name, i) in recipientPreview.slice(0, 3)" :key="i">
                <td class="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">{{ name }}</td>
              </tr>
            </tbody>
          </table>
          <button
            v-if="estimatedCount && estimatedCount > 0"
            type="button"
            @click="showAllRecipients = true"
            class="w-full text-center text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-3 py-2 bg-slate-50 dark:bg-slate-700/40 border-t border-slate-200 dark:border-slate-700 transition-colors"
          >
            View all {{ estimatedCount.toLocaleString() }}
          </button>
        </div>
      </div>

      <!-- Step 3: Channels -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2 mb-4">
          <div class="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">3</div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Delivery Channels</h2>
        </div>
        <div class="flex gap-3">
          <label
            v-for="channel in ['sms', 'email']"
            :key="channel"
            :class="[
              'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all select-none',
              form.channels.includes(channel)
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10 dark:border-sky-500/50'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            ]"
          >
            <input type="checkbox" :value="channel" v-model="form.channels" class="sr-only" />
            <component :is="channel === 'sms' ? DevicePhoneMobileIcon : EnvelopeIcon" :class="['h-4 w-4', form.channels.includes(channel) ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400']" />
            <span :class="['text-sm font-medium', form.channels.includes(channel) ? 'text-sky-700 dark:text-sky-300' : 'text-slate-600 dark:text-slate-300']">
              {{ channel.toUpperCase() }}
            </span>
          </label>
        </div>
      </div>

      <!-- Step 4: Message -->
      <div class="px-6 py-5">
        <div class="flex items-center gap-2 mb-4">
          <div class="h-5 w-5 rounded-full bg-sky-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">4</div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Message Content</h2>
        </div>

        <div class="space-y-3">
          <div v-if="form.channels.includes('email')">
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Email Subject</label>
            <input
              v-model="form.subject"
              type="text"
              placeholder="Your email subject line"
              class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400">Message Body</label>
              <span :class="['text-[11px] font-mono', charCount > 160 && form.channels.includes('sms') ? 'text-amber-500' : 'text-slate-400']">
                {{ charCount }} chars{{ form.channels.includes('sms') ? ` · ${Math.ceil(charCount / 160)} SMS` : '' }}
              </span>
            </div>
            <textarea
              v-model="form.body"
              rows="5"
              required
              placeholder="Write your message here. Use {name} to personalise."
              class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none"
            />
            <p class="text-[11px] text-slate-400 mt-1.5">Use <code class="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{name}'}</code> to insert the recipient's name.</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 bg-slate-50/60 dark:bg-slate-700/20 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <button
          type="button"
          @click="saveDraft"
          class="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors"
        >
          Save draft
        </button>
        <button
          @click="sendCampaign"
          :disabled="!canSend || sending"
          class="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
        >
          <PaperAirplaneIcon v-if="!sending" class="h-4 w-4" />
          <ArrowPathIcon v-else class="h-4 w-4 animate-spin" />
          {{ sending ? 'Sending…' : 'Send Campaign' }}
        </button>
      </div>
    </div>

    <TransitionRoot as="template" :show="showAllRecipients">
      <Dialog as="div" class="relative z-50" @close="showAllRecipients = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
              leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <DialogTitle class="text-sm font-semibold text-slate-900 dark:text-white">
                    Recipients ({{ estimatedCount?.toLocaleString() ?? recipientPreview.length }})
                  </DialogTitle>
                  <button
                    @click="showAllRecipients = false"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XMarkIcon class="h-5 w-5" />
                  </button>
                </div>
                <ul class="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                  <li v-for="(name, i) in recipientPreview" :key="i" class="px-5 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                    {{ name }}
                  </li>
                </ul>
                <p v-if="recipientsTruncated" class="px-5 py-3 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700">
                  Showing the first {{ recipientPreview.length.toLocaleString() }} of {{ estimatedCount?.toLocaleString() }} recipients.
                </p>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import {
  ArrowLeftIcon, UsersIcon, ArrowPathIcon, EnvelopeIcon,
  DevicePhoneMobileIcon, PaperAirplaneIcon, UserGroupIcon,
  ExclamationTriangleIcon, UserPlusIcon, XMarkIcon
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

const form = reactive({
  name: '',
  recipientType: 'all_users' as string,
  channels: ['sms'] as string[],
  subject: '',
  body: '',
  filters: { country: '', region: '', city: '', town: '', locality: '' } as Record<string, string>
})

const locationLevels = [
  { key: 'country', label: 'Country' },
  { key: 'region', label: 'Region' },
  { key: 'city', label: 'City' },
  { key: 'town', label: 'Town' },
  { key: 'locality', label: 'Locality' },
]
const locationOptions = reactive<Record<string, string[]>>({
  country: [], region: [], city: [], town: [], locality: []
})

const loadLocationOptions = async (level: string) => {
  const idx = locationLevels.findIndex(l => l.key === level)
  const parents: Record<string, string> = {}
  for (let i = 0; i < idx; i++) {
    const key = locationLevels[i].key
    if (form.filters[key]) parents[key] = form.filters[key]
  }
  try {
    const res = await $api.campaignsLocationOptions(level, parents)
    locationOptions[level] = res.data?.options ?? []
  } catch (error) {
    console.error('Failed to load location options:', error)
    locationOptions[level] = []
  }
}

const onLocationChange = (changedLevel: string) => {
  const idx = locationLevels.findIndex(l => l.key === changedLevel)
  for (let i = idx + 1; i < locationLevels.length; i++) {
    const key = locationLevels[i].key
    form.filters[key] = ''
    locationOptions[key] = []
  }
  if (idx + 1 < locationLevels.length) {
    loadLocationOptions(locationLevels[idx + 1].key)
  }
}

watch(() => form.recipientType, (type) => {
  if (type === 'custom' && !locationOptions.country.length) {
    loadLocationOptions('country')
  }
})

const previewLoading = ref(false)
const estimatedCount = ref<number | null>(null)
const recipientPreview = ref<string[]>([])
const recipientsTruncated = ref(false)
const showAllRecipients = ref(false)
const sending = ref(false)

const charCount = computed(() => form.body.length)
const canSend = computed(() => form.name && form.body && form.channels.length > 0)

const recipientOptions = [
  { value: 'all_users', label: 'All Users', description: 'Every registered app user', icon: UsersIcon },
  { value: 'low_contacts', label: 'Low Coverage', description: 'Users with fewer than 5 contacts', icon: ExclamationTriangleIcon },
  { value: 'non_user_contacts', label: 'Unregistered Contacts', description: 'Contacts who haven\'t signed up', icon: UserPlusIcon },
  { value: 'custom', label: 'Custom Filter', description: 'Define your own audience', icon: UserGroupIcon },
]

// Helper to map camelCase frontend data to snake_case backend keys
const preparePayload = (statusValue: 'draft' | 'sending') => {
  return {
    name: form.name,
    recipient_type: form.recipientType, // Mapped to Django model
    channels: form.channels,
    subject: form.subject,
    body: form.body,
    filters: form.recipientType === 'custom' ? form.filters : {},
    status: statusValue
  }
}

const previewRecipients = async () => {
  previewLoading.value = true
  try {
    const filters = form.recipientType === 'custom' ? form.filters : undefined
    const res = await $api.campaignsPreview(form.recipientType, filters)
    estimatedCount.value = res.data?.count ?? 0
    recipientPreview.value = res.data?.recipients ?? []
    recipientsTruncated.value = !!res.data?.truncated
  } catch (error) {
    console.error("Failed to fetch recipient preview:", error)
  } finally {
    previewLoading.value = false
  }
}

const sendCampaign = async () => {
  sending.value = true
  try {
    const payload = preparePayload('sending')
    await $api.campaigns(payload) // Hits POST /trap_admin/campaigns/
    navigateTo('/marketing')
  } catch (error) {
    console.error("Failed to dispatch campaign:", error)
  } finally {
    sending.value = false
  }
}

const saveDraft = async () => {
  try {
    const payload = preparePayload('draft')
    await $api.campaigns(payload) // Hits POST /trap_admin/campaigns/
    navigateTo('/marketing')
  } catch (error) {
    console.error("Failed to save draft:", error)
  }
}
</script>