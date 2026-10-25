<template>
  <div class="space-y-3">
    <label class="block">
      <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Password</span>
      <div class="mt-1 flex gap-2">
        <input
          :value="password"
          @input="emit('update:password', ($event.target as HTMLInputElement).value)"
          :type="show ? 'text' : 'password'"
          autocomplete="new-password"
          required
          minlength="8"
          placeholder="At least 8 characters"
          class="pw-input flex-1"
        />
        <button type="button" @click="show = !show" :title="show ? 'Hide' : 'Show'" class="pw-btn">
          <EyeSlashIcon v-if="show" class="h-4 w-4" />
          <EyeIcon v-else class="h-4 w-4" />
        </button>
        <button type="button" @click="generate" title="Generate a strong password" class="pw-btn">
          <SparklesIcon class="h-4 w-4" />
        </button>
        <button type="button" @click="copy" :disabled="!password" title="Copy" class="pw-btn">
          <CheckIcon v-if="copied" class="h-4 w-4 text-emerald-500" />
          <ClipboardDocumentIcon v-else class="h-4 w-4" />
        </button>
      </div>
    </label>
    <label class="block">
      <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Confirm password</span>
      <input
        :value="confirm"
        @input="emit('update:confirm', ($event.target as HTMLInputElement).value)"
        :type="show ? 'text' : 'password'"
        autocomplete="new-password"
        required
        class="pw-input mt-1 w-full"
        :class="confirm && confirm !== password ? 'pw-input--bad' : ''"
      />
      <span v-if="confirm && confirm !== password" class="text-[11px] text-red-500">Passwords do not match</span>
    </label>
    <p class="text-[11px] text-slate-400 leading-relaxed">
      Give it to them yourself (in person or by phone) — it's never emailed. They can change it later with
      "Forgot password" on the login page.
    </p>
  </div>
</template>

<script setup lang="ts">
import { EyeIcon, EyeSlashIcon, SparklesIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/24/outline'

// Password + confirm boxes for a password the super admin sets for a team
// member (pages/team.vue). The backend applies the real rules (length, not
// common, not like their name) and says why if one is refused.
const props = defineProps<{ password: string; confirm: string }>()
const emit = defineEmits<{ 'update:password': [string]; 'update:confirm': [string] }>()

const show = ref(false)
const copied = ref(false)

// 14 characters with upper, lower, digits and symbols; no look-alikes
// (0/O, 1/l/I) so it can be read out over the phone.
const SETS = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@#$%&*?']
const randomIndex = (n: number) => {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0]! % n
}
const generate = () => {
  const all = SETS.join('')
  const chars = SETS.map(set => set[randomIndex(set.length)]!)
  while (chars.length < 14) chars.push(all[randomIndex(all.length)]!)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
  }
  const value = chars.join('')
  emit('update:password', value)
  emit('update:confirm', value)
  show.value = true
}

const copy = async () => {
  if (!props.password) return
  try {
    await navigator.clipboard.writeText(props.password)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // Clipboard blocked (e.g. not https): the password is still on screen.
  }
}
</script>

<style scoped>
.pw-input {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.8);
  background: rgb(248 250 252);
  color: rgb(15 23 42);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.pw-input:focus {
  outline: none;
  box-shadow: 0 0 0 1px rgb(56 189 248);
}
.pw-input--bad {
  border-color: rgb(239 68 68 / 0.7);
}
.pw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.8);
  color: rgb(100 116 139);
}
.pw-btn:hover:not(:disabled) {
  background: rgb(241 245 249);
}
.pw-btn:disabled {
  opacity: 0.4;
}
:global(.dark) .pw-input {
  background: rgb(51 65 85 / 0.6);
  border-color: rgb(71 85 105 / 0.6);
  color: rgb(226 232 240);
}
:global(.dark) .pw-btn {
  border-color: rgb(71 85 105 / 0.6);
  color: rgb(203 213 225);
}
:global(.dark) .pw-btn:hover:not(:disabled) {
  background: rgb(51 65 85);
}
</style>
