<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <form @submit.prevent="saveGeneralSettings">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">System Name</label>
            <input v-model="general.systemName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Response Time Target (minutes)</label>
            <input v-model.number="general.targetResponseMinutes" type="number" min="1" class="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Contacts per User</label>
            <input v-model.number="general.maxContacts" type="number" min="1" max="10" class="mt-1 block w-32 rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label class="inline-flex items-center">
              <input v-model="general.requireContactApproval" type="checkbox" class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Require contact approval before alerts can be sent</span>
            </label>
          </div>
          <div class="pt-4">
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Notification Templates -->
    <div v-if="activeTab === 'templates'" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="space-y-6">
        <div v-for="template in templates" :key="template.id" class="border-b pb-4 last:border-0">
          <h3 class="text-md font-medium mb-2">{{ template.name }}</h3>
          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="block text-xs text-gray-500">SMS Template</label>
              <textarea v-model="template.sms" rows="2" class="mt-1 block w-full rounded-md border-gray-300 text-sm font-mono"></textarea>
            </div>
            <div>
              <label class="block text-xs text-gray-500">Email Subject</label>
              <input v-model="template.emailSubject" type="text" class="mt-1 block w-full rounded-md border-gray-300 text-sm" />
            </div>
            <div>
              <label class="block text-xs text-gray-500">Email Body (HTML)</label>
              <textarea v-model="template.emailBody" rows="4" class="mt-1 block w-full rounded-md border-gray-300 text-sm font-mono"></textarea>
            </div>
          </div>
        </div>
        <div class="pt-4">
          <button @click="saveTemplates" class="btn-primary">Save Templates</button>
        </div>
      </div>
    </div>

    <!-- Agency Integrations -->
    <div v-if="activeTab === 'integrations'" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="space-y-6">
        <div class="border rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-md font-medium">Emergency Services API</h3>
              <p class="text-sm text-gray-500">Integration with local emergency dispatch</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="integrations.emergencyApi.enabled" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div v-if="integrations.emergencyApi.enabled" class="mt-4 space-y-3">
            <input v-model="integrations.emergencyApi.apiKey" type="password" placeholder="API Key" class="block w-full rounded-md border-gray-300" />
            <input v-model="integrations.emergencyApi.endpoint" placeholder="API Endpoint URL" class="block w-full rounded-md border-gray-300" />
          </div>
        </div>
        <div class="pt-4">
          <button @click="saveIntegrations" class="btn-primary">Save Integration Settings</button>
        </div>
      </div>
    </div>

    <!-- Data Retention & Privacy -->
    <div v-if="activeTab === 'privacy'" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Alert Data Retention (days)</label>
          <input v-model.number="privacy.alertRetentionDays" type="number" min="30" class="mt-1 block w-32 rounded-md border-gray-300" />
          <p class="text-xs text-gray-500 mt-1">Alerts older than this will be anonymized or deleted.</p>
        </div>
        <div>
          <label class="inline-flex items-center">
            <input v-model="privacy.anonymizeLocation" type="checkbox" class="rounded border-gray-300 text-primary-600" />
            <span class="ml-2 text-sm">Anonymize precise location after retention period</span>
          </label>
        </div>
        <div class="pt-4">
          <button @click="savePrivacy" class="btn-primary">Save Privacy Settings</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'
definePageMeta({ layout: 'admin' })

const tabs = [
  { id: 'general', name: 'General' },
  { id: 'templates', name: 'Notification Templates' },
  { id: 'integrations', name: 'Integrations' },
  { id: 'privacy', name: 'Privacy & Data' },
]

const activeTab = ref('general')

// General settings
const general = reactive({
  systemName: 'Emergency Response System',
  targetResponseMinutes: 5,
  maxContacts: 5,
  requireContactApproval: true
})

// Templates
const templates = ref([
  {
    id: 'alert_triggered',
    name: 'Alert Triggered (to contacts)',
    sms: 'EMERGENCY: {user} has triggered a {type} alert. Location: {location}. Verify: {verifyLink}',
    emailSubject: 'Emergency Alert from {user}',
    emailBody: '<p>This is an emergency alert...</p>'
  },
  {
    id: 'contact_invite',
    name: 'Contact Nomination Request',
    sms: '{user} has added you as emergency contact. Accept? {acceptLink}',
    emailSubject: 'Emergency Contact Request',
    emailBody: '<p>Please confirm...</p>'
  }
])

const integrations = reactive({
  emergencyApi: {
    enabled: false,
    apiKey: '',
    endpoint: ''
  }
})

const privacy = reactive({
  alertRetentionDays: 365,
  anonymizeLocation: true
})

// Load settings on mount
onMounted(async () => {
  const { data } = await useApi('/admin/settings')
  if (data.value) {
    Object.assign(general, data.value.general)
    templates.value = data.value.templates
    Object.assign(integrations, data.value.integrations)
    Object.assign(privacy, data.value.privacy)
  }
})

const saveGeneralSettings = async () => {
  await useApi('/admin/settings/general', { method: 'PUT', body: general })
}

const saveTemplates = async () => {
  await useApi('/admin/settings/templates', { method: 'PUT', body: templates.value })
}

const saveIntegrations = async () => {
  await useApi('/admin/settings/integrations', { method: 'PUT', body: integrations })
}

const savePrivacy = async () => {
  await useApi('/admin/settings/privacy', { method: 'PUT', body: privacy })
}
</script>