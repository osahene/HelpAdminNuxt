<template>
  <div>
    <!-- Shield icon -->
    <div class="flex justify-center mb-6">
      <div class="relative">
        <div class="h-14 w-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
          <ShieldCheckIcon class="h-7 w-7 text-indigo-400" />
        </div>
        <span class="absolute -top-1 -right-1 flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-50"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 items-center justify-center">
            <LockClosedIcon class="h-2.5 w-2.5 text-white" />
          </span>
        </span>
      </div>
    </div>

    <div class="text-center mb-7">
      <h1 class="text-xl font-bold text-white">Admin Authorization</h1>
      <p class="text-sm text-slate-400 mt-2 leading-relaxed">
        A security PIN has been sent to the<br />
        <span class="text-indigo-400 font-medium">primary admin email address</span>
      </p>
      <p class="text-xs text-slate-500 mt-2">Enter it below to confirm your identity</p>
    </div>

    <!-- Success -->
    <div v-if="success" class="auth-success mb-5">
      <CheckCircleIcon class="h-4 w-4 shrink-0 text-emerald-400" />
      Authorization confirmed! Redirecting to login…
    </div>

    <!-- Error -->
    <div v-if="error" class="auth-error mb-5">
      <ExclamationCircleIcon class="h-4 w-4 shrink-0 text-red-400" />
      {{ error }}
    </div>

    <!-- Attempts warning -->
    <div v-if="attemptsLeft < 3 && attemptsLeft > 0" class="mb-5" style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:10px;font-size:13px;color:#fcd34d;">
      <ExclamationTriangleIcon class="h-4 w-4 shrink-0" />
      {{ attemptsLeft }} attempt{{ attemptsLeft !== 1 ? 's' : '' }} remaining before lockout
    </div>

    <!-- 6-digit OTP inputs -->
    <div class="flex justify-center gap-2.5 mb-6">
      <input
        v-for="(_, i) in digits"
        :key="i"
        :ref="el => { if (el) inputRefs[i] = el as HTMLInputElement }"
        v-model="digits[i]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="otp-input"
        :class="{ 'otp-input--filled': digits[i], 'otp-input--error': error, 'otp-input--indigo': true }"
        @input="onInput(i, $event)"
        @keydown="onKeydown(i, $event)"
        @paste="onPaste($event)"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </div>

    <!-- Timer -->
    <p class="text-center text-xs text-slate-500 mb-5">
      <template v-if="resendCountdown > 0">
        PIN expires in <span class="font-mono text-slate-400 font-medium">{{ formatCountdown }}</span>
      </template>
      <template v-else>
        PIN expired.
        <button @click="resendPin" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors ml-1" :disabled="resending">
          {{ resending ? 'Sending…' : 'Send new PIN' }}
        </button>
      </template>
    </p>

    <button
      @click="verifyPin"
      class="auth-btn"
      :class="{ 'auth-btn--indigo': true }"
      :disabled="loading || code.length < 6 || attemptsLeft === 0"
    >
      <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <ShieldCheckIcon v-else class="h-4 w-4" />
      {{ loading ? 'Verifying…' : 'Authorize Access' }}
    </button>

    <div class="mt-6 pt-5 border-t border-white/5 flex items-start gap-3">
      <InformationCircleIcon class="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
      <p class="text-xs text-slate-500 leading-relaxed">
        This step confirms that your account has been approved by an existing admin. The PIN is valid for <strong class="text-slate-400">10 minutes</strong> and is single-use.
      </p>
    </div>

    <p class="text-center text-sm text-slate-500 mt-4">
      <NuxtLink to="/auth/login" class="text-slate-400 hover:text-white transition-colors">← Back to login</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  ShieldCheckIcon, LockClosedIcon, CheckCircleIcon,
  ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const authStore = useAuthStore()
const email = computed(() => route.query.email as string || '')

const digits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const loading = ref(false)
const resending = ref(false)
const error = ref('')
const success = ref(false)
const attemptsLeft = ref(5)
const resendCountdown = ref(600) // 10 minutes

const code = computed(() => digits.value.join(''))

const formatCountdown = computed(() => {
  const m = Math.floor(resendCountdown.value / 60)
  const s = resendCountdown.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  startCountdown()
  nextTick(() => inputRefs.value[0]?.focus())
})
onUnmounted(() => clearInterval(timer))

const startCountdown = () => {
  resendCountdown.value = 600
  clearInterval(timer)
  timer = setInterval(() => {
    if (resendCountdown.value > 0) resendCountdown.value--
    else clearInterval(timer)
  }, 1000)
}

const onInput = (i: number, e: Event) => {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  digits.value[i] = val.slice(-1)
  if (val && i < 5) nextTick(() => inputRefs.value[i + 1]?.focus())
  error.value = ''
  if (code.value.length === 6) verifyPin()
}

const onKeydown = (i: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) inputRefs.value[i - 1]?.focus()
  if (e.key === 'ArrowLeft' && i > 0) inputRefs.value[i - 1]?.focus()
  if (e.key === 'ArrowRight' && i < 5) inputRefs.value[i + 1]?.focus()
}

const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || ''
  pasted.split('').forEach((char, i) => { digits.value[i] = char })
  nextTick(() => inputRefs.value[Math.min(pasted.length, 5)]?.focus())
  if (pasted.length === 6) verifyPin()
}

const verifyPin = async () => {
  if (code.value.length < 6 || loading.value || attemptsLeft.value === 0) return
  loading.value = true
  error.value = ''
  try {
    await authStore.verifyAuthPin({ email: email.value, pin: code.value })
    success.value = true
    setTimeout(() => navigateTo('/auth/login'), 1200)
  } catch (err: any) {
    attemptsLeft.value = Math.max(0, attemptsLeft.value - 1)
    error.value = err?.response?.data?.error || 'Invalid PIN. Please try again.'
    digits.value = ['', '', '', '', '', '']
    nextTick(() => inputRefs.value[0]?.focus())
  } finally {
    loading.value = false
  }
}

const resendPin = async () => {
  resending.value = true
  try {
    await authStore.resendAuthPin(email.value)
    attemptsLeft.value = 5
    startCountdown()
    error.value = ''
  } finally {
    resending.value = false
  }
}
</script>

<!-- <style scoped>
.otp-input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  caret-color: #818cf8;
}
.otp-input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
  background: rgba(129, 140, 248, 0.05);
}
.otp-input--filled {
  border-color: rgba(129, 140, 248, 0.5);
  background: rgba(129, 140, 248, 0.08);
}
.otp-input--error {
  border-color: rgba(239, 68, 68, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

/* Override the sky-blue btn with indigo for this page */

</style> -->