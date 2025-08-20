import type { SubCategory, MainCategory } from '@/types/budgets'
import type { Transaction, Card } from '@/types/card'
import { ID_TO_CATEGORY_MAP } from '@/types/budgets'

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

  // categoryId 기반 분류 로직
  private categorizeTransaction(transaction: Transaction): SubCategory {
    // categoryId가 있는 경우 직접 매핑 (우선순위)
    if (transaction.categoryId && ID_TO_CATEGORY_MAP[transaction.categoryId]) {
      const mainCategory = ID_TO_CATEGORY_MAP[transaction.categoryId]
      return this.getDefaultSubCategoryForMain(mainCategory)
    }
    
    // categoryId가 없는 경우 간단한 fallback
    return '기타'
  }

  // 대분류별 기본 서브카테고리 반환
  private getDefaultSubCategoryForMain(mainCategory: MainCategory): SubCategory {
    const defaultMapping: Record<MainCategory, SubCategory> = {
      '식비': '식당',
      '교통': '대중교통', 
      '생활': '편의점/마트',
      '문화': '쇼핑',
      '기타': '기타'
    }
    return defaultMapping[mainCategory] || '기타'
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
      '철도': 0,
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