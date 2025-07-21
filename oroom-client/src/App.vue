<template>
  <div>
    <!-- 기본 버튼 -->
    <Button @click="handleClick1" text="기본 버튼1" />
  </div>

  <div>
    <!-- 기본 버튼 어두운 버전 -->
    <Button variant="dark" @click="handleClick2" text="기본 버튼2" />
  </div>
</template>
<script setup lang="ts"></script>
<style scoped></style>
