<!-- <template>
  <Teleport to="#header-content">
    <span>챌린지 상세 정보</span>
  </Teleport>

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
              <div class="pt-2 text-xl font-semibold">{{ selectedDeposit.toLocaleString() }}원</div>
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
import { processPayment } from '@/service/payment/payment'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const challengeStore = useChallengeStore()
const isProcessingPayment = ref(false)

// 선택된 예치금 (임시로 5000원, 실제로는 예치금 선택 기능에서 받아와야 함)
const selectedDeposit = ref(5000)

const { fetchAvailChallengeDetail } = challengeStore
const { loading, getChallengeById } = storeToRefs(challengeStore)

const challenge = computed(() => getChallengeById.value(id))

const handleJoinChallenge = async () => {
  if (!challenge.value) return

  try {
    isProcessingPayment.value = true

    console.log('결제 시작:', {
      desiredAmount: selectedDeposit.value,
    })

    // 새로운 통합 결제 프로세스 사용
    const result = await processPayment(id, selectedDeposit.value)

    if (result.success) {
      console.log(`결제 및 참가 완료 (${result.method} 방식):`, result.data)
      alert('결제가 완료되어 챌린지에 참가되었습니다!')

      // 챌린지 목록 새로고침 (참가 상태 반영)
      await fetchAvailChallengeDetail(id)

      router.push('/challenge/main')
    } else {
      throw new Error('결제 처리에 실패했습니다.')
    }
  } catch (error) {
    console.error('결제 실패:', error)
    alert(error instanceof Error ? error.message : '결제에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isProcessingPayment.value = false
  }
}

onMounted(async () => {
  await fetchAvailChallengeDetail(id)
})
</script>

<style scoped></style> -->

ChallengeDetail.vue

<template>
  <Teleport to="#header-content">
    <span>챌린지 상세 정보</span>
  </Teleport>

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
                <span class="text-slate-500">{{ challenge.totalParticipants }} / </span>
                <span class="text-app-green text-xl font-semibold">
                  {{ challenge.joinedParticipants }}명
                </span>
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

            <!-- ✅ 나의 예치금: 드롭다운 -->
            <div>
              <div>나의 예치금</div>
              <div class="pt-2 relative w-full max-w-[240px]">
                <button class="w-full flex items-center justify-between" @click="isOpen = !isOpen">
                  <span class="text-xl font-semibold">
                    {{ selectedAmount.toLocaleString() }}원
                  </span>
                  <v-icon name="oi-triangle-down" class="w-8" />
                </button>

                <div
                  v-if="isOpen"
                  class="absolute mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-10"
                >
                  <ul class="py-1 max-h-60 overflow-auto">
                    <li
                      v-for="price in amountOptions"
                      :key="price"
                      @click="selectAmount(price)"
                      class="px-3 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                    >
                      <span>{{ price.toLocaleString() }}원</span>
                      <span v-if="selectedAmount === price" class="text-app-green">●</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <!-- /나의 예치금 -->
          </div>
        </CardComponent>
      </div>

      <div class="detail-rule">
        <CardComponent>
          <div class="detail-rule-title text-[1.5rem] font-bold">챌린지 설명</div>
          <div class="detail-rule-info flex items-center gap-2 mt-6 font-normal">
            <div class="w-2 h-2 bg-app-green rounded-full" />
            {{ challenge.description }}
          </div>
        </CardComponent>
      </div>
    </div>

    <div class="detail-button py-4">
      <ButtonItem
        text="챌린지 참여하기"
        :disabled="challenge.eligibility === 1 || isProcessingPayment || !selectedAmount"
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
  initPayment,
  requestPayment,
  processPaymentCompletion,
  type PaymentResponse,
} from '@/service/payment/payment'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const challengeStore = useChallengeStore()
const { fetchAvailChallengeDetail, fetchParticipateChallenges } = challengeStore
const { loading, getChallengeById } = storeToRefs(challengeStore)

const challenge = computed(() => getChallengeById.value(id))

/** 드롭다운: 5,000 ~ 25,000 (5,000 단위) */
const amountOptions = [5000, 10000, 15000, 20000, 25000]
const selectedAmount = ref<number>(5000) // 기본 5,000원
const isOpen = ref(false)

const selectAmount = (price: number) => {
  selectedAmount.value = price
  isOpen.value = false
}

const isProcessingPayment = ref(false)

const handleJoinChallenge = async () => {
  if (!challenge.value || !selectedAmount.value) return

  try {
    isProcessingPayment.value = true

    // 0) 결제 초기화: 사용자가 고른 예치금 전달
    const { merchantUid, amount } = await initPayment({
      challengeId: id,
      desiredAmount: selectedAmount.value,
    })

    // 1) PortOne 결제 요청: 서버 확정값 사용
    const paymentData = {
      pg: 'html5_inicis', // 필요 시 UI로 선택 가능
      pay_method: 'card',
      merchant_uid: merchantUid, // ★ 서버 값
      name: `${challenge.value.title} 참가비`,
      amount, // ★ 서버 값
      buyer_name: '사용자',
      buyer_email: 'user@example.com',
      m_redirect_url: `${window.location.origin}/challenge/payment/callback`,
    }

    const paymentResult: PaymentResponse = await requestPayment(paymentData)

    // 2) 완료 처리 (웹훅 우선, verify 폴백)
    await processPaymentCompletion(paymentResult.imp_uid, paymentResult.merchant_uid)

    // 3) 화면 반영: 참여 목록/상세 갱신 (백엔드가 웹훅/verify에서 DB 처리함)
    await Promise.all([
      fetchParticipateChallenges(), // 내 참여 목록 갱신
      fetchAvailChallengeDetail(id, { force: true }), // 상세 재조회(필요 시)
    ])

    alert('챌린지 참가가 완료되었습니다!')
    router.push('/challenge/main')
  } catch (error: any) {
    console.error('결제 실패:', error)
    alert(error?.message ?? '결제에 실패했습니다.')
  } finally {
    isProcessingPayment.value = false
  }
}

onMounted(async () => {
  await fetchAvailChallengeDetail(id)
})
</script>

<style scoped></style>
