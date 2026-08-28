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

    <!-- Campaign form + live preview -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
    <div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">

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

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Category</label>
            <select
              v-model="form.category"
              class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
            >
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p class="text-[11px] text-slate-400 mt-1.5">Sets the color/label shown on the resulting Titbit and drives the "In-App" channel's category.</p>
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Icon</label>
            <input
              v-model="form.icon"
              type="text"
              maxlength="8"
              placeholder="🌨️"
              class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-all"
            />
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="emoji in iconPresets"
                :key="emoji"
                type="button"
                @click="form.icon = emoji"
                class="h-8 w-8 flex items-center justify-center text-base rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Image (optional)</label>
          <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageSelected" />
          <div v-if="imagePreviewUrl" class="flex items-center gap-3">
            <img :src="imagePreviewUrl" alt="" class="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-600" />
            <button
              type="button"
              @click="clearImage"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30 transition-colors"
            >
              <XMarkIcon class="h-3.5 w-3.5" /> Remove
            </button>
          </div>
          <button
            v-else
            type="button"
            @click="imageInputRef?.click()"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-3 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 transition-colors"
          >
            <PhotoIcon class="h-3.5 w-3.5" /> Choose image
          </button>
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label
            v-for="opt in channelOptions"
            :key="opt.value"
            :class="[
              'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none',
              form.channels.includes(opt.value)
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10 dark:border-sky-500/50'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <input type="checkbox" :value="opt.value" v-model="form.channels" class="sr-only" />
            <div :class="['h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', form.channels.includes(opt.value) ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500']">
              <component :is="opt.icon" class="h-4 w-4" />
            </div>
            <div>
              <p :class="['text-sm font-medium', form.channels.includes(opt.value) ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200']">
                {{ opt.label }}
              </p>
              <p class="text-xs text-slate-400 mt-0.5">{{ opt.description }}</p>
            </div>
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

    <!-- Live preview: mirrors the Titbit card layout used elsewhere
         (helpnext's NotificationListItem.jsx / notificationCategory.js) so
         what the admin sees here is a faithful preview of what recipients
         will actually see in their in-app notification inbox. -->
    <div class="lg:sticky lg:top-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Live Preview</p>
      <div
        class="rounded-2xl border p-4"
        style="background: #fff; border-color: #EEF1FA;"
      >
        <div class="flex items-start gap-3">
          <span
            class="shrink-0 flex items-center justify-center rounded-[10px]"
            :style="{ width: '40px', height: '40px', background: previewMeta.bg, fontSize: '18px' }"
          >
            {{ previewIcon }}
          </span>
          <div class="min-w-0 flex-1">
            <span
              class="block text-[11.5px] font-bold uppercase tracking-wide"
              :style="{ color: previewMeta.color }"
            >
              {{ previewMeta.label }}
            </span>
            <span class="block text-[14.5px] font-bold mt-0.5" style="color: #14213D;">
              {{ previewTitle }}
            </span>
            <span class="block text-[13.5px] mt-0.5 leading-relaxed" style="color: #5B6483;">
              {{ previewBody }}
            </span>
            <img
              v-if="imagePreviewUrl"
              :src="imagePreviewUrl"
              alt=""
              class="block w-full mt-2.5 rounded-xl object-cover"
              style="max-height: 200px;"
            />
            <span class="block mt-2 text-[11.5px] italic" style="color: #8A93B3;">
              Source: HelpOoHelp Team
            </span>
          </div>
        </div>
      </div>
      <p class="text-[11px] text-slate-400 mt-2">
        This is how the message will look as an in-app Titbit (channel: <strong>in_app</strong>). SMS/Email delivery uses the subject/body text only.
      </p>
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
  ExclamationTriangleIcon, UserPlusIcon, XMarkIcon, IdentificationIcon,
  PhotoIcon, BellIcon, BellAlertIcon
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

const form = reactive({
  name: '',
  recipientType: 'all_users' as string,
  channels: ['sms'] as string[],
  category: 'general' as string,
  icon: '' as string,
  image: null as File | null,
  subject: '',
  body: '',
  filters: { country: '', region: '', city: '', town: '', locality: '' } as Record<string, string>
})

// Category shown on the resulting Titbit/in-app Notification — kept in sync
// by hand with main_admin.models.Campaign.CATEGORY_CHOICES /
// notifications.models.CATEGORY_CHOICES.
const categoryOptions = [
  { value: 'weather', label: 'Weather' },
  { value: 'hazard', label: 'Hazard / Safety Alert' },
  { value: 'seasonal', label: 'Seasonal Advisory' },
  { value: 'general', label: 'General Announcement' },
  { value: 'system', label: 'System' },
]

// Visual language for each category, matching helpnext's shared
// notificationCategory.js (src/utils/notificationCategory.js) so the
// preview card here reads the same way a Titbit will look in the app/web
// inbox — except "general", which uses this admin app's own primary accent
// (sky, used throughout HelpAdminNuxt) rather than helpnext's brand blue.
// A concretely-typed (non-indexed) fallback so lookups against the arbitrary
// string keys below stay `T | undefined` under noUncheckedIndexedAccess,
// while this default itself is always definitely present.
const DEFAULT_CATEGORY_META = { label: 'General', color: '#0ea5e9', bg: '#F0F9FF', icon: '📢' }
const categoryMeta: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  weather: { label: 'Weather', color: '#2563EB', bg: '#EFF6FF', icon: '🌦️' },
  hazard: { label: 'Hazard', color: '#DC2626', bg: '#FEF2F2', icon: '⚠️' },
  seasonal: { label: 'Seasonal', color: '#D97706', bg: '#FFFBEB', icon: '🍂' },
  general: DEFAULT_CATEGORY_META,
  system: { label: 'System', color: '#6B7280', bg: '#F3F4F6', icon: '⚙️' },
}

