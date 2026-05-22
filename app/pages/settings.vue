<template>
  <div class="w-full mx-auto space-y-5">
    <div>
      <h1 class="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Manage system configuration and preferences</p>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
          activeTab === tab.id
            ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
        ]"
      >
        <component :is="tab.icon" class="h-4 w-4 shrink-0" />
        {{ tab.name }}
      </button>
    </div>

    <div v-if="activeTab === 'general'" class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white">General Settings</h2>
        <p class="text-xs text-slate-400 mt-0.5">Core system configuration</p>
      </div>
      <form class="divide-y divide-slate-100 dark:divide-slate-700" @submit.prevent="saveGeneralSettings">
        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="sm:w-60 shrink-0">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">System Name</label>
            <p class="text-xs text-slate-400 mt-0.5">Displayed in emails and notifications</p>
          </div>
          <input
            v-model="general.systemName"
            type="text"
            class="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-all"
          />
        </div>

        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="sm:w-60 shrink-0">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Response Time Target</label>
            <p class="text-xs text-slate-400 mt-0.5">Minutes until agency should respond</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model.number="general.targetResponseMinutes"
              type="number"
              min="1"
              class="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
            />
            <span class="text-sm text-slate-400">minutes</span>
          </div>
        </div>

        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="sm:w-60 shrink-0">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Max Contacts per User</label>
            <p class="text-xs text-slate-400 mt-0.5">Currently set to 5 per requirements</p>
          </div>
          <input
            v-model.number="general.maxContacts"
            type="number"
            min="1"
            max="10"
            class="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
          />
        </div>

        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div class="sm:w-60 shrink-0">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Approval</label>
            <p class="text-xs text-slate-400 mt-0.5">Require contacts to accept nomination</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer mt-0.5">
            <input v-model="general.requireContactApproval" type="checkbox" class="sr-only peer" />
            <div class="w-10 h-5 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-400 rounded-full peer peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
            <span class="ml-3 text-sm text-slate-600 dark:text-slate-300">
              {{ general.requireContactApproval ? 'Required' : 'Not required' }}
            </span>
          </label>
        </div>

        <div class="px-6 py-4 bg-slate-50/60 dark:bg-slate-700/20 flex justify-end">
          <button type="submit" class="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95">
            <CheckIcon class="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>

    <div v-if="activeTab === 'templates'" class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Notification Templates</h2>
        <p class="text-xs text-slate-400 mt-0.5">SMS and email content sent to contacts during alerts</p>
      </div>

      <div class="divide-y divide-slate-100 dark:divide-slate-700">
        <div v-for="template in templates" :key="template.id" class="px-6 py-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="h-6 w-6 rounded-lg bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center">
              <EnvelopeIcon class="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ template.name }}</h3>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">SMS Template</label>
              <textarea
                v-model="template.sms"
                rows="2"
                class="block w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none"
              />
              <p class="text-[11px] text-slate-400 mt-1">Variables: <code class="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{user}'}</code> <code class="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{type}'}</code> <code class="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{location}'}</code> <code class="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{verifyLink}'}</code></p>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Email Subject</label>
              <input
                v-model="template.emailSubject"
                type="text"
                class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Email Body (HTML)</label>
              <textarea
                v-model="template.emailBody"
                rows="4"
                class="block w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50/60 dark:bg-slate-700/20 border-t border-slate-100 dark:border-slate-700 flex justify-end">
        <button class="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95" @click="saveTemplates">
          <CheckIcon class="h-4 w-4" />
          Save Templates
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'integrations'" class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Agency Integrations</h2>
        <p class="text-xs text-slate-400 mt-0.5">Connect with external emergency dispatch services</p>
      </div>

      <div class="p-6">
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 bg-slate-50/60 dark:bg-slate-700/20">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
                <BoltIcon class="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Emergency Services API</h3>
                <p class="text-xs text-slate-400">Integration with local emergency dispatch</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="integrations.emergencyApi.enabled" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-5 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-400 rounded-full peer peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
          <div v-if="integrations.emergencyApi.enabled" class="px-5 py-4 space-y-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">API Key</label>
              <div class="relative">
                <input
                  v-model="integrations.emergencyApi.apiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="API key"
                  class="block w-full pr-10 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" @click="showApiKey = !showApiKey">
                  <EyeIcon v-if="!showApiKey" class="h-4 w-4" />
                  <EyeSlashIcon v-else class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">API Endpoint URL</label>
              <input
                v-model="integrations.emergencyApi.endpoint"
                placeholder="https://dispatch.example.gov/api/v1"
                class="block w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>
            <button
              :disabled="testingConnection"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-3 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 transition-colors"
              @click="testConnection"
            >
              <ArrowPathIcon v-if="testingConnection" class="h-3.5 w-3.5 animate-spin" />
              <SignalIcon v-else class="h-3.5 w-3.5" />
              {{ testingConnection ? 'Testing...' : 'Test Connection' }}
            </button>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50/60 dark:bg-slate-700/20 border-t border-slate-100 dark:border-slate-700 flex justify-end">
        <button class="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95" @click="saveIntegrations">
          <CheckIcon class="h-4 w-4" />
          Save Integration Settings
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'privacy'" class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white">Privacy &amp; Data Retention</h2>
        <p class="text-xs text-slate-400 mt-0.5">Control how long data is kept and how it's handled</p>
      </div>

      <form class="divide-y divide-slate-100 dark:divide-slate-700" @submit.prevent="savePrivacy">
        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div class="sm:w-60 shrink-0">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Alert Data Retention</label>
            <p class="text-xs text-slate-400 mt-0.5">Alerts older than this are anonymized or deleted</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model.number="privacy.alertRetentionDays"
              type="number"
              min="30"
              class="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
            />
            <span class="text-sm text-slate-400">days</span>
          </div>
        </div>

        <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div class="sm:w-60 shrink-0">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Location Anonymization</label>
            <p class="text-xs text-slate-400 mt-0.5">Blur precise coordinates after retention period</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer mt-0.5">
            <input v-model="privacy.anonymizeLocation" type="checkbox" class="sr-only peer" />
            <div class="w-10 h-5 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-400 rounded-full peer peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
            <span class="ml-3 text-sm text-slate-600 dark:text-slate-300">
              {{ privacy.anonymizeLocation ? 'Enabled' : 'Disabled' }}
            </span>
          </label>
        </div>

        <div class="px-6 py-4">
          <div class="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <ExclamationTriangleIcon class="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p class="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Changes to retention settings are applied on the next scheduled maintenance run. Already-retained data is not affected retroactively.
            </p>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50/60 dark:bg-slate-700/20 flex justify-end">
          <button type="submit" class="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95">
            <CheckIcon class="h-4 w-4" />
            Save Privacy Settings
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CogIcon, EnvelopeIcon, BoltIcon, ShieldCheckIcon,
  CheckIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon,
  SignalIcon, ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useApi } from '~/composables/useApi'

