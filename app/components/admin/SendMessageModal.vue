<template>
  <div
    v-if="open"
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
    @click.self="emit('close')"
  >
    <form @submit.prevent="send" class="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Message {{ recipientName }}</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Sent straight away on the channels you tick. It also appears under Messages.
        </p>
      </div>

      <div v-if="error" class="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300 rounded-lg px-3 py-2">
        {{ error }}
      </div>

      <fieldset>
        <legend class="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Send as</legend>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="channel in CHANNELS"
            :key="channel.value"
            :class="[
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm cursor-pointer select-none',
              !available(channel.value) ? 'opacity-40 cursor-not-allowed' : '',
              channels.includes(channel.value)
                ? 'border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300',
            ]"
          >
            <input
              type="checkbox"
              class="sr-only"
              :value="channel.value"
              v-model="channels"
              :disabled="!available(channel.value)"
            />
            {{ channel.label }}
          </label>
        </div>
        <p v-if="!hasApp" class="text-[11px] text-slate-400 mt-1.5">
          In-app and push need the Help OO Help app — this contact doesn't have an account, so SMS only.
        </p>
      </fieldset>

      <label v-if="needsTitle" class="block">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Title (shown in-app and on the push)</span>
        <input v-model.trim="subject" required maxlength="120" class="msg-input" placeholder="e.g. Please check on your contact" />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Message</span>
        <textarea v-model.trim="body" required rows="4" maxlength="600" class="msg-input" placeholder="Write your message" />
        <span :class="['text-[11px]', smsParts > 1 ? 'text-amber-600' : 'text-slate-400']">
          {{ body.length }} characters<template v-if="channels.includes('sms')"> · {{ smsParts }} SMS</template>
        </span>
      </label>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" @click="emit('close')"
          class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
          Cancel
        </button>
        <button type="submit" :disabled="sending || !channels.length || !body"
          class="px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50">
          {{ sending ? 'Sending…' : 'Send message' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
// A direct message to ONE user or ONE contact, sent through the same
// pipeline as Messages campaigns (recipient_type single_user/single_contact
// — backend account.tasks.get_campaign_recipients), so it's delivered the
// same way and kept in the Messages history.
const props = defineProps<{
  open: boolean
  recipientType: 'single_user' | 'single_contact'
  recipientId: string
  recipientName: string
  /** Has a Help OO Help account — only then can it go in-app / by push. */
  hasApp: boolean
}>()
const emit = defineEmits<{ close: []; sent: [] }>()

const CHANNELS = [
  { value: 'sms', label: 'SMS' },
  { value: 'in_app', label: 'In-app' },
  { value: 'push', label: 'Push notification' },
] as const

const { $api } = useNuxtApp()
const toast = useToast()

const channels = ref<string[]>([])
const subject = ref('')
const body = ref('')
const sending = ref(false)
const error = ref('')

const available = (channel: string) => channel === 'sms' || props.hasApp
const needsTitle = computed(() => channels.value.some(c => c === 'in_app' || c === 'push'))
// GSM-7 SMS: 160 characters in one, 153 per part after that.
const smsParts = computed(() => (body.value.length <= 160 ? 1 : Math.ceil(body.value.length / 153)))

watch(() => props.open, (open) => {
  if (!open) return
  channels.value = props.hasApp ? ['sms', 'in_app', 'push'] : ['sms']
  subject.value = ''
  body.value = ''
  error.value = ''
})

const send = async () => {
  sending.value = true
  error.value = ''
  try {
    await $api.campaigns({
      name: `Message to ${props.recipientName}`,
      recipient_type: props.recipientType,
      filters: props.recipientType === 'single_user'
        ? { user_id: props.recipientId }
        : { contact_id: props.recipientId },
      channels: channels.value,
      category: 'general',
      subject: subject.value || 'Help OO Help',
      body: body.value,
      status: 'sending',
    })
    toast.add({ title: 'Message sent', description: `On its way to ${props.recipientName}.`, color: 'success' })
    emit('sent')
    emit('close')
  } catch (err: any) {
    const data = err?.response?.data
    const first = (v: any) => (Array.isArray(v) ? v[0] : v)
    error.value = first(data?.filters) || first(data?.channels) || first(data?.body) || first(data?.error)
      || 'Could not send the message. Please try again.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.msg-input {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.8);
  background: rgb(248 250 252);
  color: rgb(15 23 42);
}
.msg-input:focus {
  outline: none;
  box-shadow: 0 0 0 1px rgb(56 189 248);
}
:global(.dark) .msg-input {
  background: rgb(51 65 85 / 0.6);
  border-color: rgb(71 85 105 / 0.6);
  color: rgb(226 232 240);
}
</style>