const iconPresets = ['🌨️', '🔥', '🌊', '⚠️', '📢', '🌾', '☀️']

const channelOptions = [
  { value: 'sms', label: 'SMS', description: "Sends a text message to the recipient's phone number.", icon: DevicePhoneMobileIcon },
  { value: 'email', label: 'Email', description: "Sends an email to the recipient's registered address.", icon: EnvelopeIcon },
  { value: 'in_app', label: 'In-App', description: "Appears in the user's notification inbox in the app and on the website.", icon: BellIcon },
  { value: 'push', label: 'Push', description: "Sends a push notification to the user's phone or browser, if they've enabled it.", icon: BellAlertIcon },
]

// --- Image upload ---
const imageInputRef = ref<HTMLInputElement | null>(null)
const imagePreviewUrl = ref<string | null>(null)

const onImageSelected = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  form.image = file
  imagePreviewUrl.value = file ? URL.createObjectURL(file) : null
}

const clearImage = () => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
  form.image = null
  imagePreviewUrl.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

onUnmounted(() => {
  if (imagePreviewUrl.value) URL.revokeObjectURL(imagePreviewUrl.value)
})

// --- Live preview ---
const previewMeta = computed(() => categoryMeta[form.category] ?? DEFAULT_CATEGORY_META)
const previewIcon = computed(() => form.icon.trim() || previewMeta.value.icon)
const previewTitle = computed(() => form.subject.trim() || form.name.trim() || 'Campaign title')
const previewBody = computed(() => form.body.trim() || 'Your message will appear here as you type…')

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
  { value: 'all_contacts', label: 'All Contacts', description: 'Every user and every saved contact, deduped by phone number', icon: IdentificationIcon },
  { value: 'custom', label: 'Custom Filter', description: 'Define your own audience', icon: UserGroupIcon },
]

// Helper to map camelCase frontend data to snake_case backend keys. When an
// image is attached this switches to multipart/form-data (the campaign
// endpoint's CampaignCreateSerializer accepts an `image` FileField); with no
// image it stays a plain JSON POST like before.
const buildCampaignPayload = (statusValue: 'draft' | 'sending'): { data: any; config?: Record<string, any> } => {
  const base = {
    name: form.name,
    recipient_type: form.recipientType, // Mapped to Django model
    channels: form.channels,
    category: form.category,
    icon: form.icon,
    subject: form.subject,
    body: form.body,
    filters: form.recipientType === 'custom' ? form.filters : {},
    status: statusValue
  }

  if (!form.image) {
    return { data: base }
  }

  // JSONField values (channels, filters) have to travel as JSON-encoded
  // strings over multipart form-data — DRF's JSONField parses a string
  // value with json.loads when it arrives via MultiPartParser.
  const fd = new FormData()
  fd.append('name', base.name)
  fd.append('recipient_type', base.recipient_type)
  fd.append('channels', JSON.stringify(base.channels))
  fd.append('category', base.category)
  fd.append('icon', base.icon)
  fd.append('subject', base.subject)
  fd.append('body', base.body)
  fd.append('filters', JSON.stringify(base.filters))
  fd.append('status', base.status)
  fd.append('image', form.image)

  return {
    data: fd,
    // app/plugins/axiosInstance.ts hardcodes 'Content-Type: application/json'
    // as an instance default. Left alone, axios's transformRequest would see
    // that JSON content type and silently re-serialize this FormData back
    // into a JSON string instead of sending it as multipart. Overriding it
    // here defeats that check; axios then clears it again before send so the
    // browser can fill in the correct multipart boundary itself.
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
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
    const { data, config } = buildCampaignPayload('sending')
    await $api.campaigns(data, config) // Hits POST /trap_admin/campaigns/
    navigateTo('/marketing')
  } catch (error) {
    console.error("Failed to dispatch campaign:", error)
  } finally {
    sending.value = false
  }
}

const saveDraft = async () => {
  try {
    const { data, config } = buildCampaignPayload('draft')
    await $api.campaigns(data, config) // Hits POST /trap_admin/campaigns/
    navigateTo('/marketing')
  } catch (error) {
    console.error("Failed to save draft:", error)
  }
}
</script>