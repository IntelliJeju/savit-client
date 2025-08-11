<template>
  <div v-if="!loading && challenge" class="detail-page h-full grid grid-rows-[1fr_auto]">
    <div class="detail-contents overflow-auto flex flex-col gap-4 py-4">
      <div class="detail-info">
        <CardComponent>
          <div class="detail-info-category">
            <LabelItem>{{ challenge.categoryName }}</LabelItem>
          </div>
          <div class="detail-info-title mt-4 text-[1.5rem] font-bold">{{ challenge.title }}</div>
          <div class="detail-info-due text-xs text-slate-500 font-medium">
            {{ challenge.startDate }} ~ {{ challenge.endDate }}
          </div>
          <div class="detail-info-grid grid grid-cols-2 grid-rows-2 gap-8 font-medium pt-6">
            <div>
              <div>인원수</div>
              <div class="pt-2">
                <span class="text-slate-500">{{ challenge.totalParticipants }} / </span
                ><span class="text-app-green text-xl font-semibold"
                  >{{ challenge.joinedParticipants }}명</span
                >
              </div>
            </div>
            <div>
              <div>기간</div>
              <div class="pt-2 text-app-green text-xl font-semibold">
                {{ challenge.durationWeeks * 7 }}일
              </div>
            </div>
            <div>
              <div>총 예치금</div>
              <div class="pt-2 text-app-green text-xl font-semibold">
                {{ challenge.entryFee.toLocaleString() }}원
              </div>
            </div>
            <div>
              <div>나의 예치금</div>
              <div class="pt-2 text-xl font-semibold">{{ (5000).toLocaleString() }}원</div>
            </div>
          </div>
        </CardComponent>
      </div>
      <div class="detail-rule">
        <card-component>
          <div class="detail-rule-title text-[1.5rem] font-bold">챌린지 설명</div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-normal">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            {{ challenge.description }}
          </div>
        </card-component>
      </div>
    </div>
    <div class="detail-button py-4">
      <ButtonItem
        text="챌린지 참여하기"
        :disabled="challenge.eligibility === 1 || isProcessingPayment"
        @click="handleJoinChallenge"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonItem from '@/components/button/ButtonItem.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import LabelItem from '@/components/label/LabelItem.vue'
import { useChallengeStore } from '@/stores/challenges.ts'
import {
  requestPayment,
  processPaymentCompletion,
  completeChallenge,
  generateMerchantUid,
} from '@/services/payment'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const challengeStore = useChallengeStore()
const isProcessingPayment = ref(false)

const { fetchAvailChallengeDetail } = challengeStore
const { loading, getChallengeById } = storeToRefs(challengeStore)

const challenge = computed(() => getChallengeById.value(id))

const handleJoinChallenge = async () => {
  if (!challenge.value) return

  try {
    isProcessingPayment.value = true

    // SDK 로드 상태 확인
    console.log('IMP 객체 확인:', window.IMP)
    if (!window.IMP) {
      alert('결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // 결제 데이터 준비
    const paymentData = {
      pg: 'kakaopay.TC0ONETIME', // PG사 설정
      pay_method: 'card', // 결제 수단
      merchant_uid: generateMerchantUid(id), // 고유 주문번호
      name: `${challenge.value.title} 참가비`, // 결제명
      amount: 10, // 결제 금액
      buyer_name: '사용자', // 실제 사용자 정보로 변경
      buyer_email: 'user@example.com', // 실제 사용자 이메일로 변경
      m_redirect_url: `${window.location.origin}/challenge/payment/callback`, // 필수: 모바일 결제 완료 후 리디렉션 URL
      custom_data: {
        challengeId: 2,
        userId: 1,
      },
    }

    console.log('결제 요청 데이터:', paymentData)

    // 결제 요청
    const paymentResult = await requestPayment(paymentData)

    // 결제 완료 처리 (웹훅 우선, fallback으로 verify)
    await processPaymentCompletion(paymentResult.imp_uid, paymentResult.merchant_uid)

    // 챌린지 참가 처리
    await completeChallenge(id, {
      imp_uid: paymentResult.imp_uid,
      merchant_uid: paymentResult.merchant_uid,
      paid_amount: paymentResult.paid_amount,
    })

    alert('챌린지 참가가 완료되었습니다!')
    router.push('/challenge/main')
  } catch (error) {
    console.error('결제 실패:', error)
    alert(error instanceof Error ? error.message : '결제에 실패했습니다.')
  } finally {
    isProcessingPayment.value = false
  }
}

onMounted(async () => {
  await fetchAvailChallengeDetail(id)
})
</script>

<style scoped></style>
