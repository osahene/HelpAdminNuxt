<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Marketing Campaigns</h1>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 class="text-lg font-medium mb-4">Send Bulk Message</h2>
      <form @submit.prevent="sendCampaign">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name</label>
            <input v-model="form.name" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Recipients</label>
            <select v-model="form.recipientType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="all_users">All Registered Users</option>
              <option value="low_contacts">Users with &lt;5 Contacts</option>
              <option value="non_user_contacts">Contacts Not Registered</option>
              <option value="custom">Custom Filter</option>
            </select>
          </div>

          <div v-if="form.recipientType === 'custom'" class="grid grid-cols-2 gap-4">
            <!-- Additional filters like location, registration date, etc. -->
            <div>
              <label class="block text-sm font-medium">Location</label>
              <input v-model="form.filters.location" type="text" placeholder="City/Region" class="mt-1 block w-full rounded-md border-gray-300" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium">Message Type</label>
            <div class="mt-2 space-x-4">
              <label class="inline-flex items-center">
                <input v-model="form.channels" type="checkbox" value="sms" class="rounded border-gray-300 text-primary-600" />
                <span class="ml-2 text-sm">SMS</span>
              </label>
              <label class="inline-flex items-center">
                <input v-model="form.channels" type="checkbox" value="email" class="rounded border-gray-300 text-primary-600" />
                <span class="ml-2 text-sm">Email</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium">Subject (Email)</label>
            <input v-model="form.subject" type="text" class="mt-1 block w-full rounded-md border-gray-300" />
          </div>

          <div>
            <label class="block text-sm font-medium">Message Body</label>
            <textarea v-model="form.body" rows="6" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
            <p class="mt-1 text-xs text-gray-500">You can use {name} placeholder.</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" @click="previewRecipients" class="btn-secondary">Preview Recipients</button>
            <button type="submit" class="btn-primary">Send Campaign</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Campaign History -->
    <div class="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 border-b">
        <h3 class="text-lg font-medium">Past Campaigns</h3>
      </div>
      <DataTable :columns="campaignColumns" :data="campaigns" :loading="loadingCampaigns" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin'})

const form = reactive({
  name: '',
  recipientType: 'all_users',
  channels: ['sms'],
  subject: '',
  body: '',
  filters: {}
})

const { data: campaigns, pending: loadingCampaigns } = await useApi('/admin/campaigns')

const campaignColumns = [
  { key: 'name', label: 'Name' },
  { key: 'recipientType', label: 'Audience' },
  { key: 'sentAt', label: 'Sent' },
  { key: 'stats.delivered', label: 'Delivered' }
]

const sendCampaign = async () => {
  await useApi('/admin/campaigns', { method: 'POST', body: form })
  // Show success notification and refresh campaigns
}

const previewRecipients = async () => {
  const { data } = await useApi('/admin/campaigns/preview', { params: form })
  // Show modal with estimated count
}
</script>