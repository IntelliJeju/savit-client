<template>
  <div class="py-4 flex items-center gap-2 px-2">
    <button v-if="showBackButton" @click="goBack" class="flex items-center justify-center">
      <v-icon name="hi-chevron-left" scale="1.5"></v-icon>
    </button>
    <span class="text-2xl font-bold"><slot></slot></span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  showBackButton?: boolean
}

defineProps<Props>()

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped></style>
