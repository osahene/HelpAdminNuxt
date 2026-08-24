<template>
  <div>
    <!-- Icon -->
    <div class="flex justify-center mb-6">
      <div class="h-14 w-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
        <KeyIcon class="h-7 w-7 text-sky-400" />
      </div>
    </div>

    <div class="text-center mb-7">
      <h1 class="text-xl font-bold text-white">Forgot your password?</h1>
      <p class="text-sm text-slate-400 mt-2 leading-relaxed">
        Enter the email on your admin account and we'll send<br />
        you a link to reset your password.
      </p>
    </div>

    <!-- Success state — shown regardless of whether the email exists, so the
         response can never be used to enumerate registered admin accounts. -->
    <div v-if="submitted">
      <div class="auth-success mb-5">
        <CheckCircleIcon class="h-4 w-4 shrink-0 text-emerald-400" />
        If an account exists for that email, a reset link is on its way.
      </div>
      <p class="text-xs text-slate-500 leading-relaxed text-center">
        Check your inbox (and spam folder). The link expires in 30 minutes.
      </p>
      <p class="text-center text-sm text-slate-500 mt-6">
        <NuxtLink to="/auth/login" class="text-slate-400 hover:text-white transition-colors">← Back to login</NuxtLink>
      </p>
    </div>

    <template v-else>
      <!-- Error -->
      <div v-if="error" class="auth-error mb-5">
        <ExclamationCircleIcon class="h-4 w-4 shrink-0 text-red-400" />
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="auth-label">Email Address</label>
          <div class="relative">
            <EnvelopeIcon class="field-icon" />
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="admin@teenbytetechlab.com"
              class="auth-input has-icon"
            />
          </div>
        </div>

        <button type="submit" class="auth-btn mt-2" :disabled="loading || !email">
          <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <PaperAirplaneIcon v-else class="h-4 w-4" />
          {{ loading ? 'Sending…' : 'Send Reset Link' }}
        </button>
      </form>

      <p class="text-center text-sm text-slate-500 mt-6">
        <NuxtLink to="/auth/login" class="text-slate-400 hover:text-white transition-colors">← Back to login</NuxtLink>
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  KeyIcon, EnvelopeIcon, PaperAirplaneIcon,
  CheckCircleIcon, ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth' })

const { $api } = useNuxtApp()

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!email.value) return
  loading.value = true
  error.value = ''
  try {
    await $api.forgotPassword({ email: email.value })
    // Always show the generic success state — the backend deliberately
    // returns the same response whether or not the account exists, so the
    // frontend must not use a failure branch here to reveal the difference.
    submitted.value = true
  } catch (err: any) {
    if (err?.response?.status === 429) {
      error.value = 'Too many attempts. Please wait a while before trying again.'
    } else {
      error.value = 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
