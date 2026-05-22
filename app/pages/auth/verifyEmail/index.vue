<template>
  <div>
    <!-- Icon -->
    <div class="flex justify-center mb-6">
      <div class="h-14 w-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
        <EnvelopeOpenIcon class="h-7 w-7 text-sky-400" />
      </div>
    </div>

    <div class="text-center mb-7">
      <h1 class="text-xl font-bold text-white">Check your email</h1>
      <p class="text-sm text-slate-400 mt-2 leading-relaxed">
        We sent a 6-digit verification code to<br />
        <span class="text-sky-400 font-medium">{{ email || 'your email address' }}</span>
      </p>
    </div>

    <!-- Success -->
    <div v-if="success" class="auth-success mb-5">
      <CheckCircleIcon class="h-4 w-4 shrink-0 text-emerald-400" />
      Email verified successfully! Redirecting…
    </div>

    <!-- Error -->
    <div v-if="error" class="auth-error mb-5">
      <ExclamationCircleIcon class="h-4 w-4 shrink-0 text-red-400" />
      {{ error }}
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
        :class="{ 'otp-input--filled': digits[i], 'otp-input--error': error }"
        @input="onInput(i, $event)"
        @keydown="onKeydown(i, $event)"
        @paste="onPaste($event)"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </div>

    <!-- Timer -->
    <p class="text-center text-xs text-slate-500 mb-5">
      <template v-if="resendCountdown > 0">
        Resend code in <span class="font-mono text-slate-400 font-medium">{{ resendCountdown }}s</span>
      </template>
      <template v-else>
        Didn't receive it?
        <button @click="resendCode" class="text-sky-400 hover:text-sky-300 font-medium transition-colors ml-1" :disabled="resending">
          {{ resending ? 'Sending…' : 'Resend code' }}
        </button>
      </template>
    </p>

    <button
      @click="verifyCode"
      class="auth-btn"
      :disabled="loading || code.length < 6"
    >
      <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {{ loading ? 'Verifying…' : 'Verify Email' }}
    </button>

    <p class="text-center text-sm text-slate-500 mt-5">
      <NuxtLink to="/auth/register" class="text-slate-400 hover:text-white transition-colors">← Back to registration</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  EnvelopeOpenIcon, CheckCircleIcon, ExclamationCircleIcon
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
const resendCountdown = ref(60)

const code = computed(() => digits.value.join(''))

// Countdown timer
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  startCountdown()
  // Auto-focus first input
  nextTick(() => inputRefs.value[0]?.focus())
})
onUnmounted(() => clearInterval(timer))

const startCountdown = () => {
  resendCountdown.value = 60
  clearInterval(timer)
  timer = setInterval(() => {
    if (resendCountdown.value > 0) resendCountdown.value--
    else clearInterval(timer)
  }, 1000)
}

const onInput = (i: number, e: Event) => {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  digits.value[i] = val.slice(-1)
  if (val && i < 5) {
    nextTick(() => inputRefs.value[i + 1]?.focus())
  }
  error.value = ''
  // Auto-submit when all filled
  if (code.value.length === 6) verifyCode()
}

const onKeydown = (i: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) {
    inputRefs.value[i - 1]?.focus()
  }
  if (e.key === 'ArrowLeft' && i > 0) inputRefs.value[i - 1]?.focus()
  if (e.key === 'ArrowRight' && i < 5) inputRefs.value[i + 1]?.focus()
}

const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || ''
  pasted.split('').forEach((char, i) => { digits.value[i] = char })
  nextTick(() => inputRefs.value[Math.min(pasted.length, 5)]?.focus())
  if (pasted.length === 6) verifyCode()
}

const verifyCode = async () => {
  if (code.value.length < 6 || loading.value) return
  loading.value = true
  error.value = ''
  try {
    await authStore.verifyEmail({ email: email.value, code: code.value })
    success.value = true
    setTimeout(() => navigateTo(`/auth-pin?email=${encodeURIComponent(email.value)}`), 1200)
  } catch (err: any) {
    error.value = err?.data?.message || 'Invalid code. Please check and try again.'
    // Shake and clear on wrong code
    digits.value = ['', '', '', '', '', '']
    nextTick(() => inputRefs.value[0]?.focus())
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  resending.value = true
  try {
    await authStore.resendEmailVerification(email.value)
    startCountdown()
  } finally {
    resending.value = false
  }
}
</script>

