<template>
  <div class="space-y-4">
    <!-- 카메라 화면 또는 촬영된 이미지 -->
    <div class="relative">
      <!-- 실시간 카메라 화면 -->
      <div v-if="!capturedImage && showCamera" class="relative">
        <video
          ref="videoElement"
          autoplay
          playsinline
          muted
          class="w-full h-48 object-cover rounded-lg bg-black"
          style="aspect-ratio: 1.59 / 1"
        ></video>

        <!-- 카드 촬영 안내 오버레이 -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-white text-center bg-black bg-opacity-50 px-6 py-3 rounded-lg">
            <div class="text-sm leading-relaxed">
              카드를 화면에<br />
              맞춰 촬영하세요
            </div>
          </div>
        </div>
      </div>

      <!-- 촬영 버튼 (카메라 화면 외부) -->
      <div v-if="!capturedImage && showCamera" class="mt-6">
        <ButtonItem @click="capturePhoto"> 촬영 </ButtonItem>
      </div>

      <!-- 촬영된 이미지 미리보기 -->
      <div v-else-if="capturedImage" class="relative">
        <img
          :src="capturedImage"
          alt="촬영된 카드 이미지"
          class="w-full h-48 object-cover rounded-lg"
          style="aspect-ratio: 1.59 / 1"
        />
        <button
          @click="retakePhoto"
          type="button"
          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg"
        >
          ×
        </button>
      </div>

      <!-- 카메라 로딩 중 -->
      <div
        v-else-if="isStartingCamera"
        class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center"
      >
        <div
          class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
        ></div>
        <p class="text-slate-600 text-sm">카메라를 시작하는 중...</p>
      </div>

      <!-- 카메라 에러 화면 -->
      <div v-else class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
        <p class="text-red-600 text-sm mb-4 font-medium">카메라를 시작할 수 없습니다</p>
        <p class="text-xs text-gray-600 mb-4">브라우저에서 카메라 권한을 허용해주세요</p>
        <button
          @click="startCamera"
          type="button"
          class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          🔄 다시 시도
        </button>
      </div>
    </div>

    <!-- 갤러리에서 선택 옵션 -->
    <div class="text-center">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="$emit('upload', $event)"
        class="hidden"
      />
      <button
        @click="($refs.fileInput as HTMLInputElement)?.click()"
        type="button"
        class="text-sm text-slate-500 underline hover:text-slate-700"
      >
        또는 갤러리에서 선택
      </button>
    </div>

    <!-- OCR 처리 버튼 -->
    <div v-if="capturedImage" class="mt-4">
      <button
        @click="$emit('processOCR')"
        type="button"
        :disabled="isProcessingOCR"
        class="w-full py-3 px-4 bg-app-green text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {{ isProcessingOCR ? '카드 정보 인식 중...' : '카드 정보 인식하기' }}
      </button>
    </div>

    <!-- OCR 결과 표시 -->
    <div v-if="ocrResult" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-green-800">✓ 카드 정보가 인식되었습니다</span>
      </div>
      <div class="text-xs text-green-700">
        <p v-if="ocrResult.cardNumber">카드번호: {{ ocrResult.cardNumber }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { OCRResult, CameraEvents } from '@/types/card.composables'
import ButtonItem from '@/components/button/ButtonItem.vue'

interface Props {
  capturedImage: string | null
  isProcessingOCR: boolean
  ocrResult: OCRResult | null
}

const props = defineProps<Props>()
const emit = defineEmits<CameraEvents>()

// 내부 상태 관리
const videoElement = ref<HTMLVideoElement | null>(null)
const showCamera = ref(false)
const isStartingCamera = ref(false)
const mediaStream = ref<MediaStream | null>(null)

// 카메라 시작
const startCamera = async () => {
  if (isStartingCamera.value) return

  isStartingCamera.value = true

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    })

    mediaStream.value = stream
    showCamera.value = true

    // DOM 업데이트 후 스트림 연결
    await nextTick()

    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }
  } catch (error) {
    console.error('카메라 접근 실패:', error)
    showCamera.value = false
    alert('카메라 접근에 실패했습니다.')
  } finally {
    isStartingCamera.value = false
  }
}

// 카메라 중지
const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => track.stop())
    mediaStream.value = null
  }
  showCamera.value = false
}

// 사진 촬영
const capturePhoto = () => {
  if (!videoElement.value) return

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) return

  canvas.width = videoElement.value.videoWidth
  canvas.height = videoElement.value.videoHeight
  context.drawImage(videoElement.value, 0, 0)

  const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
  stopCamera()

  emit('capture', imageDataUrl)
}

// 다시 촬영
const retakePhoto = () => {
  emit('retake')
  startCamera()
}

// 컴포넌트 마운트 시 카메라 자동 시작
onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    startCamera()
  }, 100)
})

// 언마운트 시 정리
onUnmounted(() => {
  stopCamera()
})
</script>
