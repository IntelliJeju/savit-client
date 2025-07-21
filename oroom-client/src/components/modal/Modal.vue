<template>
  <div
    v-if="show"
    class="modal-overlay fixed w-full h-full bg-[#00000055] flex justify-center items-center"
  >
    <div class="modal-container bg-white w-[70%] min-h-[20vh] rounded-lg flex">
      <div class="modal-header"></div>
      <div class="modal-contet"></div>
      <div class="modal-footer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModalProps {
  show: boolean
  title?: string
}

const props = withDefaults(defineProps<ModalProps>(), {
  show: false,
  title: '',
})
</script>

<style scoped></style>
