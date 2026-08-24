<template>
  <div>
    <div class="mb-7">
      <h1 class="text-xl font-bold text-white">Welcome back</h1>
      <p class="text-sm text-slate-400 mt-1">Sign in to your admin account</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="auth-error mb-5">
      <ExclamationCircleIcon class="h-4 w-4 shrink-0 text-red-400" />
      {{ error }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="auth-label">Email Address</label>
        <div class="relative">
          <EnvelopeIcon class="field-icon" />
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            placeholder="admin@teenbytetechlab.com"
            class="auth-input has-icon"
          />
        </div>
      </div>

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="auth-label" style="margin-bottom:0">Password</label>
          <NuxtLink to="/auth/forgotPassword" class="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium">
            Forgot password?
          </NuxtLink>
        </div>
        <div class="relative">
          <LockClosedIcon class="field-icon" />
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="Your password"
            class="auth-input has-icon"
            style="padding-right: 44px;"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <EyeSlashIcon v-if="showPassword" class="h-4 w-4" />
            <EyeIcon v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Remember me -->
      <label class="flex items-center gap-2.5 cursor-pointer group">
        <input v-model="form.remember" type="checkbox" class="sr-only peer" />
        <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-400 rounded-full peer peer-checked:bg-sky-500 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shrink-0"></div>
        <span class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me for 30 days</span>
      </label>

      <!-- Submit -->
      <button type="submit" class="auth-btn mt-2" :disabled="loading">
        <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <ArrowRightOnRectangleIcon v-else class="h-4 w-4" />
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>

    <!-- Divider -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-white/6"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="px-3 text-xs text-slate-600" style="background: rgba(15, 23, 42, 0.85);">New to Help OO Help Admin?</span>
      </div>
    </div>

    <NuxtLink
      to="/auth/register"
      class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20 transition-all"
    >
      <UserPlusIcon class="h-4 w-4" />
      Create an account
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import {
  EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  ArrowRightOnRectangleIcon, ExclamationCircleIcon, UserPlusIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import auth from '~/layouts/auth.vue'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember,
    })
    // Route guard will redirect to the originally requested page or dashboard
    const redirect = useRoute().query.redirect as string
    navigateTo(redirect || '/dashboard')
  } catch (err: any) {
    // AdminLoginSerializer raises all validation failures (bad credentials,
    // unverified email, not-yet-authorised) as HTTP 400 with the reason
    // under "error" — REST_FRAMEWORK.NON_FIELD_ERRORS_KEY is set to 'error'
    // in settings.py, not DRF's default 'non_field_errors'. It's a list.
    const data = err?.response?.data
    const message = Array.isArray(data?.error) ? data.error[0] : (data?.error || data?.detail)
    if (err?.response?.status === 429) {
      error.value = 'Too many attempts. Please wait a few minutes before trying again.'
    } else {
      error.value = message || 'Sign in failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>