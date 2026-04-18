<template>
  <NuxtLink
    :to="to"
    class="sidebar-link group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150"
    :class="isActive ? 'sidebar-link--active' : 'sidebar-link--idle'"
  >
    <!-- Icon -->
    <component
      :is="resolvedIcon"
      class="h-4.5 w-4.5 shrink-0 transition-colors"
      :class="isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'"
      style="height: 18px; width: 18px;"
    />

    <!-- Label (and optional slot for badge) -->
    <span
      class="flex-1 flex items-center transition-colors"
      :class="isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'"
    >
      {{ slotLabel }}
    </span>

    <!-- Default slot (e.g. badges) -->
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'

const props = defineProps<{
  to: string
  icon: keyof typeof HeroIcons
}>()

// Support child text nodes for label
const slots = useSlots()
const slotLabel = computed(() => {
  const defaultSlot = slots.default?.()
  if (!defaultSlot) return ''
  const firstNode = defaultSlot[0]
  // If slot has only text, use it; otherwise the label comes from the route
  if (typeof firstNode?.children === 'string') {
    return firstNode.children
  }
  const parts = props.to.split('/').filter(Boolean)
  return parts.length ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Home'
})

const resolvedIcon = computed(() => HeroIcons[props.icon])

const route = useRoute()
const isActive = computed(() => route.path === props.to || route.path.startsWith(props.to + '/'))
</script>

<style scoped>
.sidebar-link {
  position: relative;
}

.sidebar-link--active {
  background: rgba(14, 165, 233, 0.12);
  color: white;
  box-shadow: inset 0 0 0 1px rgba(14, 165, 233, 0.2);
}

.sidebar-link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: #0ea5e9;
  border-radius: 0 2px 2px 0;
}

.sidebar-link--idle {
  color: #94a3b8;
}

.sidebar-link--idle:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>