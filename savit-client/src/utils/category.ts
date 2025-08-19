import type { MainCategory } from '@/types/budgets'

// categoryId를 대분류로 매핑하는 함수
export const mapCategoryToMainCategory = (categoryId: number | null): MainCategory => {
  // categoryId가 null이거나 undefined인 경우 기타로 처리
  if (categoryId === null || categoryId === undefined) {
    return '기타'
  }

  const categoryMapping: { [key: number]: MainCategory } = {
    // 식비 관련 (1, 2, 3)
    1: '식비',
    2: '식비',
    3: '식비',

    // 교통 관련 (4, 5, 6, 17)
    4: '교통',
    5: '교통',
    6: '교통',
    17: '교통',

    // 생활 관련 (7, 8, 12, 13)
    7: '생활',
    8: '생활',
    12: '생활',
    13: '생활',

    // 문화 관련 (9, 10, 11, 14, 15)
    9: '문화',
    10: '문화',
    11: '문화',
    14: '문화',
    15: '문화',

    // 기타 (16)
    16: '기타',
  }

  return categoryMapping[categoryId] || '기타'
}
