<template>
  <div class="h-10 w-10 rounded-3xl">
    <div
      class="h-full w-full rounded-3xl flex justify-center items-center text-white font-bold text-lg"
      :class="backgroundClass"
    >
      {{ displayName.charAt(0) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  nickname?: string
  isAnonymous?: boolean
  variant?: 'default' | 'others'
}

const props = withDefaults(defineProps<Props>(), {
  nickname: '익명',
  isAnonymous: false,
  variant: 'default',
})

const displayName = computed(() => {
  return props.nickname || '익명'
})

const backgroundClass = computed(() => {
  if (props.isAnonymous) {
    return 'bg-gradient-to-br from-app-purple to-app-purple/70'
  }
  return props.variant === 'others' ? 'bg-app-green' : 'bg-app-purple'
})
</script>
