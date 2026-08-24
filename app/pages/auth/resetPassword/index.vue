<template>
  <div>
    <template v-if="!linkPresent">
      <div class="flex justify-center mb-6">
        <div class="h-14 w-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
          <ExclamationTriangleIcon class="h-7 w-7 text-red-400" />
        </div>
      </div>
      <div class="text-center mb-2">
        <h1 class="text-xl font-bold text-white">Invalid reset link</h1>
        <p class="text-sm text-slate-400 mt-2 leading-relaxed">
          This password reset link is missing or malformed. Request a new one below.
        </p>
      </div>
      <NuxtLink to="/auth/forgotPassword" class="auth-btn mt-6">
        <KeyIcon class="h-4 w-4" />
        Request a new link
      </NuxtLink>
      <p class="text-center text-sm text-slate-500 mt-6">
        <NuxtLink to="/auth/login" class="text-slate-400 hover:text-white transition-colors">← Back to login</NuxtLink>
      </p>
    </template>

    <template v-else-if="success">
      <div class="flex justify-center mb-6">
        <div class="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircleIcon class="h-7 w-7 text-emerald-400" />
        </div>
      </div>
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold text-white">Password reset</h1>
        <p class="text-sm text-slate-400 mt-2 leading-relaxed">
          Your password has been changed. Sign in again with your new password.
        </p>
      </div>
      <NuxtLink to="/auth/login" class="auth-btn">
        <ArrowRightOnRectangleIcon class="h-4 w-4" />
        Go to login
      </NuxtLink>
    </template>

    <template v-else>
      <div class="mb-6">
        <h1 class="text-xl font-bold text-white">Set a new password</h1>
        <p class="text-sm text-slate-400 mt-1">Choose a strong password you haven't used before</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="auth-error mb-5">
        <ExclamationCircleIcon class="h-4 w-4 shrink-0 text-red-400" />
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="auth-label">New Password</label>
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
          <div v-if="password" class="mt-2 flex gap-1">
            <div v-for="i in 4" :key="i" :class="['flex-1 h-1 rounded-full transition-all', i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700']" />
          </div>
          <p v-if="password" :class="['text-xs mt-1', passwordStrength.textColor]">{{ passwordStrength.label }}</p>
        </div>

        <div>
          <label class="auth-label">Confirm New Password</label>
          <div class="relative">
            <LockClosedIcon class="field-icon" />
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Repeat your password"
              class="auth-input has-icon"
              :class="confirmPassword && password !== confirmPassword ? 'border-red-500/60' : ''"
              style="padding-right: 44px;"
            />
            <button type="button" @click="showConfirm = !showConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <EyeSlashIcon v-if="showConfirm" class="h-4 w-4" />
              <EyeIcon v-else class="h-4 w-4" />
            </button>
          </div>
          <p v-if="confirmPassword && password !== confirmPassword" class="text-xs text-red-400 mt-1">Passwords do not match</p>
        </div>

        <button type="submit" class="auth-btn mt-2" :disabled="loading || !isFormValid">
          <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>{{ loading ? 'Resetting…' : 'Reset Password' }}</span>
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
  LockClosedIcon, EyeIcon, EyeSlashIcon, KeyIcon,
  CheckCircleIcon, ExclamationCircleIcon, ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'auth' })

const { $api } = useNuxtApp()
const route = useRoute()

// uid/token travel only as far as this page — they're read once here and
// sent in the POST body on submit, never re-displayed or logged.
const uid = route.query.uid as string | undefined
const token = route.query.token as string | undefined
const linkPresent = computed(() => !!uid && !!token)

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const success = ref(false)
const error = ref('')

const isFormValid = computed(() =>
  password.value.length >= 8 && password.value === confirmPassword.value
)

const passwordStrength = computed(() => {
  const p = password.value
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  const levels = [
    { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-400' },
    { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' },
    { score: 3, label: 'Good', color: 'bg-sky-500', textColor: 'text-sky-400' },
    { score: 4, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  ]
  return { score, ...(levels[score - 1] || levels[0]) }
})

const handleSubmit = async () => {
  if (!isFormValid.value || !uid || !token) return
  loading.value = true
  error.value = ''
  try {
    await $api.resetPassword({
      uid,
      token,
      password: password.value,
      confirm_password: confirmPassword.value,
    })
    success.value = true
  } catch (err: any) {
    const data = err?.response?.data
    if (err?.response?.status === 429) {
      error.value = 'Too many attempts. Please wait a while before trying again.'
    } else {
      error.value =
        data?.error || data?.confirm_password?.[0] || data?.password?.[0] ||
        'This reset link is invalid or has expired. Request a new one.'
    }
  } finally {
    loading.value = false
  }
}
</script>