interface GeneralSettings {
  systemName: string
  targetResponseMinutes: number
  maxContacts: number
  requireContactApproval: boolean
}

interface TemplateSettings {
  id: string
  name: string
  sms: string
  emailSubject: string
  emailBody: string
}

interface IntegrationSettings {
  emergencyApi: {
    enabled: boolean
    apiKey: string
    endpoint: string
  }
}

interface PrivacySettings {
  alertRetentionDays: number
  anonymizeLocation: boolean
}

interface SettingsResponse {
  general?: Partial<GeneralSettings>
  templates?: TemplateSettings[]
  integrations?: Partial<IntegrationSettings>
  privacy?: Partial<PrivacySettings>
}

definePageMeta({ layout: 'admin' })

const tabs = [
  { id: 'general', name: 'General', icon: CogIcon },
  { id: 'templates', name: 'Templates', icon: EnvelopeIcon },
  { id: 'integrations', name: 'Integrations', icon: BoltIcon },
  { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
]

const activeTab = ref('general')
const showApiKey = ref(false)
const testingConnection = ref(false)

const general = reactive<GeneralSettings>({
  systemName: 'Help OO Help',
  targetResponseMinutes: 5,
  maxContacts: 5,
  requireContactApproval: true
})

const templates = ref<TemplateSettings[]>([
  {
    id: 'alert_triggered',
    name: 'Alert Triggered (sent to contacts)',
    sms: 'EMERGENCY: {user} has triggered a {type} alert. Location: {location}. Verify: {verifyLink}',
    emailSubject: 'Emergency Alert from {user}',
    emailBody: '<p>This is an emergency alert from <strong>{user}</strong>...</p>'
  },
  {
    id: 'contact_invite',
    name: 'Contact Nomination Request',
    sms: '{user} has added you as an emergency contact. Accept? {acceptLink}',
    emailSubject: 'You have been nominated as an Emergency Contact',
    emailBody: '<p>Please confirm your nomination by clicking the link below...</p>'
  }
])

const integrations = reactive<IntegrationSettings>({
  emergencyApi: { enabled: false, apiKey: '', endpoint: '' }
})

const privacy = reactive<PrivacySettings>({
  alertRetentionDays: 365,
  anonymizeLocation: true
})

onMounted(async () => {
  const { data } = await useApi<SettingsResponse>('/admin/settings')
  const settings = data.value
  if (!settings) return

  if (settings.general) Object.assign(general, settings.general)
  if (settings.templates) templates.value = settings.templates
  if (settings.integrations) Object.assign(integrations, settings.integrations)
  if (settings.privacy) Object.assign(privacy, settings.privacy)
})

const saveGeneralSettings = () => useApi('/admin/settings/general', { method: 'PUT', body: general })
const saveTemplates = () => useApi('/admin/settings/templates', { method: 'PUT', body: templates.value })
const saveIntegrations = () => useApi('/admin/settings/integrations', { method: 'PUT', body: integrations })
const savePrivacy = () => useApi('/admin/settings/privacy', { method: 'PUT', body: privacy })

const testConnection = async () => {
  testingConnection.value = true
  await new Promise((resolve) => setTimeout(resolve, 1200))
  testingConnection.value = false
}
</script>
