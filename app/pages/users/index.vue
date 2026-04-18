<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Users</h1>
      <button class="btn-primary">Export</button>
    </div>
    <DataTable
      :columns="columns"
      :data="users"
      :loading="loading"
      @row-click="viewUser"
    >
      <template #cell-actions="{ row }">
        <button
          v-if="row.contactCount < 5"
          @click="sendReminder(row.id)"
          class="text-blue-600 hover:underline"
        >
          Send Reminder
        </button>
      </template>
    </DataTable>
  </div>
</template>