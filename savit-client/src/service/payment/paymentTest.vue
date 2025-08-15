<!-- PaymentButton.vue -->
<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

// =========================
// ✅ JWT 자동 첨부용 axios 인스턴스
// =========================
const api = axios.create({
  // baseURL: '/api', // 라우터/프록시 설정에 맞게 쓰고 싶으면 주석 해제
})

// 토큰을 어디서 가져올지 결정 (예: localStorage, pinia, cookie 등)
function getToken() {
  // TODO: 핀리아/스토어 쓴다면 그쪽에서 꺼내도록 변경
  return localStorage.getItem('jwt') || ''
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// =========================
// ✅ .env (Vite): VITE_IAMPORT_CODE=imp03014083
// =========================
const IMP_CODE = import.meta.env.VITE_IAMPORT_CODE

// ===== Props =====
const props = defineProps({
  challengeId: { type: Number, required: true },
  desiredAmount: { type: Number, required: false, default: null },
  userId: { type: Number, required: true },
})

// 상태: idle | loading | success | fail
const state = ref('idle')
const isLoading = computed(() => state.value === 'loading')

// ===== IMP SDK 로딩 & 초기화 =====
function loadIamport() {
  return new Promise((resolve, reject) => {
    if (window.IMP) return resolve(window.IMP)
    const s = document.createElement('script')
    s.src = 'https://cdn.iamport.kr/v1/iamport.js'
    s.onload = () => resolve(window.IMP)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  const IMP = await loadIamport()
  IMP.init(IMP_CODE) // 예: imp03014083
})

// ===== 결제 시작 =====
async function startPayment() {
  try {
    state.value = 'loading'

    // (1) 서버에서 merchantUid/amount 발급 (JWT 자동 첨부됨)
    const { data } = await api.post('/api/payments/init', {
      challengeId: props.challengeId,
      desiredAmount: props.desiredAmount,
    })
    const { merchantUid, amount } = data

    // (2) 아임포트 결제창 호출
    const IMP = window.IMP
    IMP.request_pay(
      {
        pg: 'kakaopay.TC0ONETIME', // 필요에 맞게 변경
        pay_method: 'card',
        merchant_uid: merchantUid, // 서버 생성 값
        name: '챌린지 예치금',
        amount: amount, // 서버 확정 금액
        custom_data: {
          // ✅ 요청대로 객체로 넣음
          challengeId: props.challengeId,
          userId: props.userId,
        },
      },
      async (rsp) => {
        if (!rsp.success) {
          state.value = 'fail'
          return
        }

        const impUid = rsp.imp_uid
        const deadline = Date.now() + 8000
        let confirmed = false

        // (3) 상태 폴링 (웹훅 선처리 기대)
        while (Date.now() < deadline) {
          const s = await api.get('/api/payments/status', {
            params: { merchantUid },
          })
          const status = s.data.status
          if (status === 'SUCCESS') {
            confirmed = true
            break
          }
          if (status === 'FAILED' || status === 'CANCELLED') {
            state.value = 'fail'
            return
          }
          await new Promise((r) => setTimeout(r, 700))
        }

        // (4) 타임아웃 → /verify (JWT 자동 첨부됨)
        if (!confirmed) {
          try {
            await api.post('/api/payments/verify', { impUid, merchantUid })
            const s2 = await api.get('/api/payments/status', {
              params: { merchantUid },
            })
            state.value = s2.data.status === 'SUCCESS' ? 'success' : 'fail'
          } catch {
            state.value = 'fail'
          }
        } else {
          state.value = 'success'
        }
      },
    )
  } catch {
    state.value = 'fail'
  }
}
</script>

<template>
  <button :disabled="isLoading" @click="startPayment">
    <span v-if="!isLoading">결제하기</span>
    <span v-else>결제 진행중...</span>
  </button>

  <div v-if="state === 'success'">결제 성공</div>
  <div v-else-if="state === 'fail'">결제 실패</div>
</template>

<style scoped>
button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
