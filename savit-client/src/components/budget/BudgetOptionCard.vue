<template>
  <div class="p-6">
    <ButtonItem 
      :text="title" 
      @click="handleClick"
      :disabled="disabled"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    />
    
    <div class="mt-4 text-app-dark-gray text-sm flex items-center">
      <v-icon name="hi-information-circle" class="w-6 mr-2" />
      <span>{{ description }}</span>
    </div>
    
    <div v-if="warningText" class="mt-4 text-app-dark-gray text-sm flex items-center">
      <v-icon name="hi-information-circle" class="w-6 mr-2" />
      <span class="text-app-red">{{ warningText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonItem from '@/components/button/ButtonItem.vue'

interface Props {
  title: string
  description: string
  disabled?: boolean
  warningText?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>