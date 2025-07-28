import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'

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
  const { request } = useApi()

  const cards = ref<Card[]>([
    {
      organization: '신한카드',
      cardId: 1,
      cardName: '신한 프리미어',
      cardNumber: '1234-5678-9012-3456',
      cardPassword: '1234',
      userId: 'testuser1',
      userPw: 'password123',
      userBdate: '19901215'
    },
    {
      organization: '삼성카드',
      cardId: 2,
      cardName: '삼성 플래티넘',
      cardNumber: '9876-5432-1098-7654',
      cardPassword: '5678',
      userId: 'testuser2',
      userPw: 'password456',
      userBdate: '19851020'
    },
    {
      organization: '국민카드',
      cardId: 3,
      cardName: '국민 트래블러스',
      cardNumber: '1111-2222-3333-4444',
      cardPassword: '9876',
      userId: 'testuser3',
      userPw: 'password789',
      userBdate: '19930305'
    }
  ])
  const currentMonthBilling = ref<BillingInfo[]>([
    {
      cardId: 1,
      amount: 285000,
      month: '2025-07'
    },
    {
      cardId: 2,
      amount: 450000,
      month: '2025-07'
    },
    {
      cardId: 3,
      amount: 320000,
      month: '2025-07'
    }
  ])
  const lastMonthBilling = ref<BillingInfo[]>([
    {
      cardId: 1,
      amount: 320000,
      month: '2025-06'
    },
    {
      cardId: 2,
      amount: 380000,
      month: '2025-06'
    },
    {
      cardId: 3,
      amount: 290000,
      month: '2025-06'
    }
  ])
  const currentMonthUsage = ref<UsageDetail[]>([
    {
      id: 'usage_001',
      cardId: 1,
      date: '2025-07-20',
      merchant: '스타벅스 강남점',
      amount: 8500,
      category: '카페'
    },
    {
      id: 'usage_007',
      cardId: 1,
      date: '2025-07-20',
      merchant: '맥도날드 역삼점',
      amount: 15000,
      category: '식당'
    },
    {
      id: 'usage_008',
      cardId: 1,
      date: '2025-07-20',
      merchant: '쿠팡 온라인',
      amount: 35000,
      category: '쇼핑'
    },
    {
      id: 'usage_002',
      cardId: 1,
      date: '2025-07-19',
      merchant: '이마트 성수점',
      amount: 65000,
      category: '편의점'
    },
    {
      id: 'usage_009',
      cardId: 1,
      date: '2025-07-19',
      merchant: '롯데시네마 월드타워',
      amount: 32000,
      category: '공연'
    },
    {
      id: 'usage_003',
      cardId: 1,
      date: '2025-07-18',
      merchant: 'CGV 강남점',
      amount: 28000,
      category: '공연'
    },
    {
      id: 'usage_010',
      cardId: 1,
      date: '2025-07-18',
      merchant: '파리바게뜨 강남역점',
      amount: 12000,
      category: '카페'
    },
    {
      id: 'usage_011',
      cardId: 1,
      date: '2025-07-18',
      merchant: '지마켓 온라인',
      amount: 48000,
      category: '쇼핑'
    },
    {
      id: 'usage_004',
      cardId: 2,
      date: '2025-07-21',
      merchant: '올리브영 홍대점',
      amount: 35000,
      category: '기타'
    },
    {
      id: 'usage_012',
      cardId: 2,
      date: '2025-07-21',
      merchant: '교보문고 광화문점',
      amount: 25000,
      category: '기타'
    },
    {
      id: 'usage_005',
      cardId: 2,
      date: '2025-07-20',
      merchant: '백화점 식당가',
      amount: 120000,
      category: '식당'
    },
    {
      id: 'usage_013',
      cardId: 2,
      date: '2025-07-20',
      merchant: '현대백화점 강남점',
      amount: 85000,
      category: '쇼핑'
    },
    {
      id: 'usage_006',
      cardId: 2,
      date: '2025-07-19',
      merchant: 'GS25 편의점',
      amount: 12000,
      category: '편의점'
    },
    {
      id: 'usage_014',
      cardId: 2,
      date: '2025-07-19',
      merchant: '투썸플레이스 홍대점',
      amount: 18000,
      category: '카페'
    }
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
    try {
      const response = await request({
        method: 'POST',
        url: '/cards/register',
        data: cardData,
      })

      const newCard: Card = response.data
      cards.value.push(newCard)

      return newCard
    } catch (error) {
      console.error('카드 등록 실패:', error)
      throw error
    }
  }

  async function fetchCards() {
    try {
      const response = await request({
        method: 'GET',
        url: '/cards',
      })

      if (response.data && response.data.length > 0) {
        cards.value = response.data
      }
      return cards.value
    } catch (error) {
      console.error('카드 목록 조회 실패, 더미 데이터 사용:', error)
      return cards.value
    }
  }

  async function fetchBillingInfo(cardId: number) {
    try {
      const response = await request({
        method: 'GET',
        url: `/cards/${cardId}/billing`,
      })

      const billingData = response.data
      currentMonthBilling.value = billingData.currentMonth || []
      lastMonthBilling.value = billingData.lastMonth || []

      return getBillingByCardId(cardId)
    } catch (error) {
      console.error(`카드 ${cardId} 청구정보 조회 실패:`, error)
      throw error
    }
  }

  async function fetchUsageForCard(cardId: number) {
    try {
      const response = await request({
        method: 'GET',
        url: `/cards/${cardId}/usage`,
      })

      const usageData = response.data
      const filteredUsage = currentMonthUsage.value.filter((usage) => usage.cardId !== cardId)
      currentMonthUsage.value = [...filteredUsage, ...usageData]

      return getUsageByCardId(cardId)
    } catch (error) {
      console.error(`카드 ${cardId} 사용내역 조회 실패:`, error)
      throw error
    }
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
