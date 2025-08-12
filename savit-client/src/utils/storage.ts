/**
 * LocalStorage Utility Functions
 * LocalStorage 관련 유틸리티 함수들
 */

/**
 * LocalStorage에 데이터 저장
 */
export const saveToStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

/**
 * LocalStorage에서 데이터 로드
 */
export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return null
  }
}