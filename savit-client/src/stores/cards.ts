import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import type {
  Card,
  registerCardForm,
  BillingInfo,
  UsageDetail,
  RegisterResponse,
} from '@/types/card'

export const useCardsStore = defineStore('cards', () => {
  const { request, loading } = useApi()

  const registeredCard = ref<RegisterResponse>()

  // 더미 카드 데이터 초기화
  const initializeCards = () => {
    const defaultCards: Card[] = [
      {
        cardId: '1',
        cardName: '나라사랑체크카드(일반형 RF)',
        resCardNo: '949094******0001',
        usageAmount: 0,
        resImageLink: 'https://img1.kbcard.com/ST/img/cxc/kbcard/upload/img/product/04120_img.png',
      },
      {
        cardId: '2',
        cardName: '나라사랑체크카드(일반형 RF)',
        resCardNo: '949094******0001',
        usageAmount: 0,
        resImageLink: 'https://img1.kbcard.com/ST/img/cxc/kbcard/upload/img/product/04120_img.png',
      },
    ]

    // localStorage에서 저장된 별칭 적용
    const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
    defaultCards.forEach((card) => {
      if (savedNicknames[card.cardId]) {
        card.cardNickname = savedNicknames[card.cardId]
      }
    })

    return defaultCards
  }

  const cards = ref<Card[]>(initializeCards())
  const currentMonthBilling = ref<BillingInfo[]>([
    {
      cardId: 1,
      amount: 285000,
      month: '2025-07',
    },
    {
      cardId: 2,
      amount: 450000,
      month: '2025-07',
    },
    {
      cardId: 3,
      amount: 320000,
      month: '2025-07',
    },
  ])
  const lastMonthBilling = ref<BillingInfo[]>([
    {
      cardId: 1,
      amount: 320000,
      month: '2025-06',
    },
    {
      cardId: 2,
      amount: 380000,
      month: '2025-06',
    },
    {
      cardId: 3,
      amount: 290000,
      month: '2025-06',
    },
  ])
  const currentMonthUsage = ref<UsageDetail[]>([
    {
      id: 'usage_001',
      cardId: 1,
      date: '2025-08-20',
      merchant: '스타벅스 강남점',
      amount: 8500,
      category: '카페',
    },
    {
      id: 'usage_007',
      cardId: 1,
      date: '2025-08-20',
      merchant: '맥도날드 역삼점',
      amount: 15000,
      category: '식당',
    },
    {
      id: 'usage_008',
      cardId: 1,
      date: '2025-08-20',
      merchant: '쿠팡 온라인',
      amount: 35000,
      category: '쇼핑',
    },
    {
      id: 'usage_002',
      cardId: 1,
      date: '2025-08-19',
      merchant: '이마트 성수점',
      amount: 65000,
      category: '편의점/마트'
    },
    {
      id: 'usage_009',
      cardId: 1,
      date: '2025-08-19',
      merchant: '롯데시네마 월드타워',
      amount: 32000,
      category: '영화'
    },
    {
      id: 'usage_003',
      cardId: 1,
      date: '2025-08-18',
      merchant: 'CGV 강남점',
      amount: 28000,
      category: '영화'
    },
    {
      id: 'usage_010',
      cardId: 1,
      date: '2025-08-18',
      merchant: '파리바게뜨 강남역점',
      amount: 12000,
      category: '카페',
    },
    {
      id: 'usage_011',
      cardId: 1,
      date: '2025-08-18',
      merchant: '지마켓 온라인',
      amount: 48000,
      category: '쇼핑',
    },
    {
      id: 'usage_004',
      cardId: 2,
      date: '2025-08-21',
      merchant: '올리브영 홍대점',
      amount: 35000,
      category: '기타',
    },
    {
      id: 'usage_012',
      cardId: 2,
      date: '2025-08-21',
      merchant: '교보문고 광화문점',
      amount: 25000,
      category: '기타',
    },
    {
      id: 'usage_005',
      cardId: 2,
      date: '2025-08-20',
      merchant: '백화점 식당가',
      amount: 120000,
      category: '식당',
    },
    {
      id: 'usage_013',
      cardId: 2,
      date: '2025-08-20',
      merchant: '현대백화점 강남점',
      amount: 85000,
      category: '쇼핑',
    },
    {
      id: 'usage_006',
      cardId: 2,
      date: '2025-08-19',
      merchant: 'GS25 편의점',
      amount: 12000,
      category: '편의점/마트'
    },
    {
      id: 'usage_014',
      cardId: 2,
      date: '2025-08-19',
      merchant: '투썸플레이스 홍대점',
      amount: 18000,
      category: '카페'
    },
    {
      id: 'usage_015',
      cardId: 1,
      date: '2025-08-17',
      merchant: '서울대병원',
      amount: 45000,
      category: '의료비'
    },
    {
      id: 'usage_016',
      cardId: 2,
      date: '2025-08-16',
      merchant: '해커스어학원',
      amount: 280000,
      category: '교육'
    },
    {
      id: 'usage_017',
      cardId: 1,
      date: '2025-08-15',
      merchant: 'CGV 압구정점',
      amount: 24000,
      category: '영화'
    },
    {
      id: 'usage_018',
      cardId: 2,
      date: '2025-08-14',
      merchant: '넷플릭스',
      amount: 17000,
      category: '정기구독'
    },
    {
      id: 'usage_019',
      cardId: 3,
      date: '2025-08-13',
      merchant: '강남세브란스병원',
      amount: 65000,
      category: '의료비'
    },
    {
      id: 'usage_020',
      cardId: 3,
      date: '2025-08-12',
      merchant: 'YTN사이언스 아카데미',
      amount: 150000,
      category: '교육'
    }
  ])

  const cardsList = computed(() => cards.value || [])

  const getBillingByCardId = (cardId: string) => {
    const current = currentMonthBilling.value.find((b) => b.cardId === cardId)
    const last = lastMonthBilling.value.find((b) => b.cardId === cardId)
    return {
      current: current || null,
      last: last || null,
    }
  }

  const getUsageByCardId = (cardId: string) => {
    return currentMonthUsage.value.filter((u) => u.cardId === cardId)
  }

  async function registerCard(cardData: registerCardForm) {
    try {
      const response = await request({
        method: 'POST',
        url: '/cards/register',
        data: cardData,
      })

      registeredCard.value = response
      return response
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

      cards.value = response.cards

      // localStorage에서 저장된 별칭 적용
      // const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
      // cards.value.forEach((card) => {
      //   if (savedNicknames[card.cardId]) {
      //     card.cardNickname = savedNicknames[card.cardId]
      //   }
      // })
    } catch (error) {
      console.error('카드 목록 조회 실패, 더미 데이터 사용:', error)

      // 더미 데이터에도 localStorage 별칭 적용
      // const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
      // cards.value.forEach((card) => {
      //   if (savedNicknames[card.cardId]) {
      //     card.cardNickname = savedNicknames[card.cardId]
      //   }
      // })
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

  async function updateCardNickname(cardId: number, nickname: string) {
    try {
      const response = await request({
        method: 'PATCH',
        url: `/cards/${cardId}/nickname`,
        data: { nickname },
      })

      const cardIndex = cards.value.findIndex((card) => card.cardId === cardId)
      if (cardIndex !== -1) {
        cards.value[cardIndex].cardNickname = nickname
      }

      // 성공시 localStorage에서 해당 별칭 제거 (서버와 동기화됨)
      const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
      delete savedNicknames[cardId]
      localStorage.setItem('cardNicknames', JSON.stringify(savedNicknames))

      return response.data
    } catch (error) {
      console.error(`카드 ${cardId} 별칭 수정 실패:`, error)
      const cardIndex = cards.value.findIndex((card) => card.cardId === cardId)
      if (cardIndex !== -1) {
        cards.value[cardIndex].cardNickname = nickname
      }

      // 실패시 localStorage에 별칭 저장 (나중에 동기화용)
      const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
      savedNicknames[cardId] = nickname
      localStorage.setItem('cardNicknames', JSON.stringify(savedNicknames))

      return null
    }
  }

  // localStorage에 저장된 별칭들을 서버와 동기화
  async function syncPendingNicknames() {
    const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
    const pendingUpdates = Object.entries(savedNicknames)

    if (pendingUpdates.length === 0) {
      return { success: true, synced: 0 }
    }

    console.log(`${pendingUpdates.length}개의 별칭을 서버와 동기화 중...`)

    let syncedCount = 0
    const failedUpdates: { [key: string]: string } = {}

    for (const [cardIdStr, nickname] of pendingUpdates) {
      const cardId = parseInt(cardIdStr)
      try {
        await request({
          method: 'PATCH',
          url: `/cards/${cardId}/nickname`,
          data: { nickname },
        })

        syncedCount++
        console.log(`카드 ${cardId} 별칭 동기화 성공: ${nickname}`)
      } catch (error) {
        console.error(`카드 ${cardId} 별칭 동기화 실패:`, error)
        failedUpdates[cardIdStr] = nickname as string
      }
    }

    // 동기화 성공한 것들은 localStorage에서 제거, 실패한 것들만 남김
    localStorage.setItem('cardNicknames', JSON.stringify(failedUpdates))

    console.log(`별칭 동기화 완료: ${syncedCount}/${pendingUpdates.length}`)

    return {
      success: Object.keys(failedUpdates).length === 0,
      synced: syncedCount,
      failed: Object.keys(failedUpdates).length,
    }
  }

  return {
    cardsList,
    loading,
    currentMonthBilling,
    currentMonthUsage,
    registeredCard,
    getBillingByCardId,
    getUsageByCardId,
    registerCard,
    fetchCards,
    fetchBillingInfo,
    fetchUsageForCard,
    updateCardNickname,
    syncPendingNicknames,
  }
})
