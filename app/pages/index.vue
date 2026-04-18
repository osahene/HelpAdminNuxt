<template>
  <div class="flex items-center justify-center h-screen">
    <p>Redirecting to dashboard...</p>
  </div>
</template>

<script setup lang="ts">

// Redirect to dashboard
navigateTo('/dashboard', { replace: true })
</script>