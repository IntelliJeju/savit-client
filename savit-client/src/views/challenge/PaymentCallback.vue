<template>
  <div class="payment-callback-page flex items-center justify-center h-full">
    <div class="text-center">
      <div v-if="isProcessing" class="loading">
        <div class="text-lg font-medium mb-4">결제 처리 중...</div>
        <div
          class="animate-spin w-8 h-8 border-4 border-app-green border-t-transparent rounded-full mx-auto"
        ></div>
      </div>

      <div v-else-if="paymentResult" class="result">
        <div v-if="paymentResult.success" class="success text-center">
          <div class="text-green-600 text-6xl mb-4">✓</div>
          <h2 class="text-xl font-bold mb-2">결제가 완료되었습니다!</h2>
          <p class="text-gray-600 mb-4">챌린지 참가가 완료되었습니다.</p>
          <button @click="goToChallenge" class="bg-app-green text-white px-6 py-2 rounded-lg">
            챌린지 페이지로 이동
          </button>
        </div>

        <div v-else class="failure text-center">
          <div class="text-red-600 text-6xl mb-4">✕</div>
          <h2 class="text-xl font-bold mb-2">결제가 실패했습니다</h2>
          <p class="text-gray-600 mb-2">{{ paymentResult.error_msg }}</p>
          <button @click="goBack" class="bg-gray-500 text-white px-6 py-2 rounded-lg">
            다시 시도
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isProcessing = ref(true)
const paymentResult = ref<any>(null)

const processPaymentResult = async () => {
  try {
    // URL에서 결제 결과 파라미터 추출
    const { imp_uid, merchant_uid, imp_success, error_code, error_msg } = route.query

    if (!imp_uid || !merchant_uid) {
      throw new Error('결제 정보가 없습니다.')
    }

    // 결제 성공 여부 확인 (서버에서 이미 처리 완료됨)
    if (imp_success === 'true') {
      paymentResult.value = {
        success: true,
        imp_uid,
        merchant_uid,
      }
    } else {
      paymentResult.value = {
        success: false,
        error_msg: error_msg || '결제가 취소되었습니다.',
        error_code,
      }
    }
  } catch (error) {
    console.error('결제 결과 처리 실패:', error)
    paymentResult.value = {
      success: false,
      error_msg: error instanceof Error ? error.message : '결제 결과 처리 중 오류가 발생했습니다.',
    }
  } finally {
    isProcessing.value = false
  }
}

const goToChallenge = () => {
  router.push('/challenge/main')
}

const goBack = () => {
  router.go(-2) // 결제 페이지 이전으로 돌아가기
}

onMounted(() => {
  processPaymentResult()
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
