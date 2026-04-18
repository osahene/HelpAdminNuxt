<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Marketing Campaigns</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">View and manage all outreach campaigns</p>
      </div>
      <NuxtLink
        to="/marketing"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
      >
        <PlusIcon class="h-4 w-4" />
        New Campaign
      </NuxtLink>
    </div>

    <!-- Summary stats row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in summaryStats" :key="stat.label" class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm px-4 py-3.5">
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
        <p class="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Campaigns table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <MegaphoneIcon class="h-4 w-4 text-sky-500" />
          <span class="text-sm font-semibold text-slate-900 dark:text-white">All Campaigns</span>
          <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ campaigns.length }}
          </span>
        </div>
      </div>

      <DataTable
        :columns="columns"
        :data="campaigns"
        :loading="loading"
        @row-click="openCampaignDetail"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="h-7 w-7 rounded-lg bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
              <MegaphoneIcon class="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ row.name }}</span>
          </div>
        </template>

        <template #cell-channels="{ row }">
          <div class="flex gap-1">
            <span v-if="row.channels?.includes('sms')" class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded">SMS</span>
            <span v-if="row.channels?.includes('email')" class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded">Email</span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <span :class="statusBadge(row.status)">
            <span :class="statusDot(row.status)" class="inline-block h-1.5 w-1.5 rounded-full mr-1.5"></span>
            {{ row.status }}
          </span>
        </template>

        <template #cell-stats="{ row }">
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span><span class="font-medium text-slate-700 dark:text-slate-300">{{ row.stats?.sent ?? 0 }}</span> sent</span>
            <span><span class="font-medium text-emerald-600">{{ row.stats?.delivered ?? 0 }}</span> delivered</span>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- ===== SLIDE-OVER DETAIL PANEL ===== -->
    <TransitionRoot as="template" :show="selectedCampaign !== null">
      <Dialog as="div" class="relative z-50" @close="selectedCampaign = null">
        <!-- Backdrop -->
        <TransitionChild
          as="template"
          enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-16">
              <TransitionChild
                as="template"
                enter="transform transition ease-in-out duration-300"
                enter-from="translate-x-full"
                enter-to="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leave-from="translate-x-0"
                leave-to="translate-x-full"
              >
                <DialogPanel class="pointer-events-auto w-screen max-w-md">
                  <div class="flex h-full flex-col bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto">

                    <!-- Panel header -->
                    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <div class="h-7 w-7 rounded-lg bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                          <MegaphoneIcon class="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <DialogTitle class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {{ selectedCampaign?.name }}
                        </DialogTitle>
                        <span v-if="selectedCampaign?.status" :class="statusBadge(selectedCampaign.status)">
                          {{ selectedCampaign.status }}
                        </span>
                      </div>
                      <button
                        @click="selectedCampaign = null"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <XMarkIcon class="h-5 w-5" />
                      </button>
                    </div>

                    <div v-if="selectedCampaign" class="flex-1 px-5 py-5 space-y-6">

                      <!-- Meta info -->
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Audience</dt>
                          <dd class="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{{ audienceLabel(selectedCampaign.recipientType) }}</dd>
                        </div>
                        <div>
                          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Channels</dt>
                          <dd class="mt-1 flex gap-1">
                            <span v-for="ch in selectedCampaign.channels" :key="ch"
                              class="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded uppercase">
                              {{ ch }}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Sent At</dt>
                          <dd class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ selectedCampaign.sentAt ? new Date(selectedCampaign.sentAt).toLocaleString() : 'Draft' }}</dd>
                        </div>
                        <div>
                          <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Created</dt>
                          <dd class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ selectedCampaign.createdAt ? new Date(selectedCampaign.createdAt).toLocaleDateString() : '—' }}</dd>
                        </div>
                      </div>

                      <!-- Delivery stats -->
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Delivery Statistics</p>
                        <div class="grid grid-cols-3 gap-2">
                          <div class="bg-slate-50 dark:bg-slate-700/60 rounded-xl p-3 text-center">
                            <span class="block text-xs text-slate-500 dark:text-slate-400 mb-1">Sent</span>
                            <span class="text-xl font-bold font-mono text-slate-900 dark:text-white">{{ selectedCampaign.stats?.sent ?? 0 }}</span>
                          </div>
                          <div class="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                            <span class="block text-xs text-emerald-600 dark:text-emerald-400 mb-1">Delivered</span>
                            <span class="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{{ selectedCampaign.stats?.delivered ?? 0 }}</span>
                          </div>
                          <div class="bg-sky-50 dark:bg-sky-500/10 rounded-xl p-3 text-center">
                            <span class="block text-xs text-sky-600 dark:text-sky-400 mb-1">Opened</span>
                            <span class="text-xl font-bold font-mono text-sky-700 dark:text-sky-300">{{ selectedCampaign.stats?.opened ?? 0 }}</span>
                          </div>
                        </div>

                        <!-- Delivery rate bar -->
                        <div v-if="selectedCampaign.stats?.sent" class="mt-3">
                          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Delivery rate</span>
                            <span class="font-mono font-medium">{{ deliveryRate }}%</span>
                          </div>
                          <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: `${deliveryRate}%` }"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Message preview -->
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Message Preview</p>
                        <div class="bg-slate-50 dark:bg-slate-700/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-600/60">
                          <p v-if="selectedCampaign.subject" class="text-sm font-semibold text-slate-900 dark:text-white mb-2">{{ selectedCampaign.subject }}</p>
                          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ selectedCampaign.body }}</p>
                        </div>
                      </div>

                    </div>

                    <!-- Panel footer -->
                    <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                      <button class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all">
                        <ArrowPathIcon class="h-3.5 w-3.5" />
                        Resend Failed
                      </button>
                      <button class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all">
                        <ArrowDownTrayIcon class="h-3.5 w-3.5" />
                        Export
                      </button>
                    </div>

                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon, PlusIcon, MegaphoneIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

