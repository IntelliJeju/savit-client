<template>
  <Teleport to="#header-content">
    <span>카드 등록</span>
  </Teleport>

  <div class="min-h-screen bg-app-light-gray">
    <div v-if="loading">Loading...</div>
    <div class="max-w-sm mx-auto p-4">
      <!-- 카드 등록 폼 -->
      <form @submit.prevent="handleRegisterCard" class="space-y-5">
        <!-- 카드 등록 정보 섹션 -->
        <CardComponent>
          <div class="space-y-4">
            <div>
              <label for="organization" class="block text-sm font-bold text-slate-700 mb-2"
                >카드사</label
              >
              <select
                id="organization"
                v-model="cardData.organization"
                class="input-field border-b py-1 px-2 w-full appearance-none"
                required
              >
                <option value="" disabled>카드사를 선택해주세요</option>
                <option v-for="card in organization" :value="card.code">{{ card.name }}</option>
              </select>
            </div>

            <div>
              <label for="encryptedCardNo" class="block text-sm font-bold text-slate-700 mb-2"
                >카드 번호</label
              >
              <InputField
                v-model="cardData.encryptedCardNo"
                placeholder="카드 번호를 입력해주세요"
                type="text"
                :maxlength="16"
              />
            </div>

            <div>
              <label for="cardPassword" class="block text-sm font-bold text-slate-700 mb-2"
                >카드 비밀번호 (앞 두자리)</label
              >
              <InputField
                v-model="cardData.cardPassword"
                placeholder="카드 비밀번호 앞 두자리를 입력해주세요"
                type="password"
                :maxlength="2"
              />
            </div>

            <div>
              <label for="loginId" class="block text-sm font-bold text-slate-700 mb-2"
                >사용자 ID</label
              >
              <InputField
                v-model="cardData.loginId"
                placeholder="카드사 사이트 로그인 ID"
                type="text"
              />
            </div>

            <div>
              <label for="loginPw" class="block text-sm font-bold text-slate-700 mb-2"
                >사용자 비밀번호</label
              >
              <InputField
                v-model="cardData.loginPw"
                placeholder="카드사 사이트 로그인 비밀번호"
                type="password"
              />
            </div>

            <div>
              <label for="birthDate" class="block text-sm font-bold text-slate-700 mb-2"
                >생년월일</label
              >
              <InputField
                v-model="cardData.birthDate"
                placeholder="YYYYMMDD (예: 20001225)"
                type="text"
                :maxlength="8"
              />
            </div>
          </div>
        </CardComponent>

        <!-- 등록 버튼 -->
        <div class="pb-4">
          <ButtonItem text="카드 등록하기" />
        </div>
      </form>

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
import { ref } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useRouter } from 'vue-router'
import ButtonItem from '@/components/button/ButtonItem.vue'
import InputField from '@/components/input/InputField.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import organization from '@/utils/cardOrganization.ts'
import { storeToRefs } from 'pinia'
import type { registerCardForm } from '@/types/card'

const cardsStore = useCardsStore()

const { loading } = storeToRefs(cardsStore)
const { registerCard } = cardsStore

const router = useRouter()

const cardData = ref<registerCardForm>({
  organization: '',
  encryptedCardNo: '',
  cardPassword: '',
  loginId: '',
  loginPw: '',
  birthDate: '',
})

const handleRegisterCard = async () => {
  try {
    await registerCard(cardData.value)

    alert('카드가 성공적으로 등록되었습니다!')
    cardData.value = {
      organization: '',
      encryptedCardNo: '',
      cardPassword: '',
      loginId: '',
      loginPw: '',
      birthDate: '',
    }

    router.push({ name: 'RegisterCallback' })
  } catch (error) {
    alert('카드 등록에 실패했습니다.')
    console.error('카드 등록 에러:', error)
  }
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
