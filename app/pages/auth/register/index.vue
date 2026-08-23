<template>
  <div>
    <div class="mb-6">
      <h1 class="text-xl font-bold text-white">Create an account</h1>
      <p class="text-sm text-slate-400 mt-1">Register to access the admin portal</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="auth-error mb-5">
      <ExclamationCircleIcon class="h-4 w-4 shrink-0 text-red-400" />
      {{ error }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- Name row -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="auth-label">First Name</label>
          <div class="relative">
            <UserIcon class="field-icon" />
            <input
              v-model="form.firstName"
              type="text"
              required
              autocomplete="given-name"
              placeholder="Kofi"
              class="auth-input has-icon"
            />
          </div>
        </div>
        <div>
          <label class="auth-label">Last Name</label>
          <div class="relative">
            <UserIcon class="field-icon" />
            <input
              v-model="form.lastName"
              type="text"
              required
              autocomplete="family-name"
              placeholder="Asante"
              class="auth-input has-icon"
            />
          </div>
        </div>
      </div>

      <!-- Role -->
      <div>
        <label class="auth-label">Role</label>
        <div class="relative">
          <BriefcaseIcon class="field-icon" />
          <select v-model="form.role" required class="auth-input has-icon appearance-none cursor-pointer">
            <option value="" disabled>Select your role</option>
            <option class="text-slate-400" value="super_admin">Super Admin</option>
            <option class="text-slate-400" value="admin">Admin</option>
            <option class="text-slate-400" value="moderator">Moderator</option>
            <option class="text-slate-400" value="analyst">Analyst</option>
          </select>
          <ChevronDownIcon class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

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
            placeholder="Enter your institutional email"
            class="auth-input has-icon"
          />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="auth-label">Password</label>
        <div class="relative">
          <LockClosedIcon class="field-icon" />
          <input
            v-model="form.password"
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
        <!-- Password strength -->
        <div v-if="form.password" class="mt-2 flex gap-1">
          <div v-for="i in 4" :key="i" :class="['flex-1 h-1 rounded-full transition-all', i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700']" />
        </div>
        <p v-if="form.password" :class="['text-xs mt-1', passwordStrength.textColor]">{{ passwordStrength.label }}</p>
      </div>

      <!-- Confirm Password -->
      <div>
        <label class="auth-label">Confirm Password</label>
        <div class="relative">
          <LockClosedIcon class="field-icon" />
          <input
            v-model="form.confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            required
            autocomplete="new-password"
            placeholder="Repeat your password"
            class="auth-input has-icon"
            :class="form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500/60' : ''"
            style="padding-right: 44px;"
          />
          <button type="button" @click="showConfirm = !showConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            <EyeSlashIcon v-if="showConfirm" class="h-4 w-4" />
            <EyeIcon v-else class="h-4 w-4" />
          </button>
        </div>
        <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-xs text-red-400 mt-1">Passwords do not match</p>
      </div>

      <!-- Submit -->
      <button type="submit" class="auth-btn mt-2" :disabled="loading || !isFormValid">
        <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span>{{ loading ? 'Creating account…' : 'Create Account' }}</span>
      </button>
    </form>

    <p class="text-center text-sm text-slate-500 mt-6">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-sky-400 hover:text-sky-300 font-medium transition-colors">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon,
  BriefcaseIcon, ChevronDownIcon, ExclamationCircleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

const form = reactive({
  firstName: '',
  lastName: '',
  role: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const error = ref('')

const isFormValid = computed(() =>
  form.firstName &&
  form.lastName &&
  form.role &&
  form.email &&
  form.password.length >= 8 &&
  form.password === form.confirmPassword
)

const passwordStrength = computed(() => {
  const p = form.password
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

const handleRegister = async () => {
  if (!isFormValid.value) return
  loading.value = true
  error.value = ''
  try {
    await authStore.register({
      first_name: form.firstName,
      last_name: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      role: form.role,
      email: form.email,
      password: form.password,
      confirm_password: form.confirmPassword,
    })
    // Registration sends a verification email — redirect to confirm page
    navigateTo(`/auth/verifyEmail?email=${encodeURIComponent(form.email)}`)
  } catch (err: any) {
    const data = err?.response?.data
    error.value =
      data?.error || data?.detail || data?.non_field_errors?.[0] ||
      data?.email?.[0] || data?.confirm_password?.[0] ||
      'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>