<template>
  <div class="flex items-center justify-center h-screen">
    <p>Redirecting…</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

// Each role lands on its own first page (middleware/auth.global.ts does the
// same for anyone who arrives here signed in).
const authStore = useAuthStore()
navigateTo(authStore.isAuthenticated ? authStore.homePath : '/auth/login', { replace: true })
</script>
