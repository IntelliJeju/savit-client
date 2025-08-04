import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import type {
  Card,
  Transaction,
  registerCardForm,
  BillingInfo,
  UsageDetail,
  RegisterResponse,
} from '@/types/card'

export const useCardsStore = defineStore('cards', () => {
  const { request, loading } = useApi()

  // ===== 상태 변수들 =====
  const cards = ref<Card[]>([])
  const transactions = ref<Record<number, Transaction[]>>({})
  const billing = ref<Record<number, { current: BillingInfo | null; last: BillingInfo | null }>>({})
  const registeredCard = ref<RegisterResponse>()

  // ===== Computed 값들 =====
  const cardsList = computed(() => cards.value || [])

  const getTransactionsByCard = computed(() => (cardId: number) => {
    return transactions.value[cardId] || []
  })

  const getBillingByCard = computed(() => (cardId: number) => {
    return billing.value[cardId] || { current: null, last: null }
  })

  const getTotalUsageByIdMonth = computed(() => (cardId: number, month: number) => {
    const cardTransactions = transactions.value[cardId] || []
    return cardTransactions
      .filter((t) => month === Number(t.resUsedDate.slice(4, 6)))
      .reduce((sum, t) => sum + Number(t.resUsedAmount), 0)
  })

  // ===== 카드 관리 함수들 =====
  async function fetchCards() {
    try {
      const response = await request({
        method: 'GET',
        url: '/cards',
      })
      cards.value = response.cards
      return response.cards
    } catch (error) {
      console.error('카드 목록 조회 실패:', error)
      // 에러 시 빈 배열로 초기화
      cards.value = []
      throw error
    }
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

  async function updateCardNickname(cardId: number, nickname: string) {
    try {
      const response = await request({
        method: 'PATCH',
        url: `/cards/${cardId}/nickname`,
        data: { nickname },
      })

      // 카드 목록에서 별칭 업데이트
      const cardIndex = cards.value.findIndex((card) => card.cardId === cardId)
      if (cardIndex !== -1) {
        cards.value[cardIndex].cardNickname = nickname
      }

      // localStorage 정리 (서버와 동기화됨)
      const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
      delete savedNicknames[cardId]
      localStorage.setItem('cardNicknames', JSON.stringify(savedNicknames))

      return response.data
    } catch (error) {
      console.error(`카드 ${cardId} 별칭 수정 실패:`, error)

      // 실패 시 로컬에서 우선 적용 후 localStorage에 저장
      const cardIndex = cards.value.findIndex((card) => card.cardId === cardId)
      if (cardIndex !== -1) {
        cards.value[cardIndex].cardNickname = nickname
      }

      const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
      savedNicknames[cardId] = nickname
      localStorage.setItem('cardNicknames', JSON.stringify(savedNicknames))

      return null
    }
  }

  // ===== 트랜잭션 관리 함수들 =====
  async function fetchTransactions(cardId: number, method: 'GET' | 'POST' = 'GET') {
    try {
      const response = await request({
        method,
        url: `cards/${cardId}/approvals`,
      })

      // 카드별로 트랜잭션 저장
      transactions.value[cardId] = response
      return response
    } catch (error) {
      console.error(`카드 ${cardId} 트랜잭션 조회 실패:`, error)
      transactions.value[cardId] = []
      throw error
    }
  }

  // ===== 청구서 관리 함수들 =====
  async function fetchBillingInfo(cardId: number) {
    try {
      const response = await request({
        method: 'GET',
        url: `/cards/${cardId}/billing`,
      })

      const billingData = response.data
      billing.value[cardId] = {
        current: billingData.currentMonth || null,
        last: billingData.lastMonth || null,
      }

      return billing.value[cardId]
    } catch (error) {
      console.error(`카드 ${cardId} 청구정보 조회 실패:`, error)
      billing.value[cardId] = { current: null, last: null }
      throw error
    }
  }

  // ===== 유틸리티 함수들 =====
  async function syncPendingNicknames() {
    const savedNicknames = JSON.parse(localStorage.getItem('cardNicknames') || '{}')
    const pendingUpdates = Object.entries(savedNicknames)

    if (pendingUpdates.length === 0) {
      return { success: true, synced: 0 }
    }

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
      } catch (error) {
        console.error(`카드 ${cardId} 별칭 동기화 실패:`, error)
        failedUpdates[cardIdStr] = nickname as string
      }
    }

    localStorage.setItem('cardNicknames', JSON.stringify(failedUpdates))

    return {
      success: Object.keys(failedUpdates).length === 0,
      synced: syncedCount,
      failed: Object.keys(failedUpdates).length,
    }
  }

  // ===== 반환값 =====
  return {
    // 상태
    cardsList,
    loading,
    registeredCard,

    // Computed
    getTransactionsByCard,
    getBillingByCard,
    getTotalUsageByIdMonth,

    // 카드 관리
    fetchCards,
    registerCard,
    updateCardNickname,

    // 데이터 관리
    fetchTransactions,
    fetchBillingInfo,

    // 유틸리티
    syncPendingNicknames,
  }
})
