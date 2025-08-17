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
          class="w-full h-64 object-cover rounded-lg bg-black"
        ></video>

        <!-- 카드 인식 가이드라인 오버레이 -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="relative">
            <!-- 카드 프레임 -->
            <div
              class="w-60 h-36 border-2 border-white rounded-lg shadow-lg bg-transparent relative"
            >
              <!-- 모서리 표시 -->
              <div
                class="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-green-400 rounded-tl-lg"
              ></div>
              <div
                class="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-green-400 rounded-tr-lg"
              ></div>
              <div
                class="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-green-400 rounded-bl-lg"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-green-400 rounded-br-lg"
              ></div>
            </div>

            <!-- 안내 텍스트 -->
            <div
              class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded"
            >
              카드를 프레임 안에 맞춰주세요
            </div>
          </div>
        </div>

        <!-- 촬영 버튼 -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            @click="$emit('capture')"
            type="button"
            class="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
          </button>
        </div>
      </div>

      <!-- 촬영된 이미지 미리보기 -->
      <div v-else-if="capturedImage" class="relative">
        <img
          :src="capturedImage"
          alt="촬영된 카드 이미지"
          class="w-full h-64 object-cover rounded-lg"
        />
        <button
          @click="$emit('retake')"
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
          @click="$emit('start')"
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
        <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          신뢰도: {{ ocrResult.confidence || 0 }}%
        </span>
      </div>
      <div class="text-xs text-green-700">
        <p v-if="ocrResult.cardNumber">카드번호: {{ ocrResult.cardNumber }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OCRResult, CameraEvents } from '@/types/card.composables'

interface Props {
  showCamera: boolean
  capturedImage: string | null
  isStartingCamera: boolean
  isProcessingOCR: boolean
  ocrResult: OCRResult | null
  videoElement?: HTMLVideoElement | null
}

defineProps<Props>()
defineEmits<CameraEvents>()
</script>
