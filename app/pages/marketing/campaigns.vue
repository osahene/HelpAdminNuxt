<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
      <NuxtLink to="/marketing" class="btn-primary">Create New Campaign</NuxtLink>
    </div>

    <!-- Campaign List -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <DataTable
        :columns="columns"
        :data="campaigns"
        :loading="loading"
        @row-click="(row) => openCampaignDetail(row)"
      >
        <template #cell-status="{ row }">
          <span :class="statusBadge(row.status)">{{ row.status }}</span>
        </template>
        <template #cell-stats="{ row }">
          <div class="text-sm">
            Sent: {{ row.stats.sent }} / Delivered: {{ row.stats.delivered }} / Opened: {{ row.stats.opened }}
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Campaign Detail Modal (or slide-over) -->
    <TransitionRoot as="template" :show="selectedCampaign !== null">
      <Dialog as="div" class="relative z-10" @close="selectedCampaign = null">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel class="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out">
                <div class="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
                  <div class="px-4 py-6 sm:px-6">
                    <div class="flex items-start justify-between">
                      <DialogTitle class="text-lg font-medium text-gray-900 dark:text-white">Campaign Details</DialogTitle>
                      <button @click="selectedCampaign = null" class="ml-3">
                        <XMarkIcon class="h-6 w-6 text-gray-400" />
                      </button>
                    </div>
                    <div class="mt-6 space-y-6" v-if="selectedCampaign">
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Name</dt>
                        <dd class="mt-1 text-sm">{{ selectedCampaign.name }}</dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Audience</dt>
                        <dd class="mt-1 text-sm">{{ selectedCampaign.recipientType }}</dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Channels</dt>
                        <dd class="mt-1 text-sm">{{ selectedCampaign.channels.join(', ') }}</dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Message Preview</dt>
                        <dd class="mt-1 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                          <p class="font-medium">{{ selectedCampaign.subject }}</p>
                          <p class="mt-1">{{ selectedCampaign.body }}</p>
                        </dd>
                      </div>
                      <div>
                        <dt class="text-sm font-medium text-gray-500">Statistics</dt>
                        <dd class="mt-1 space-y-2">
                          <div class="grid grid-cols-3 gap-2">
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              <span class="block text-xs text-gray-500">Sent</span>
                              <span class="text-lg font-medium">{{ selectedCampaign.stats.sent }}</span>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              <span class="block text-xs text-gray-500">Delivered</span>
                              <span class="text-lg font-medium">{{ selectedCampaign.stats.delivered }}</span>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              <span class="block text-xs text-gray-500">Opened</span>
                              <span class="text-lg font-medium">{{ selectedCampaign.stats.opened }}</span>
                            </div>
                          </div>
                        </dd>
                      </div>
                      <div class="flex space-x-3">
                        <button class="btn-secondary">Resend to Failed</button>
                        <button class="btn-secondary">Export Recipients</button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

const campaigns = ref([])
const loading = ref(false)
const selectedCampaign = ref(null)

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'recipientType', label: 'Audience' },
  { key: 'createdAt', label: 'Created', format: (val: string) => new Date(val).toLocaleDateString() },
  { key: 'sentAt', label: 'Sent', format: (val: string) => val ? new Date(val).toLocaleString() : 'Draft' },
  { key: 'status', label: 'Status' },
  { key: 'stats', label: 'Delivery Stats' }
]

const fetchCampaigns = async () => {
  loading.value = true
  const { data } = await useApi('/admin/campaigns')
  campaigns.value = data.value
  loading.value = false
}

const statusBadge = (status: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'draft': return `${base} bg-gray-100 text-gray-800`
    case 'sending': return `${base} bg-yellow-100 text-yellow-800`
    case 'sent': return `${base} bg-green-100 text-green-800`
    case 'failed': return `${base} bg-red-100 text-red-800`
    default: return `${base} bg-gray-100 text-gray-800`
  }
}

const openCampaignDetail = (campaign: any) => {
  selectedCampaign.value = campaign
}

onMounted(() => {
  fetchCampaigns()
})
</script>