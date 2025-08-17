import type { Transaction } from '@/types/card'
import type { SubCategory, MainCategoryBudgetStatus } from '@/types/budgets'
import { CATEGORIES } from '@/types/budgets'
import { calculateSum } from '@/utils/calculations'
import { useCardsStore } from '@/stores/cards'

export function useBudgetDataProcessor() {
  const cardsStore = useCardsStore()

  // 카테고리별 지출 데이터 초기화
  const initializeSpendingByCategory = (): Record<SubCategory, number> =>
    Object.values(CATEGORIES.SUB).flat().reduce(
      (acc, subCategory) => ({ ...acc, [subCategory]: 0 }),
      {} as Record<SubCategory, number>
    )

  // 카드 거래 내역 수집
  function getAllTransactionsForMonth(month: string): Transaction[] {
    const allTransactions: Transaction[] = []
    const monthPrefix = month.replace('-', '')
    
    cardsStore.cardsList.forEach(card => {
      const cardTransactions = cardsStore.getTransactionsByCard(card.cardId)
      allTransactions.push(...cardTransactions)
    })
    
    return allTransactions.filter(transaction => 
      transaction.resUsedDate.startsWith(monthPrefix)
    )
  }

  // 카드 거래 내역 처리
  function processCardTransactions(
    transactions: Transaction[], 
    spendingByCategory: Record<SubCategory, number>
  ): void {
    transactions.forEach(transaction => {
      if (transaction.resCancelYN === '0') {
        const category = '기타' as SubCategory
        const amount = Number(transaction.resUsedAmount)
        spendingByCategory[category] += amount
      }
    })
  }

  const getSpendingByMonth = (
    month: string, 
    categorySpendingData: Record<string, Record<SubCategory, number>>
  ): Record<SubCategory, number> => {
    if (categorySpendingData[month]) return categorySpendingData[month]

    const spendingByCategory = initializeSpendingByCategory()
    processCardTransactions(getAllTransactionsForMonth(month), spendingByCategory)
    
    return categorySpendingData[month] = spendingByCategory
  }

  const calculateSpentAmount = (
    subCategory: SubCategory, 
    month: string,
    categorySpendingData: Record<string, Record<SubCategory, number>>
  ): number => 
    getSpendingByMonth(month, categorySpendingData)[subCategory] || 0

  const updateSpendingData = (
    mainCategoryBudgets: MainCategoryBudgetStatus[], 
    month: string,
    categorySpendingData: Record<string, Record<SubCategory, number>>
  ): MainCategoryBudgetStatus[] =>
    mainCategoryBudgets.map(mainCategory => {
      const updatedSubCategories = mainCategory.subCategories.map(sub => ({
        ...sub,
        spentAmount: calculateSpentAmount(sub.subCategory, month, categorySpendingData)
      }))
      
      return {
        ...mainCategory,
        totalSpent: calculateSum(updatedSubCategories, 'spentAmount'),
        subCategories: updatedSubCategories
      }
    })

  return {
    getSpendingByMonth,
    updateSpendingData,
    calculateSpentAmount
  }
}