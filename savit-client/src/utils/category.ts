import type { MainCategory } from '@/types/budgets'
import type { Transaction } from '@/types/card'
import { useApi } from '@/api/useApi'

const { request } = useApi()

// 서브카테고리 대분류로 매핑하는 함수
export const mapCategoryToMainCategory = (category: string): MainCategory => {
  const categoryMapping: { [key: string]: MainCategory } = {
    // 식비 관련
    '식당': '식비',
    '카페': '식비',
    '배달': '식비',
    
    // 교통 관련
    '대중교통': '교통',
    '택시': '교통',
    
    // 생활 관련
    '통신비': '생활',
    '공과금': '생활',
    '편의점/마트': '생활',
    '의료비': '생활',
    '교육': '생활',
    
    // 문화 관련
    '공연': '문화',
    '쇼핑': '문화',
    '유흥': '문화',
    '영화': '문화',
    '정기구독': '문화',
    
    // 기본값은 기타
  }
  
  return categoryMapping[category] || '기타'
}

export async function saveTransaction(transaction: Transaction): Promise<{ success: boolean; message: string }> {
  try {
    await request({
      method: 'POST',
      url: '/transactions',
      data: {
        cardId: transaction.cardId,
        resCardNo: transaction.resCardNo,
        resUsedDate: transaction.resUsedDate,
        resUsedTime: transaction.resUsedTime,
        resUsedAmount: transaction.resUsedAmount,
        resCancelYN: transaction.resCancelYN,
        resMemberStoreName: transaction.resMemberStoreName,
        resMemberStoreType: transaction.resMemberStoreType
      }
    })
    
    return { success: true, message: '거래가 성공적으로 저장되었습니다' }
  } catch (error) {
    console.error('거래 저장 실패:', error)
    return { success: false, message: '거래 저장에 실패했습니다' }
  }
}


