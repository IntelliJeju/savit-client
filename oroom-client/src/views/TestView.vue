<template>
  <ButtonItem />
</template>

<script setup>
import ButtonItem from '../components/ButtonItem.vue'

const handleClick = (event) => {
  console.log('버튼 클릭됨!')
}
</script>

<style scoped></style>
