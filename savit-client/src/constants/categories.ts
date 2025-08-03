export type MainCategory = '식비' | '교통' | '생활' | '문화' | '기타'

export type SubCategory = 
  | '식당' | '카페' | '배달'
  | '대중교통' | '택시'
  | '통신비' | '공과금' | '편의점/마트' | '의료비' | '교육'
  | '공연' | '쇼핑' | '유흥' | '영화' | '정기구독'
  | '기타'

export interface CategoryMapping {
  main: MainCategory
  sub: SubCategory
}

export const CATEGORIES = {
  MAIN: ['식비', '교통', '생활', '문화', '기타'] as const,
  SUB: {
    식비: ['식당', '카페', '배달'],
    교통: ['대중교통', '택시'],
    생활: ['통신비', '공과금', '편의점/마트', '의료비', '교육'],
    문화: ['공연', '쇼핑', '유흥', '영화', '정기구독'],
    기타: ['기타']
  } as const
} as const

export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  { main: '식비', sub: '식당' }, { main: '식비', sub: '카페' }, { main: '식비', sub: '배달' },
  { main: '교통', sub: '대중교통' }, { main: '교통', sub: '택시' },
  { main: '생활', sub: '통신비' }, { main: '생활', sub: '공과금' }, { main: '생활', sub: '편의점/마트' },
  { main: '생활', sub: '의료비' }, { main: '생활', sub: '교육' },
  { main: '문화', sub: '공연' }, { main: '문화', sub: '쇼핑' }, { main: '문화', sub: '유흥' },
  { main: '문화', sub: '영화' }, { main: '문화', sub: '정기구독' },
  { main: '기타', sub: '기타' }
]

export const CATEGORY_ORDER: MainCategory[] = ['식비', '교통', '생활', '문화', '기타']

// 카테고리 유틸리티 함수들
export const getMainCategoryFromSub = (subCategory: SubCategory): MainCategory => {
  const mapping = CATEGORY_MAPPINGS.find(m => m.sub === subCategory)
  return mapping?.main || '기타'
}

export const getSubCategoriesByMain = (mainCategory: MainCategory): SubCategory[] => {
  return CATEGORIES.SUB[mainCategory] as SubCategory[]
}

export const getCategoryIcon = (mainCategory: MainCategory): string => {
  const icons = {
    식비: '🍽️',
    교통: '🚗',
    생활: '🏠',
    문화: '🎭',
    기타: '📦'
  }
  return icons[mainCategory] || '📦'
}

export const getCategoryColor = (mainCategory: MainCategory): string => {
  const colors = {
    식비: 'text-red-500',
    교통: 'text-blue-500',
    생활: 'text-green-500',
    문화: 'text-purple-500',
    기타: 'text-gray-500'
  }
  return colors[mainCategory] || 'text-gray-500'
}

export const getCategoryBgColor = (mainCategory: MainCategory): string => {
  const colors = {
    식비: 'bg-red-50',
    교통: 'bg-blue-50',
    생활: 'bg-green-50',
    문화: 'bg-purple-50',
    기타: 'bg-gray-50'
  }
  return colors[mainCategory] || 'bg-gray-50'
}