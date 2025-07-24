<template>
  <div class="card-register-container p-4">
    <h2 class="text-2xl font-bold mb-6 text-center">카드 등록</h2>
    <form @submit.prevent="handleRegisterCard" class="space-y-4">
      <div>
        <label for="organization" class="block text-sm font-medium text-gray-700">카드사</label>
        <input
          type="text"
          id="organization"
          v-model="cardData.organization"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="cardName" class="block text-sm font-medium text-gray-700">카드 이름</label>
        <input
          type="text"
          id="cardName"
          v-model="cardData.cardName"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="cardNumber" class="block text-sm font-medium text-gray-700">카드 번호</label>
        <input
          type="text"
          id="cardNumber"
          v-model="cardData.cardNumber"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="cardPassword" class="block text-sm font-medium text-gray-700"
          >카드 비밀번호</label
        >
        <input
          type="password"
          id="cardPassword"
          v-model="cardData.cardPassword"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="userId" class="block text-sm font-medium text-gray-700">사용자 ID</label>
        <input
          type="text"
          id="userId"
          v-model="cardData.userId"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="userPw" class="block text-sm font-medium text-gray-700">사용자 비밀번호</label>
        <input
          type="password"
          id="userPw"
          v-model="cardData.userPw"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label for="userBdate" class="block text-sm font-medium text-gray-700"
          >사용자 생년월일 (YYYYMMDD)</label
        >
        <input
          type="text"
          id="userBdate"
          v-model="cardData.userBdate"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="YYYYMMDD"
          required
        />
      </div>
      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        카드 등록
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useRouter } from 'vue-router'

const cardsStore = useCardsStore()
const router = useRouter()

const cardData = ref({
  organization: '',
  cardId: 0,
  cardName: '',
  cardNumber: '',
  cardPassword: '',
  userId: '',
  userPw: '',
  userBdate: '',
})

const handleRegisterCard = async () => {
  try {
    // cardId는 백엔드에서 생성될 것이므로, 여기서는 Omit<Card, 'id'>에 맞게 cardId를 제외하고 전송합니다.
    // 하지만 현재 cards.ts의 registerCard는 Omit<Card, 'id'>가 아닌 Omit<Card, 'cardId'>를 기대하는 것으로 보입니다.
    // cards.ts의 Card 인터페이스에 id 필드가 없으므로, Omit<Card, 'id'>는 의미가 없습니다.
    // 여기서는 cardId를 제외하고 나머지 필드를 전송하도록 합니다.
    const { cardId, ...dataToSend } = cardData.value
    await cardsStore.registerCard(dataToSend)
    alert('카드가 성공적으로 등록되었습니다!')
    router.push('/card/current') // 등록 후 카드 현황 페이지로 이동
  } catch (error) {
    alert('카드 등록에 실패했습니다.')
    console.error('카드 등록 에러:', error)
  }
}
</script>

<style scoped>
/* Tailwind CSS를 사용하므로 추가적인 스타일은 필요하지 않을 수 있습니다. */
</style>