const campaigns = ref<any[]>([])
const loading = ref(false)
const selectedCampaign = ref<any>(null)

const columns = [
  { key: 'name', label: 'Campaign' },
  { key: 'channels', label: 'Channels' },
  { key: 'recipientType', label: 'Audience', format: (v: string) => audienceLabel(v) },
  { key: 'sentAt', label: 'Sent', format: (v: string) => v ? new Date(v).toLocaleDateString() : 'Draft' },
  { key: 'status', label: 'Status' },
  { key: 'stats', label: 'Delivery' },
]

const summaryStats = computed(() => [
  { label: 'Total Campaigns', value: campaigns.value.length },
  { label: 'Total Sent', value: campaigns.value.reduce((a, c) => a + (c.stats?.sent ?? 0), 0).toLocaleString() },
  { label: 'Total Delivered', value: campaigns.value.reduce((a, c) => a + (c.stats?.delivered ?? 0), 0).toLocaleString() },
  { label: 'Avg Open Rate', value: campaigns.value.length ? `${Math.round(campaigns.value.reduce((a, c) => a + (c.stats?.opened ?? 0) / Math.max(c.stats?.sent ?? 1, 1) * 100, 0) / campaigns.value.length)}%` : '—' },
])

const deliveryRate = computed(() => {
  const s = selectedCampaign.value
  if (!s?.stats?.sent) return 0
  return Math.round((s.stats.delivered / s.stats.sent) * 100)
})

const audienceLabel = (v: string) => ({
  all_users: 'All Users',
  low_contacts: 'Low Coverage Users',
  non_user_contacts: 'Unregistered Contacts',
  custom: 'Custom Filter',
}[v] ?? v)

const statusConfig: Record<string, { pill: string; dot: string }> = {
  draft:   { pill: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700', dot: 'bg-slate-400' },
  sending: { pill: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  sent:    { pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  failed:  { pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10', dot: 'bg-red-500' },
}
const statusBadge = (s: string) =>
  `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusConfig[s]?.pill ?? 'text-slate-600 bg-slate-100'}`
const statusDot = (s: string) => statusConfig[s]?.dot ?? 'bg-slate-400'

const openCampaignDetail = (campaign: any) => {
  selectedCampaign.value = campaign
}

const fetchCampaigns = async () => {
  loading.value = true
  const { data } = await useApi('/admin/campaigns')
  campaigns.value = data.value ?? []
  loading.value = false
}

onMounted(fetchCampaigns)
</script>