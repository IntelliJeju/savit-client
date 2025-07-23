<!-- <input-field v-model="" placeholder="" type="" /> -->
<template>
  <div>
    <input
      :value="props.modelValue"
      :placeholder="placeholder"
      :type="type"
      @input="onInput"
      class="input-field border-b py-1 px-2 w-full"
    />
  </div>
</template>

<script setup lang="ts">
interface inputProps {
  modelValue: string | number
  placeholder: string
  type: string
}

const props = defineProps<inputProps>()
const emit = defineEmits(['update:modelValue'])

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped></style>
