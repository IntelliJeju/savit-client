<template>
  <div
    v-if="show"
    class="modal-overlay fixed w-full h-full bg-[#00000055] flex justify-center items-center"
    @click="handleClose"
  >
    <div
      class="modal-container bg-white w-[70%] min-h-[20vh] rounded-lg flex flex-col p-4 pt-6 gap-4"
      @click.stop
    >
      <div class="modal-contet flex-1">
        <slot></slot>
      </div>
      <div class="modal-footer flex justify-end gap-4">
        <button class="close-button bg-[#F7F5FF] px-3 py-2 rounded-[0.75rem]" @click="handleClose">
          닫기
        </button>
        <button
          class="confirm-button bg-[#028174] px-3 py-2 rounded-[0.75rem] text-white"
          @click="handleConfirm"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModalProps {
  show: boolean
  title?: string
}

interface ModalEmits {
  'update:show': [value: boolean]
  close: []
  confirm: []
}

const props = withDefaults(defineProps<ModalProps>(), {
  show: false,
  title: '',
})

const emit = defineEmits<ModalEmits>()

const handleConfirm = () => {
  emit('update:show', false)
  emit('confirm')
}

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<style scoped></style>
