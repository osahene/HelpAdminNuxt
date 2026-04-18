<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Emergency Contacts</h1>
      <button class="btn-primary">Export CSV</button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input v-model="filters.search" type="text" placeholder="Search by name, phone, email" class="block w-full rounded-md border-gray-300 text-sm" />
        <select v-model="filters.status" class="block w-full rounded-md border-gray-300 text-sm">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select v-model="filters.isUser" class="block w-full rounded-md border-gray-300 text-sm">
          <option value="">All</option>
          <option value="true">Registered Users</option>
          <option value="false">Non-Users</option>
        </select>
        <button @click="applyFilters" class="btn-primary">Filter</button>
      </div>
    </div>

    <!-- Contacts Table -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <DataTable
        :columns="columns"
        :data="contacts"
        :loading="loading"
        @row-click="(row) => navigateTo(`/contacts/${row.id}`)"
      >
        <template #cell-status="{ row }">
          <span :class="statusBadge(row.status)">{{ row.status }}</span>
        </template>
        <template #cell-isUser="{ row }">
          <span v-if="row.isUser" class="text-green-600">Yes</span>
          <span v-else class="text-gray-500">No</span>
        </template>
        <template #cell-actions="{ row }">
          <button
            v-if="!row.isUser"
            @click.stop="inviteContact(row)"
            class="text-primary-600 hover:underline text-sm"
          >
            Invite to Register
          </button>
          <button
            v-if="row.status === 'pending'"
            @click.stop="resendInvite(row.id)"
            class="ml-2 text-blue-600 hover:underline text-sm"
          >
            Resend
          </button>
        </template>
      </DataTable>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t flex items-center justify-between">
        <p class="text-sm text-gray-700 dark:text-gray-300">
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} results
        </p>
        <Pagination
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          @change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DataTable from '~/components/admin/DataTable.vue'
import Pagination from '~/components/ui/Pagination.vue'

definePageMeta({ layout: 'admin'})

const filters = reactive({
  search: '',
  status: '',
  isUser: ''
})

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  from: 0,
  to: 0,
  total: 0
})

const contacts = ref([])
const loading = ref(false)

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'isUser', label: 'Registered User' },
  { key: 'userName', label: 'Added By' },
  { key: 'createdAt', label: 'Added On', format: (val: string) => new Date(val).toLocaleDateString() },
  { key: 'actions', label: '' }
]

const fetchContacts = async () => {
  loading.value = true
  const { data } = await useApi('/admin/contacts', {
    params: {
      ...filters,
      page: pagination.value.currentPage
    }
  })
  contacts.value = data.value.data
  pagination.value = data.value.pagination
  loading.value = false
}

const applyFilters = () => {
  pagination.value.currentPage = 1
  fetchContacts()
}

const changePage = (page: number) => {
  pagination.value.currentPage = page
  fetchContacts()
}

const statusBadge = (status: string) => {
  const base = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'approved': return `${base} bg-green-100 text-green-800`
    case 'pending': return `${base} bg-yellow-100 text-yellow-800`
    case 'rejected': return `${base} bg-red-100 text-red-800`
    default: return `${base} bg-gray-100 text-gray-800`
  }
}

const inviteContact = async (contact: any) => {
  await useApi(`/admin/contacts/${contact.id}/invite`, { method: 'POST' })
  // Show toast
}

const resendInvite = async (contactId: string) => {
  await useApi(`/admin/contacts/${contactId}/resend-invite`, { method: 'POST' })
}

onMounted(() => {
  fetchContacts()
})
</script>