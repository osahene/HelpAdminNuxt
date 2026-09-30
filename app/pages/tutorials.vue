<template>
  <div class="space-y-5">

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Video Tutorials</h1>
        <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          What the mobile app's Tutorials screen fetches — publish or edit here, no app release needed.
        </p>
      </div>
      <button
        @click="openCreate"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
      >
        <PlusIcon class="h-4 w-4" />
        Add Tutorial
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/60 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <PlayCircleIcon class="h-4 w-4 text-sky-500" />
          <span class="text-sm font-semibold text-slate-900 dark:text-white">Tutorials</span>
          <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
            {{ tutorials.length }}
          </span>
        </div>
      </div>

      <DataTable :columns="columns" :data="tutorials" :loading="loading" @row-click="openEdit">
        <template #cell-title="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center shrink-0 overflow-hidden">
              <img v-if="row.thumbnail" :src="row.thumbnail" class="h-full w-full object-cover" alt="" />
              <PlayCircleIcon v-else class="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <span class="font-medium text-slate-800 dark:text-slate-200">{{ row.title }}</span>
          </div>
        </template>
        <template #cell-category="{ row }">
          <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 capitalize">
            {{ row.category }}
          </span>
        </template>
        <template #cell-is_published="{ row }">
          <span v-if="row.is_published" class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon class="h-3.5 w-3.5" /> Published
          </span>
          <span v-else class="text-xs font-medium text-slate-400">Draft</span>
        </template>
        <template #cell-actions="{ row }">
          <button
            @click.stop="deleteTutorial(row)"
            class="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </template>
      </DataTable>

      <div v-if="!loading && tutorials.length === 0" class="px-5 py-10 text-center text-sm text-slate-400">
        No tutorials yet — add one to get it in front of app users immediately.
      </div>
    </div>

    <TransitionRoot as="template" :show="editorOpen">
      <Dialog as="div" class="relative z-50" @close="editorOpen = false">
        <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-16">
              <TransitionChild as="template" enter="transform transition ease-in-out duration-300" enter-from="translate-x-full"
                enter-to="translate-x-0" leave="transform transition ease-in-out duration-300" leave-from="translate-x-0"
                leave-to="translate-x-full">
                <DialogPanel class="pointer-events-auto w-screen max-w-md">
                  <form @submit.prevent="save" class="flex h-full flex-col bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto">

                    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <DialogTitle class="text-sm font-semibold text-slate-900 dark:text-white">
                        {{ editingId ? 'Edit Tutorial' : 'Add Tutorial' }}
                      </DialogTitle>
                      <button type="button" @click="editorOpen = false" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <XMarkIcon class="h-5 w-5" />
                      </button>
                    </div>

                    <div class="flex-1 px-5 py-5 space-y-4">
                      <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Title</label>
                        <input v-model="form.title" required type="text"
                          class="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400" />
                      </div>
                      <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Description</label>
                        <textarea v-model="form.description" rows="2"
                          class="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400"></textarea>
                      </div>
                      <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
                        <select v-model="form.category"
                          class="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400">
                          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                        </select>
                      </div>

                      <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Video Source</label>
                        <div class="flex gap-2 mt-1 mb-2">
                          <button type="button" @click="videoMode = 'file'"
                            :class="['flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border', videoMode === 'file' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600']">
                            Upload File
                          </button>
                          <button type="button" @click="videoMode = 'url'"
                            :class="['flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border', videoMode === 'url' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600']">
                            External URL
                          </button>
                        </div>
                        <input v-if="videoMode === 'file'" type="file" accept="video/*" @change="onVideoFileChange"
                          class="w-full text-xs text-slate-600 dark:text-slate-300" />
                        <input v-else v-model="form.video_url" type="url" placeholder="https://youtube.com/watch?v=..."
                          class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400" />
                        <p v-if="editingId && !videoFile && !form.video_url" class="text-[11px] text-slate-400 mt-1">
                          Leave blank to keep the existing video.
                        </p>
                      </div>

                      <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Thumbnail (optional)</label>
                        <input type="file" accept="image/*" @change="onThumbnailChange" class="w-full text-xs text-slate-600 dark:text-slate-300 mt-1" />
                      </div>

                      <div>
                        <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Order</label>
                        <input v-model.number="form.order" type="number"
                          class="mt-1 w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700/60 border border-slate-200/80 dark:border-slate-600/60 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400" />
                        <p class="text-[11px] text-slate-400 mt-1">Lower numbers show first.</p>
                      </div>

                      <label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <input v-model="form.is_published" type="checkbox" class="rounded border-slate-300" />
                        Published (visible in the app)
                      </label>
                    </div>

                    <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                      <button
                        type="submit"
                        :disabled="saving"
                        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white shadow-sm shadow-sky-500/20 transition-all active:scale-95"
                      >
                        {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Tutorial') }}
                      </button>
                    </div>

                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { XMarkIcon, PlusIcon, PlayCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import DataTable from '~/components/admin/DataTable.vue'

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

const categories = ['fire', 'health', 'flood', 'robbery', 'violence', 'other']

const tutorials = ref<any[]>([])
const loading = ref(false)
const editorOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const videoMode = ref<'file' | 'url'>('file')
const videoFile = ref<File | null>(null)
const thumbnailFile = ref<File | null>(null)

const form = reactive({
  title: '',
  description: '',
  category: 'other',
  video_url: '',
  order: 0,
  is_published: true,
})

const columns = [
  { key: 'title', label: 'Tutorial' },
  { key: 'category', label: 'Category' },
  { key: 'order', label: 'Order' },
  { key: 'is_published', label: 'Status' },
  { key: 'actions', label: '' },
]

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.category = 'other'
  form.video_url = ''
  form.order = 0
  form.is_published = true
  videoMode.value = 'file'
  videoFile.value = null
  thumbnailFile.value = null
}

const openCreate = () => {
  editingId.value = null
  resetForm()
  editorOpen.value = true
}

const openEdit = (row: any) => {
  editingId.value = row.id
  form.title = row.title
  form.description = row.description || ''
  form.category = row.category
  form.video_url = ''
  form.order = row.order ?? 0
  form.is_published = row.is_published
  videoMode.value = 'url'
  videoFile.value = null
  thumbnailFile.value = null
  editorOpen.value = true
}

const onVideoFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  videoFile.value = target.files?.[0] ?? null
}

const onThumbnailChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  thumbnailFile.value = target.files?.[0] ?? null
}

const fetchTutorials = async () => {
  loading.value = true
  try {
    const response = await $api.tutorials()
    tutorials.value = response.data?.results || response.data || []
  } catch (error) {
    console.error('Error loading tutorials:', error)
    tutorials.value = []
    if (process.client) {
      useToast().add({ title: 'Failed to load tutorials', color: 'error' })
    }
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const data = new FormData()
    data.append('title', form.title)
    data.append('description', form.description)
    data.append('category', form.category)
    data.append('order', String(form.order))
    data.append('is_published', String(form.is_published))
    if (videoMode.value === 'file' && videoFile.value) {
      data.append('video_file', videoFile.value)
    } else if (videoMode.value === 'url' && form.video_url) {
      data.append('video_url', form.video_url)
    }
    if (thumbnailFile.value) data.append('thumbnail', thumbnailFile.value)

    if (editingId.value) {
      await $api.tutorialsUpdate(editingId.value, data)
    } else {
      await $api.tutorialsCreate(data)
    }
    editorOpen.value = false
    await fetchTutorials()
  } catch (error) {
    console.error('Error saving tutorial:', error)
    useToast().add({
      title: 'Failed to save tutorial',
      description: 'Check that a video file or URL was provided.',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

const deleteTutorial = async (row: any) => {
  if (!confirm(`Delete "${row.title}"? This can't be undone.`)) return
  try {
    await $api.tutorialsDelete(row.id)
    tutorials.value = tutorials.value.filter(t => t.id !== row.id)
  } catch (error) {
    console.error('Error deleting tutorial:', error)
    useToast().add({ title: 'Failed to delete tutorial', color: 'error' })
  }
}

onMounted(fetchTutorials)
</script>
