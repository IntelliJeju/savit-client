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

// 날짜를 사용자 친화적 형식으로 포맷 (카드 사용내역용)
export const formatTransactionDate = (dateString: string, showYear = false) => {
  // resUsedDate가 "20240819" 형식인 경우를 처리
  const formattedDateString = dateString.length === 8 
    ? `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`
    : dateString
    
  const date = new Date(formattedDateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '오늘'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '어제'
  } else {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return showYear ? `${year}년 ${month}월 ${day}일` : `${month}월 ${day}일`
  }
}

// 기본 export (하위 호환성)
export default now