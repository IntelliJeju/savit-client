import type { MainCategory } from '@/types/budgets'

// 서브카테고리 대분류로 매핑하는 함수
export const mapCategoryToMainCategory = (category: string): MainCategory => {
  const categoryMapping: { [key: string]: MainCategory } = {
    // 식비 관련
    식당: '식비',
    카페: '식비',
    배달: '식비',
    '제과점/아이스크림점': '식비',
    '커피/음료전문점': '식비',
    '일식/생선회집': '식비',
    휴게음식점: '식비',

    // 교통 관련
    대중교통: '교통',
    택시: '교통',
    철도: '교통',
    '고속.시외버스': '교통',

    // 생활 관련
    통신비: '생활',
    공과금: '생활',
    슈퍼마켓: '생활',
    의료비: '생활',
    교육: '생활',
    편의점: '생활',

    // 문화 관련
    공연: '문화',
    쇼핑: '문화',
    유흥: '문화',
    영화: '문화',
    정기구독: '문화',
    '비디오방/게임방': '문화',

    // 기본값은 기타
  }

  return categoryMapping[category] || '기타'
}
