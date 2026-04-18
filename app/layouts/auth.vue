<template>
  <div class="auth-root min-h-screen flex items-center justify-center p-4">
    <!-- Background grid -->
    <div class="auth-grid" aria-hidden="true" />
    <!-- Glow orbs -->
    <div class="auth-orb auth-orb--1" aria-hidden="true" />
    <div class="auth-orb auth-orb--2" aria-hidden="true" />

    <div class="relative z-10 w-full max-w-md">
      <!-- Brand mark -->
      <div class="flex flex-col items-center mb-8">
        <div class="h-12 w-12 rounded-2xl bg-sky-500 flex items-center justify-center shadow-xl shadow-sky-500/30 mb-4">
          <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
          </svg>
        </div>
        <span class="text-white font-bold text-xl tracking-wide">SafeLink</span>
        <span class="text-sky-400 text-xs font-semibold tracking-widest uppercase mt-0.5">Admin Portal</span>
      </div>

      <!-- Card -->
      <div class="auth-card rounded-2xl p-8 shadow-2xl">
        <slot />
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-600 mt-6">
        © {{ new Date().getFullYear() }} SafeLink Emergency Response System
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// No layout wrapping needed — auth pages use this directly
</script>

<style>

body { font-family: 'Outfit', system-ui, sans-serif; }


</style>