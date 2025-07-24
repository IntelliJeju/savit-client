import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import { useApi } from '@/api/useApi'

interface Card {
  organization: string
  cardId: number
  cardName: string
  cardNumber: string
  cardPassword: string
  userId: string
  userPw: string
  userBdate: string
}

interface BillingInfo {
  amount: number
  month: string
}

interface UsageDetail {
  id: string;
  cardId: number;
  date: string;
  merchant: string;
  amount: number;
  category: string;
}

export const useCardsStore = defineStore('cards', () => {
  // const { request } = useApi()

  const cards = ref<Card[]>([
    {
      organization: '신한카드',
      cardId: 1,
      cardName: '신한카드 Deep Dream',
      cardNumber: '1234-5678-1234-5678',
      cardPassword: '123',
      userId: 'user1',
      userPw: 'pw1',
      userBdate: '900101',
    },
    {
      organization: '국민카드',
      cardId: 2,
      cardName: 'KB국민 탄탄대로 온리유',
      cardNumber: '8765-4321-8765-4321',
      cardPassword: '456',
      userId: 'user1',
      userPw: 'pw1',
      userBdate: '900101',
    },
  ])
  const currentMonthBilling = ref<BillingInfo | null>({
    amount: 150000,
    month: '2025-07',
  })
  const lastMonthBilling = ref<BillingInfo | null>({
    amount: 120000,
    month: '2025-06',
  })
  const currentMonthUsage = ref<UsageDetail[]>([
    {
      id: 'usage1',
      cardId: 1,
      date: '2025-07-20',
      merchant: '스타벅스',
      amount: 5000,
      category: '식비',
    },
    {
      id: 'usage2',
      cardId: 1,
      date: '2025-07-19',
      merchant: 'CGV',
      amount: 15000,
      category: '문화생활',
    },
    {
      id: 'usage3',
      cardId: 2,
      date: '2025-07-18',
      merchant: '쿠팡',
      amount: 30000,
      category: '쇼핑',
    },
  ])

  const registeredCards = computed(() => cards.value)
  const currentBilling = computed(() => currentMonthBilling.value)
  const lastBilling = computed(() => lastMonthBilling.value)

  // async function registerCard(cardData: Omit<Card, 'cardId'>) {
  //   try {
  //     const response = await request({
  //       method: 'POST',
  //       url: '/cards/register',
  //       data: cardData,
  //     })
  //     const newCard: Card = response.data
  //     cards.value.push(newCard)
  //     console.log('카드 등록 성공:', newCard)
  //     return newCard
  //   } catch (error) {
  //     console.error('카드 등록 실패:', error)
  //     throw error
  //   }
  // }

  async function registerCard(cardData: Omit<Card, 'cardId'>) {
    console.log('Dummy registerCard:', cardData);
    const newCard: Card = { ...cardData, cardId: Math.floor(Math.random() * 1000) + 1 };
    cards.value.push(newCard);
    return newCard;
  }

  // async function fetchCards() {
  //   try {
  //     const response = await request({
  //       method: 'GET',
  //       url: '/cards',
  //     })
  //     cards.value = response.data
  //     console.log('등록된 카드 조회 성공:', cards.value)
  //     return cards.value
  //   } catch (error) {
  //     console.error('등록된 카드 조회 실패:', error)
  //     throw error
  //   }
  // }

  async function fetchCards() {
    console.log('Dummy fetchCards');
    return cards.value;
  }

  // async function fetchCurrentMonthBilling() {
  //   try {
  //     const response = await request({
  //       method: 'GET',
  //       url: '/cards/billing/current-month',
  //     })
  //     currentMonthBilling.value = response.data
  //     console.log('이번 달 청구금액 조회 성공:', currentMonthBilling.value)
  //     return currentMonthBilling.value
  //   } catch (error) {
  //     console.error('이번 달 청구금액 조회 실패:', error)
  //     throw error
  //   }
  // }

  async function fetchCurrentMonthBilling() {
    console.log('Dummy fetchCurrentMonthBilling');
    return currentMonthBilling.value;
  }

  // async function fetchLastMonthBilling() {
  //   try {
  //     const response = await request({
  //       method: 'GET',
  //       url: '/cards/billing/last-month',
  //     })
  //     lastMonthBilling.value = response.data
  //     console.log('저번 달 청구금액 조회 성공:', lastMonthBilling.value)
  //     return lastMonthBilling.value
  //   } catch (error) {
  //     console.error('저번 달 청구금액 조회 실패:', error)
  //     throw error
  //   }
  // }

  async function fetchLastMonthBilling() {
    console.log('Dummy fetchLastMonthBilling');
    return lastMonthBilling.value;
  }

  // async function fetchCurrentMonthUsage() {
  //   try {
  //     const response = await request({
  //       method: 'GET',
  //       url: '/cards/usage/current-month', // 예시 API 엔드포인트
  //     });
  //     currentMonthUsage.value = response.data;
  //     console.log('이번 달 카드 이용 내역 조회 성공:', currentMonthUsage.value);
  //     return currentMonthUsage.value;
  //   } catch (error) {
  //     console.error('이번 달 카드 이용 내역 조회 실패:', error);
  //     throw error;
  //   }
  // }

  async function fetchCurrentMonthUsage() {
    console.log('Dummy fetchCurrentMonthUsage');
    return currentMonthUsage.value;
  }

  return {
    cards,
    currentMonthBilling,
    lastMonthBilling,
    currentMonthUsage,
    registeredCards,
    currentBilling,
    lastBilling,
    registerCard,
    fetchCards,
    fetchCurrentMonthBilling,
    fetchLastMonthBilling,
    fetchCurrentMonthUsage,
  }
})
