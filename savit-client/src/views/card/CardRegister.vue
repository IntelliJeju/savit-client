<template>
  <Teleport to="#header-content">
    <span>카드 등록</span>
  </Teleport>

  <div class="min-h-screen bg-app-light-gray my-4">
    <!-- 로딩 화면 -->
    <SplashScreen v-if="loading || isProcessingTransactions" />

    <div class="max-w-sm mx-auto">
      <!-- 카드 이미지 인식 섹션 -->
      <CardComponent class="mb-5">
        <div class="space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-bold text-slate-800 mb-2">간편 등록</h3>
            <p class="text-sm text-slate-600 mb-4">
              카드 이미지를 촬영하여 자동으로 정보를 입력하세요
            </p>
          </div>

          <CardCamera
            :show-camera="showCamera"
            :captured-image="capturedImage"
            :is-starting-camera="isStartingCamera"
            :is-processing-o-c-r="isProcessingOCR"
            :ocr-result="ocrResult"
            :video-element="videoElement"
            @start="startCamera"
            @capture="capturePhoto"
            @retake="handleRetakePhoto"
            @upload="handleGalleryUpload"
            @process-o-c-r="handleOCRProcess"
          />
        </div>
      </CardComponent>

      <!-- 구분선 (OCR 결과가 있을 때만 표시) -->
      <div v-if="!ocrResult" class="flex items-center my-6">
        <div class="flex-1 border-t border-slate-300"></div>
        <span class="px-4 text-sm text-slate-500">또는 직접 입력</span>
        <div class="flex-1 border-t border-slate-300"></div>
      </div>

      <!-- 카드 등록 폼 -->
      <CardForm
        :card-data="cardData"
        :card-number="cardNumber"
        :organization="organization"
        @submit="handleRegisterCard"
        @update:organization="updateCardData('organization', $event)"
        @update:login-id="updateCardData('loginId', $event)"
        @update:login-pw="updateCardData('loginPw', $event)"
        @update:birth-date="updateCardData('birthDate', $event)"
        @card-number-input="handleCardNumberInput"
        @password-input="handlePasswordInput"
      />

      <!-- 안내 메시지 -->
      <CardComponent>
        <div class="flex items-start gap-3">
          <div>
            <p class="text-sm text-slate-700 font-medium mb-1">안전한 정보 보호</p>
            <p class="text-xs text-slate-600">
              입력하신 모든 정보는 암호화되어 안전하게 보관됩니다.
            </p>
          </div>
        </div>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards'
import CardComponent from '@/components/card/CardComponent.vue'
import SplashScreen from '@/components/loading/SplashScreen.vue'
import CardCamera from '@/components/card/CardCamera.vue'
import CardForm from '@/components/card/CardForm.vue'
import { storeToRefs } from 'pinia'
import { useCamera } from '@/composables/card/useCamera'
import { useOCR } from '@/composables/card/useOCR'
import { useCardForm } from '@/composables/card/useCardForm'

const cardsStore = useCardsStore()
const { loading } = storeToRefs(cardsStore)

// 컴포저블 사용
const {
  showCamera,
  capturedImage,
  videoElement,
  isStartingCamera,
  startCamera,
  capturePhoto,
  retakePhoto,
  stopCamera,
  setCapturedImage,
} = useCamera()

const { imagePreview, ocrResult, isProcessingOCR, handleImageUpload, processOCR, clearOCRResult } =
  useOCR()

const {
  cardData,
  cardNumber,
  isProcessingTransactions,
  handleCardNumberInput,
  handlePasswordInput,
  fillFormFromOCR,
  handleRegisterCard,
  organization,
} = useCardForm()

// 서버 OCR 처리 함수
const handleOCRProcess = async () => {
  try {
    const result = await processOCR(capturedImage.value || undefined)
    if (result) {
      fillFormFromOCR(result)
    }
  } catch (error) {
    console.error('OCR 처리 실패:', error)
    alert('카드 정보 인식에 실패했습니다. 다시 시도해주세요.')
  }
}

// 다시 촬영 함수 래핑 (OCR 결과 초기화 포함)
const handleRetakePhoto = async () => {
  clearOCRResult()
  await retakePhoto()
}

// 컴포넌트 초기화
onMounted(async () => {
  // 페이지 로드 시 자동으로 카메라 시작
  await startCamera()
})

// 갤러리에서 이미지 업로드 처리
const handleGalleryUpload = (event: Event) => {
  handleImageUpload(event)

  // imagePreview가 설정되면 capturedImage에도 복사
  const checkImagePreview = () => {
    if (imagePreview.value) {
      setCapturedImage(imagePreview.value)
      stopCamera()
    } else {
      // 100ms 후 다시 확인 (비동기 처리를 위해)
      setTimeout(checkImagePreview, 100)
    }
  }

  checkImagePreview()
}

// 카드 데이터 업데이트 헬퍼 함수
const updateCardData = (field: keyof typeof cardData.value, value: string) => {
  ;(cardData.value as any)[field] = value
}
</script>

<style scoped>
/* 포커스 효과 */
.focus\:ring-emerald-500:focus {
  --tw-ring-color: rgb(16 185 129);
}

.focus\:border-emerald-500:focus {
  border-color: rgb(16 185 129);
}

/* 전환 효과 */
.transition-colors {
  transition:
    background-color 0.15s ease-in-out,
    color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

/* 활성 상태 효과 */
.active\:scale-95:active {
  transform: scale(0.95);
}

/* 그림자 효과 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
