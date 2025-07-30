<template>
  <div class="min-h-screen bg-app-light-gray">
    <div class="max-w-sm mx-auto p-4">
      <!-- 카드 등록 폼 -->
      <form @submit.prevent="handleRegisterCard" class="space-y-5">
        <!-- 카드 등록 정보 섹션 -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div class="space-y-4">
            <div>
              <label for="organization" class="block text-sm font-bold text-slate-700 mb-2">카드사</label>
              <select
                id="organization"
                v-model="cardData.organization"
                class="input-field border-b py-1 px-2 w-full appearance-none"
                required
              >
                <option value="" disabled>카드사를 선택해주세요</option>
                <option value="국민카드">국민카드</option>
                <option value="삼성카드">삼성카드</option>
                <option value="현대카드">현대카드</option>
                <option value="롯데카드">롯데카드</option>
                <option value="신한카드">신한카드</option>
                <option value="하나카드">하나카드</option>
                <option value="우리카드">우리카드</option>
                <option value="NH농협카드">NH농협카드</option>
                <option value="BC카드">BC카드</option>
                <option value="카카오뱅크">카카오뱅크</option>
                <option value="토스뱅크">토스뱅크</option>
              </select>
            </div>
            
            <div>
              <label for="cardNumber" class="block text-sm font-bold text-slate-700 mb-2">카드 번호</label>
              <InputField
                v-model="cardData.cardNumber"
                placeholder="카드 번호를 입력해주세요"
                type="text"
                :maxlength="16"
              />
            </div>
            
            <div>
              <label for="cardPassword" class="block text-sm font-bold text-slate-700 mb-2">카드 비밀번호 (앞 두자리)</label>
              <InputField
                v-model="cardData.cardPassword"
                placeholder="카드 비밀번호 앞 두자리를 입력해주세요"
                type="password"
                :maxlength="2"
              />
            </div>
            
            <div>
              <label for="userId" class="block text-sm font-bold text-slate-700 mb-2">사용자 ID</label>
              <InputField
                v-model="cardData.userId"
                placeholder="카드사 사이트 로그인 ID"
                type="text"
              />
            </div>
            
            <div>
              <label for="userPw" class="block text-sm font-bold text-slate-700 mb-2">사용자 비밀번호</label>
              <InputField
                v-model="cardData.userPw"
                placeholder="카드사 사이트 로그인 비밀번호"
                type="password"
              />
            </div>
            
            <div>
              <label for="userBdate" class="block text-sm font-bold text-slate-700 mb-2">생년월일</label>
              <InputField
                v-model="cardData.userBdate"
                placeholder="YYYYMMDD (예: 20001225)"
                type="text"
                :maxlength="8"
              />
            </div>
          </div>
        </div>

        <!-- 등록 버튼 -->
        <div class>
          <ButtonItem text="카드 등록하기"/>
        </div>
      </form>

      <!-- 안내 메시지 -->
      <div class="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div class="flex items-start gap-3">
          <div>
            <p class="text-sm text-slate-700 font-medium mb-1">안전한 정보 보호</p>
            <p class="text-xs text-slate-600">입력하신 모든 정보는 암호화되어 안전하게 보관됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useRouter } from 'vue-router'
import ButtonItem from '@/components/button/ButtonItem.vue'
import InputField from '@/components/input/InputField.vue'

const cardsStore = useCardsStore()
const router = useRouter()

const cardData = ref({
  organization: '',
  cardId: 0,
  cardName: '',
  cardNumber: '',
  cardPassword: '',
  cardNickname: '',
  userId: '',
  userPw: '',
  userBdate: '',
})

const handleRegisterCard = async () => {
  try {
    const { cardId, ...dataToSend } = cardData.value
    await cardsStore.registerCard(dataToSend)
    
    alert('카드가 성공적으로 등록되었습니다!')
    cardData.value = {
      organization: '',
      cardId: 0,
      cardName: '',
      cardNumber: '',
      cardPassword: '',
      cardNickname: '',
      userId: '',
      userPw: '',
      userBdate: '',
      
    }
    
    router.push('/card/current')
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
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
