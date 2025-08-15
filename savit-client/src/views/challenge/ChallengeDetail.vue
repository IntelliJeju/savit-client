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

<style scoped></style>
