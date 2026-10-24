<template>
  <div>
    <!-- Checking the link -->
    <div v-if="checking" class="flex justify-center py-10">
      <svg class="h-6 w-6 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Bad / expired / used link -->
    <template v-else-if="!invite">
      <div class="flex justify-center mb-6">
        <div class="h-14 w-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
          <ExclamationTriangleIcon class="h-7 w-7 text-red-400" />
        </div>
      </div>
      <div class="text-center mb-2">
        <h1 class="text-xl font-bold text-white">This invitation can't be used</h1>
        <p class="text-sm text-slate-400 mt-2 leading-relaxed">{{ linkError }}</p>
      </div>
      <p class="text-center text-sm text-slate-500 mt-6">
        <NuxtLink to="/auth/login" class="text-slate-400 hover:text-white transition-colors">← Back to login</NuxtLink>
      </p>
    </template>

    <!-- Done -->
    <template v-else-if="success">
      <div class="flex justify-center mb-6">
        <div class="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircleIcon class="h-7 w-7 text-emerald-400" />
        </div>
      </div>
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold text-white">You're all set, {{ invite.first_name }}</h1>
        <p class="text-sm text-slate-400 mt-2 leading-relaxed">
          Your password is set. Sign in with {{ invite.email }} to start.
        </p>
      </div>
      <NuxtLink to="/auth/login" class="auth-btn">
        <ArrowRightOnRectangleIcon class="h-4 w-4" />
        Go to login
      </NuxtLink>
    </template>

    <!-- Set the password -->
    <template v-else>
      <div class="mb-6">
        <h1 class="text-xl font-bold text-white">Welcome, {{ invite.first_name }}</h1>
        <p class="text-sm text-slate-400 mt-1">
          You've been added as <span class="text-sky-300 font-medium">{{ invite.role }}</span>.
          Choose a password for {{ invite.email }}.
        </p>
      </div>

      <div v-if="error" class="auth-error mb-5">
        <ExclamationCircleIcon class="h-4 w-4 shrink-0 text-red-400" />
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="auth-label">Password</label>
          <div class="relative">
            <LockClosedIcon class="field-icon" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Min. 8 characters"
              class="auth-input has-icon"
              style="padding-right: 44px;"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <EyeSlashIcon v-if="showPassword" class="h-4 w-4" />
              <EyeIcon v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="auth-label">Confirm Password</label>
          <div class="relative">
            <LockClosedIcon class="field-icon" />
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Repeat your password"
              class="auth-input has-icon"
              :class="confirmPassword && password !== confirmPassword ? 'border-red-500/60' : ''"
            />
          </div>
          <p v-if="confirmPassword && password !== confirmPassword" class="text-xs text-red-400 mt-1">Passwords do not match</p>
        </div>

        <button type="submit" class="auth-btn mt-2" :disabled="loading || !isFormValid">
          <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ loading ? 'Saving…' : 'Set password' }}</span>
        </button>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon,
  ExclamationCircleIcon, ExclamationTriangleIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

// Reached from the invitation email the super admin's Team page sends
// (backend main_admin.views.AcceptInviteView). The link works once, for 3 days.
definePageMeta({ layout: 'auth' })

const { $api } = useNuxtApp()
const route = useRoute()
const token = (route.query.token as string | undefined) ?? ''

const checking = ref(true)
const invite = ref<{ first_name: string; email: string; role: string } | null>(null)
const linkError = ref('This invitation link is missing or malformed.')

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const success = ref(false)
const error = ref('')

const isFormValid = computed(() => password.value.length >= 8 && password.value === confirmPassword.value)

onMounted(async () => {
  if (!token) {
    checking.value = false
    return
  }
  try {
    const response = await $api.acceptInviteInfo(token)
    invite.value = response?.data || response
  } catch (err: any) {
    linkError.value = err?.response?.data?.error
      || 'This invitation link is invalid, has expired or was already used. Ask your super admin for a new one.'
  } finally {
    checking.value = false
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return
  loading.value = true
  error.value = ''
  try {
    await $api.acceptInvite({ token, password: password.value, confirm_password: confirmPassword.value })
    success.value = true
  } catch (err: any) {
    const data = err?.response?.data
    if (err?.response?.status === 429) {
      error.value = 'Too many attempts. Please wait a while before trying again.'
    } else {
      // Django's password checks come back as a list (too common, too short…).
      const passwordError = Array.isArray(data?.error) ? data.error.join(' ') : null
      error.value = data?.confirm_password?.[0] || data?.password?.[0] || passwordError
        || data?.error || 'Could not set your password. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
