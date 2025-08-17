// 현재 날짜 정보 (date.ts에서 이동)
const dt = new Date()

export const now = {
  year: dt.getFullYear(),
  month: dt.getMonth() + 1,
  day: dt.getDate(),
}

// 범용 월 계산 함수
export const getRelativeMonth = (monthsBack: number = 0) => {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsBack)
  
  return {
    name: `${date.getMonth() + 1}월`,
    string: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
  }
}

// 현재 월 (ISO 형식)
export const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7)

// 기본 export (하위 호환성)
export default now