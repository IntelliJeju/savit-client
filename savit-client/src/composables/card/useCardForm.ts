import { ref, readonly } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useRouter } from 'vue-router'
import type { registerCardForm } from '@/types/card'
import type { CardNumberParts, OCRResult } from '@/types/card.composables'
import organization from '@/utils/cardOrganization.ts'

/**
 * 카드 폼 관련 기능을 관리하는 컴포저블
 * - 카드 등록 폼 상태 관리
 * - 카드 번호 4구역 분할 처리
 * - 비밀번호 입력 처리
 * - OCR 결과로 폼 자동 채우기
 * - 카드 등록 및 거래내역 조회
 */
export function useCardForm() {
  const cardsStore = useCardsStore()
  const router = useRouter()

  // 카드 등록 폼 데이터
  const cardData = ref<registerCardForm>({
    organization: '',
    encryptedCardNo: '',
    cardPassword: '',
    loginId: '',
    loginPw: '',
    birthDate: '',
  })

  // 카드 번호 4구역 관리
  const cardNumber = ref<CardNumberParts>({
    part1: '',
    part2: '',
    part3: '',
    part4: '',
  })

  // 사용내역 처리 중 상태
  const isProcessingTransactions = ref(false)

  /**
   * 카드 번호 입력 처리
   */
  const handleCardNumberInput = (partIndex: number, event: Event): void => {
    const target = event.target as HTMLInputElement
    const value = target.value.replace(/\D/g, '') // 숫자만 허용

    // 해당 구역 업데이트
    const parts = ['part1', 'part2', 'part3', 'part4'] as const
    cardNumber.value[parts[partIndex]] = value

    // 전체 카드 번호 업데이트
    updateFullCardNumber()

    // 4자리 입력 시 다음 입력창으로 포커스 이동
    if (value.length === 4 && partIndex < 3) {
      const nextInput = target.parentElement?.children[partIndex + 1] as HTMLInputElement
      nextInput?.focus()
    }
  }

  /**
   * 전체 카드 번호 업데이트
   */
  const updateFullCardNumber = (): void => {
    const fullNumber =
      cardNumber.value.part1 +
      cardNumber.value.part2 +
      cardNumber.value.part3 +
      cardNumber.value.part4
    cardData.value.encryptedCardNo = fullNumber
  }

  /**
   * 카드 비밀번호 입력 처리
   */
  const handlePasswordInput = (event: Event): void => {
    const target = event.target as HTMLInputElement
    const value = target.value.replace(/\D/g, '') // 숫자만 허용
    cardData.value.cardPassword = value
  }

  /**
   * OCR 결과로 카드 번호 분할 설정
   */
  const setCardNumberFromOCR = (fullCardNumber: string): void => {
    const cleaned = fullCardNumber.replace(/\D/g, '')
    cardNumber.value = {
      part1: cleaned.slice(0, 4),
      part2: cleaned.slice(4, 8),
      part3: cleaned.slice(8, 12),
      part4: cleaned.slice(12, 16),
    }
    updateFullCardNumber()
  }

  /**
   * OCR 결과로 폼 자동 채우기
   */
  const fillFormFromOCR = (ocrResult: OCRResult): void => {
    if (ocrResult.cardNumber) {
      setCardNumberFromOCR(ocrResult.cardNumber)
    }
  }

  /**
   * 카드 등록 처리
   */
  const handleRegisterCard = async (): Promise<void> => {
    try {
      // 등록 전 기존 카드 목록 저장
      const existingCardIds = new Set(cardsStore.cardsList.map(card => card.cardId))
      
      const response = await cardsStore.registerCard(cardData.value)

      // 등록 후 카드 목록을 다시 가져와서 사용내역 조회
      if (response?.cards && response.cards.length > 0) {
        isProcessingTransactions.value = true

        try {
          // 먼저 카드 목록을 다시 가져오기
          await cardsStore.fetchCards()
          
          // 새로 등록된 카드만 식별
          const updatedCardsList = cardsStore.cardsList
          const newCards = updatedCardsList.filter(card => !existingCardIds.has(card.cardId))
          
          console.log('기존 카드 ID들:', Array.from(existingCardIds))
          console.log('업데이트된 카드 목록:', updatedCardsList.map(c => c.cardId))
          console.log('새로 등록된 카드들:', newCards.map(c => c.cardId))
          
          // 새로 등록된 카드만 POST로 사용내역 가져오기 (약 10초 소요)
          for (const card of newCards) {
            try {
              console.log(`새 카드 ${card.cardId}의 사용내역 불러오기 시작`)
              await cardsStore.fetchTransactions(card.cardId, 'POST')
              console.log(`새 카드 ${card.cardId}의 사용내역 불러오기 완료`)
            } catch (transactionError) {
              console.warn(`새 카드 ${card.cardId}의 사용내역 조회 실패:`, transactionError)
            }
          }
        } catch (error) {
          console.warn('카드 목록 조회 실패:', error)
        }

        isProcessingTransactions.value = false
      }

      alert('카드가 성공적으로 등록되었습니다!')
      resetForm()
      router.push({ name: 'RegisterCallback' })
    } catch (error) {
      isProcessingTransactions.value = false
      alert('카드 등록에 실패했습니다.')
      console.error('카드 등록 에러:', error)
      throw error
    }
  }

  /**
   * 카드 데이터 업데이트
   */
  const updateCardData = (field: keyof registerCardForm, value: string): void => {
    cardData.value[field] = value
  }

  /**
   * 폼 초기화
   */
  const resetForm = (): void => {
    cardData.value = {
      organization: '',
      encryptedCardNo: '',
      cardPassword: '',
      loginId: '',
      loginPw: '',
      birthDate: '',
    }
    cardNumber.value = {
      part1: '',
      part2: '',
      part3: '',
      part4: '',
    }
  }

  return {
    // 상태
    cardData: readonly(cardData),
    cardNumber: readonly(cardNumber),
    isProcessingTransactions: readonly(isProcessingTransactions),

    // 메서드
    handleCardNumberInput,
    handlePasswordInput,
    setCardNumberFromOCR,
    fillFormFromOCR,
    handleRegisterCard,
    updateCardData,
    resetForm,

    // 유틸리티
    organization,
  }
}
