<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Team</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Staff who can sign in to this portal. Only you can add people or change what they can do.
        </p>
      </div>
      <button
        @click="openInvite"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
      >
        <UserPlusIcon class="h-4 w-4" />
        Add team member
      </button>
    </div>

    <!-- What each role can do -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div
        v-for="role in ROLES"
        :key="role.value"
        class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 p-4"
      >
        <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ role.label }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ role.description }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Loading team…</div>
      <div v-else-if="!members.length" class="p-8 text-center text-sm text-slate-500">No team members yet.</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-700">
              <th class="px-5 py-3 font-semibold">Name</th>
              <th class="px-5 py-3 font-semibold">Role</th>
              <th class="px-5 py-3 font-semibold">Status</th>
              <th class="px-5 py-3 font-semibold">Last sign-in</th>
              <th class="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="member in members" :key="member.id">
              <td class="px-5 py-3">
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ member.name }}</p>
                <p class="text-xs text-slate-400">{{ member.email }}</p>
              </td>
              <td class="px-5 py-3">
                <span v-if="member.role === 'super_admin'" class="text-xs font-semibold text-sky-600 dark:text-sky-400">Super Admin</span>
                <select
                  v-else
                  :value="member.role"
                  :disabled="busy === member.id"
                  @change="changeRole(member, ($event.target as HTMLSelectElement).value)"
                  class="py-1.5 px-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option v-for="role in ROLES" :key="role.value" :value="role.value">{{ role.label }}</option>
                </select>
              </td>
              <td class="px-5 py-3">
                <span :class="['inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap', STATUS[member.status].badge]">
                  {{ STATUS[member.status].label }}
                </span>
              </td>
              <td class="px-5 py-3 text-xs text-slate-500">
                {{ member.last_login_at ? new Date(member.last_login_at).toLocaleString() : 'Never' }}
              </td>
              <td class="px-5 py-3">
                <div v-if="member.role !== 'super_admin'" class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="member.status === 'invited'"
                    :disabled="busy === member.id"
                    @click="resendInvite(member)"
                    class="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 px-2 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors disabled:opacity-40"
                  >
                    Resend invite
                  </button>
                  <button
                    :disabled="busy === member.id"
                    @click="openSetPassword(member)"
                    class="text-xs font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
                  >
                    Set password
                  </button>
                  <button
                    :disabled="busy === member.id"
                    @click="toggleAccess(member)"
                    :class="[
                      'text-xs font-medium px-2 py-1 rounded-lg transition-colors disabled:opacity-40',
                      member.is_active
                        ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                        : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                    ]"
                  >
                    {{ member.is_active ? 'Turn off access' : 'Turn on access' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Set a new password for someone (e.g. they forgot theirs) -->
    <div
      v-if="passwordFor"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
      @click.self="passwordFor = null"
    >
      <form @submit.prevent="savePassword" class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Set a new password</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            For {{ passwordFor.name }} ({{ passwordFor.email }}). Their old password stops working, and
            they're emailed that it changed — but not the password.
          </p>
        </div>
        <div v-if="passwordError" class="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300 rounded-lg px-3 py-2">
          {{ passwordError }}
        </div>
        <PasswordFields v-model:password="newPassword.password" v-model:confirm="newPassword.confirm_password" />
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="passwordFor = null"
            class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button type="submit" :disabled="savingPassword || !newPassword.password || newPassword.password !== newPassword.confirm_password"
            class="px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50">
            {{ savingPassword ? 'Saving…' : 'Set password' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Add team member -->
    <div
      v-if="inviteOpen"
      role="dialog"
      aria-modal="true"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
      @click.self="inviteOpen = false"
    >
      <form
        @submit.prevent="sendInvite"
        class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 space-y-4"
      >
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Add team member</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {{ form.emailInvite
              ? "They'll get an email to set their own password. The link works once, for 3 days."
              : 'Set their password now — they can sign in straight away.' }}
          </p>
        </div>

        <div v-if="inviteError" class="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300 rounded-lg px-3 py-2">
          {{ inviteError }}
        </div>

        <div class="grid grid-cols-2 gap-3">
          <label class="block">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">First name</span>
            <input v-model.trim="form.first_name" required class="team-input" />
          </label>
          <label class="block">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Last name</span>
            <input v-model.trim="form.last_name" required class="team-input" />
          </label>
        </div>
        <label class="block">
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Work email</span>
          <input v-model.trim="form.email" type="email" required placeholder="name@teenbytetechlab.com" class="team-input" />
          <span class="text-[11px] text-slate-400">Must be a @teenbytetechlab.com address.</span>
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">Role</span>
          <select v-model="form.role" class="team-input">
            <option v-for="role in ROLES" :key="role.value" :value="role.value">{{ role.label }}</option>
          </select>
          <span class="text-[11px] text-slate-400">{{ ROLES.find(r => r.value === form.role)?.description }}</span>
        </label>

        <PasswordFields
          v-if="!form.emailInvite"
          v-model:password="form.password"
          v-model:confirm="form.confirm_password"
        />
        <label class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
          <input v-model="form.emailInvite" type="checkbox" class="mt-0.5 rounded border-slate-300" />
          <span>Email them a link to choose their own password instead</span>
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="inviteOpen = false"
            class="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button type="submit" :disabled="sending"
            class="px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50">
            {{ sending ? 'Saving…' : form.emailInvite ? 'Send invitation' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlusIcon } from '@heroicons/vue/24/outline'
import PasswordFields from '~/components/admin/PasswordFields.vue'

// Super admin only (backend main_admin.views.TeamListView; the route guard
// keeps everyone else out). Nobody can sign themselves up for the portal.
definePageMeta({ layout: 'admin' })

interface Member {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst'
  is_active: boolean
  status: 'active' | 'invited' | 'deactivated'
  last_login_at: string | null
}

// Must match EmergencySystem/main_admin/roles.py.
const ROLES = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Watches alerts and makes sure they are answered, messages users and contacts (SMS, in-app, push), and manages users and contacts.',
  },
  {
    value: 'moderator',
    label: 'Moderator',
    description: 'Watches alerts and looks after users and contacts, but cannot send messages.',
  },
  {
    value: 'analyst',
    label: 'Analyst',
    description: 'Sees the dashboard, analytics and reports only.',
  },
]

const STATUS: Record<Member['status'], { label: string; badge: string }> = {
  active: { label: 'Active', badge: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10' },
  invited: { label: 'Invited', badge: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10' },
  deactivated: { label: 'Access off', badge: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700' },
}

const { $api } = useNuxtApp()
const toast = useToast()

const members = ref<Member[]>([])
const loading = ref(true)
const busy = ref<string | null>(null)

const inviteOpen = ref(false)
const sending = ref(false)
const inviteError = ref('')
// The super admin sets their password by default; ticking "email them a
// link" sends an invitation to choose their own instead.
const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', role: 'admin',
  password: '', confirm_password: '', emailInvite: false,
}
const form = reactive({ ...EMPTY_FORM })

const passwordFor = ref<Member | null>(null)
const newPassword = reactive({ password: '', confirm_password: '' })
const savingPassword = ref(false)
const passwordError = ref('')

const errorText = (err: any, fallback: string) => {
  const data = err?.response?.data
  const first = (v: any) => (Array.isArray(v) ? v[0] : v)
  return first(data?.error) || first(data?.email) || first(data?.role) || first(data?.password)
    || first(data?.confirm_password) || first(data?.detail) || fallback
}

const load = async () => {
  loading.value = true
  try {
    const response = await $api.team()
    members.value = response?.data || response
  } catch (err) {
    toast.add({ title: 'Could not load the team', description: errorText(err, 'Please try again.'), color: 'error' })
  } finally {
    loading.value = false
  }
}

const replace = (updated: Member) => {
  members.value = members.value.map(m => (m.id === updated.id ? updated : m))
}

const openInvite = () => {
  Object.assign(form, EMPTY_FORM)
  inviteError.value = ''
  inviteOpen.value = true
}

const sendInvite = async () => {
  sending.value = true
  inviteError.value = ''
  try {
    const { emailInvite, ...details } = form
    const payload = emailInvite ? { ...details, password: '', confirm_password: '' } : details
    if (!emailInvite && payload.password !== payload.confirm_password) {
      inviteError.value = 'Passwords do not match.'
      return
    }
    const response = await $api.teamInvite(payload)
    members.value = [...members.value, response?.data || response]
    inviteOpen.value = false
    toast.add(emailInvite
      ? { title: 'Invitation sent', description: `${form.first_name} will get an email to set their password.`, color: 'success' }
      : { title: 'Account created', description: `${form.first_name} can sign in now — give them the password you set.`, color: 'success' })
  } catch (err) {
    inviteError.value = errorText(err, 'Could not add them. Please check the details and try again.')
  } finally {
    sending.value = false
  }
}

const changeRole = async (member: Member, role: string) => {
  busy.value = member.id
  try {
    const response = await $api.teamUpdate(member.id, { role })
    replace(response?.data || response)
    toast.add({ title: 'Role updated', description: `${member.name} is now ${ROLES.find(r => r.value === role)?.label}.`, color: 'success' })
  } catch (err) {
    toast.add({ title: 'Role not changed', description: errorText(err, 'Please try again.'), color: 'error' })
    await load()
  } finally {
    busy.value = null
  }
}

const toggleAccess = async (member: Member) => {
  const turningOff = member.is_active
  if (turningOff && !confirm(`Turn off ${member.name}'s access? They won't be able to sign in until you turn it back on.`)) return
  busy.value = member.id
  try {
    const response = await $api.teamUpdate(member.id, { is_active: !member.is_active })
    replace(response?.data || response)
    toast.add({ title: turningOff ? 'Access turned off' : 'Access turned on', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Not changed', description: errorText(err, 'Please try again.'), color: 'error' })
  } finally {
    busy.value = null
  }
}

const openSetPassword = (member: Member) => {
  Object.assign(newPassword, { password: '', confirm_password: '' })
  passwordError.value = ''
  passwordFor.value = member
}

const savePassword = async () => {
  const member = passwordFor.value
  if (!member) return
  savingPassword.value = true
  passwordError.value = ''
  try {
    const response = await $api.teamUpdate(member.id, { ...newPassword })
    replace(response?.data || response)
    passwordFor.value = null
    toast.add({ title: 'Password set', description: `Give ${member.name} their new password.`, color: 'success' })
  } catch (err) {
    passwordError.value = errorText(err, 'Could not set the password. Please try again.')
  } finally {
    savingPassword.value = false
  }
}

const resendInvite = async (member: Member) => {
  busy.value = member.id
  try {
    await $api.teamResendInvite(member.id)
    toast.add({ title: 'Invitation re-sent', description: `A new link went to ${member.email}.`, color: 'success' })
  } catch (err) {
    toast.add({ title: 'Not sent', description: errorText(err, 'Please try again.'), color: 'error' })
  } finally {
    busy.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.team-input {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.8);
  background: rgb(248 250 252);
  color: rgb(15 23 42);
}
.team-input:focus {
  outline: none;
  box-shadow: 0 0 0 1px rgb(56 189 248);
}
:global(.dark) .team-input {
  background: rgb(51 65 85 / 0.6);
  border-color: rgb(71 85 105 / 0.6);
  color: rgb(226 232 240);
}
</style>
