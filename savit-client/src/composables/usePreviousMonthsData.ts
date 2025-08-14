import { ref } from 'vue'
import { useBudgetsStore } from '@/stores/budgets'

interface MonthData {
  name: string
  spending: number
  budget: number
}

export function usePreviousMonthsData() {
  const budgetsStore = useBudgetsStore()
  
  const lastMonth = ref<MonthData>({
    name: '',
    spending: 0,
    budget: 0,
  })

  const twoMonthsAgo = ref<MonthData>({
    name: '',
    spending: 0,
    budget: 0,
  })

  const loadPreviousData = async () => {
    try {
      const [lastMonthData, twoMonthsAgoData] = await Promise.all([
        budgetsStore.getPreviousMonthsSummary(1),
        budgetsStore.getPreviousMonthsSummary(2)
      ])

      lastMonth.value = {
        name: lastMonthData.monthName,
        spending: lastMonthData.totalSpent,
        budget: lastMonthData.totalBudget,
      }

      twoMonthsAgo.value = {
        name: twoMonthsAgoData.monthName,
        spending: twoMonthsAgoData.totalSpent,
        budget: twoMonthsAgoData.totalBudget,
      }
    } catch (error) {
      console.error('Failed to load previous data:', error)
      throw error
    }
  }

  return {
    lastMonth,
    twoMonthsAgo,
    loadPreviousData
  }
}