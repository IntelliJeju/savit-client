import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import { useApi } from '@/api/useApi'

interface Card {
  organization: string //카드사
  cardId: number
  cardName: string
  cardNumber: string
  cardPassword: string
  userId: string // 카드사 사용자 아이디
  userPw: string // 카드사 사용자 비밀번호
  userBdate: string // 사용자 생년월일
}

interface BillingInfo {
  cardId: number
  amount: number
  month: string
}

interface UsageDetail {
  id: string
  cardId: number
  date: string
  merchant: string
  amount: number
  category: string
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
  const currentMonthBilling = ref<BillingInfo[]>([
    { cardId: 1, amount: 150000, month: '2025-07' },
    { cardId: 2, amount: 250000, month: '2025-07' },
  ])
  const lastMonthBilling = ref<BillingInfo[]>([
    { cardId: 1, amount: 120000, month: '2025-06' },
    { cardId: 2, amount: 220000, month: '2025-06' },
  ])
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
      cardId: 1,
      date: '2025-07-19',
      merchant: '맥도날드',
      amount: 6900,
      category: '식비',
    },
    {
      id: 'usage4',
      cardId: 2,
      date: '2025-07-18',
      merchant: '쿠팡',
      amount: 30000,
      category: '쇼핑',
    },
  ])

  const registeredCards = computed(() => cards.value)

  const getBillingByCardId = (cardId: number) => {
    const current = currentMonthBilling.value.find((b) => b.cardId === cardId)
    const last = lastMonthBilling.value.find((b) => b.cardId === cardId)
    return {
      current: current || null,
      last: last || null,
    }
  }

  const getUsageByCardId = (cardId: number) => {
    return currentMonthUsage.value.filter((u) => u.cardId === cardId)
  }

  async function registerCard(cardData: Omit<Card, 'cardId'>) {
    console.log('Dummy registerCard:', cardData)
    const newCard: Card = { ...cardData, cardId: Math.floor(Math.random() * 1000) + 1 }
    cards.value.push(newCard)
    // Add dummy billing info for the new card
    currentMonthBilling.value.push({ cardId: newCard.cardId, amount: 0, month: '2025-07' })
    lastMonthBilling.value.push({ cardId: newCard.cardId, amount: 0, month: '2025-06' })
    return newCard
  }

  async function fetchCards() {
    console.log('Dummy fetchCards')
    // In a real app, you'd fetch cards and then their billing info
    return cards.value
  }

  async function fetchBillingInfo(cardId: number) {
    console.log(`Dummy fetchBillingInfo for cardId: ${cardId}`)
    // This would fetch billing info for a specific card
    return getBillingByCardId(cardId)
  }

  async function fetchUsageForCard(cardId: number) {
    console.log(`Dummy fetchUsageForCard for cardId: ${cardId}`)
    // This would fetch usage details for a specific card
    return getUsageByCardId(cardId)
  }

  return {
    cards,
    registeredCards,
    getBillingByCardId,
    getUsageByCardId,
    registerCard,
    fetchCards,
    fetchBillingInfo,
    fetchUsageForCard,
    // For CardUsage.vue to still have access to the full list for now
    currentMonthBilling,
    currentMonthUsage,
  }
})
