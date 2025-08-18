import type { SubCategory } from '@/types/budgets'
import type { Transaction, Card } from '@/types/card'

// 거래 데이터 처리 서비스
export class TransactionService {
  private static instance: TransactionService
  private transactionDataProviders: (() => { cards: Card[], transactions: Record<number, Transaction[]> })[] = []

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService()
    }
    return TransactionService.instance
  }

  // 거래 데이터 제공자 등록
  registerDataProvider(provider: () => { cards: Card[], transactions: Record<number, Transaction[]> }): void {
    this.transactionDataProviders.push(provider)
  }

  // 특정 월의 모든 거래 조회
  getAllTransactionsForMonth(month: string): Transaction[] {
    const allTransactions: Transaction[] = []
    const monthPrefix = month.replace('-', '')
    
    for (const provider of this.transactionDataProviders) {
      const { cards, transactions } = provider()
      
      cards.forEach(card => {
        const cardTransactions = transactions[card.cardId] || []
        allTransactions.push(...cardTransactions)
      })
    }
    
    return allTransactions.filter(transaction => 
      transaction.resUsedDate.startsWith(monthPrefix)
    )
  }

  // 거래 데이터를 카테고리별 지출로 변환
  processTransactionsToSpending(
    transactions: Transaction[]
  ): Record<SubCategory, number> {
    const spendingByCategory = this.initializeSpendingByCategory()
    
    transactions.forEach(transaction => {
      if (transaction.resCancelYN === '0') {
        const category = this.categorizeTransaction(transaction)
        const amount = Number(transaction.resUsedAmount)
        spendingByCategory[category] += amount
      }
    })
    
    return spendingByCategory
  }

  // 기존 카테고리 시스템을 활용한 분류 로직
  private categorizeTransaction(transaction: Transaction): SubCategory {
    const storeName = (transaction.resMemberStoreName || '').toLowerCase()
    const storeType = (transaction.resMemberStoreType || '').toLowerCase()
    
    // 가맹점 유형으로 먼저 분류 시도
    if (storeType.includes('식당') || storeType.includes('음식점')) return '식당'
    if (storeType.includes('카페') || storeType.includes('커피')) return '카페'
    if (storeType.includes('편의점')) return '편의점/마트'
    if (storeType.includes('슈퍼마켓') || storeType.includes('마트')) return '편의점/마트'
    if (storeType.includes('택시') || storeType.includes('버스') || storeType.includes('지하철')) return '대중교통'
    if (storeType.includes('병원') || storeType.includes('의원') || storeType.includes('약국')) return '의료비'
    if (storeType.includes('영화') || storeType.includes('극장')) return '영화'
    if (storeType.includes('통신')) return '통신비'
    
    // 가맹점명으로 보완 분류
    if (storeName.includes('스타벅스') || storeName.includes('투썸') || storeName.includes('카페')) return '카페'
    if (storeName.includes('치킨') || storeName.includes('피자') || storeName.includes('맥도날드')) return '식당'
    if (storeName.includes('gs25') || storeName.includes('cu') || storeName.includes('세븐일레븐')) return '편의점/마트'
    if (storeName.includes('이마트') || storeName.includes('롯데마트') || storeName.includes('홈플러스')) return '편의점/마트'
    if (storeName.includes('cgv') || storeName.includes('롯데시네마') || storeName.includes('메가박스')) return '영화'
    if (storeName.includes('skt') || storeName.includes('kt') || storeName.includes('lg유플러스')) return '통신비'
    if (storeName.includes('배달의민족') || storeName.includes('요기요') || storeName.includes('쿠팡이츠')) return '배달'
    
    return '기타'
  }

  // 특정 월의 카테고리별 지출 조회
  getSpendingByMonth(month: string): Record<SubCategory, number> {
    const transactions = this.getAllTransactionsForMonth(month)
    return this.processTransactionsToSpending(transactions)
  }

  private initializeSpendingByCategory(): Record<SubCategory, number> {
    return {
      '식당': 0,
      '카페': 0,
      '배달': 0,
      '대중교통': 0,
      '택시': 0,
      '통신비': 0,
      '공과금': 0,
      '편의점/마트': 0,
      '의료비': 0,
      '교육': 0,
      '공연': 0,
      '쇼핑': 0,
      '유흥': 0,
      '영화': 0,
      '정기구독': 0,
      '기타': 0
    }
  }
}

// 싱글톤 인스턴스 export
export const transactionService = TransactionService.getInstance()