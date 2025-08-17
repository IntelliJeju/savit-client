import { ref, readonly } from 'vue'
import { useApi } from '@/api/useApi'
import type { OCRResult } from '@/types/card.composables'

/**
 * OCR 관련 기능을 관리하는 컴포저블
 * - 이미지 업로드 처리
 * - OCR API 호출
 * - 결과 파싱 및 상태 관리
 */
export function useOCR() {
  const { request } = useApi()

  // 상태 관리
  const selectedImage = ref<File | null>(null)
  const imagePreview = ref<string | null>(null)
  const ocrResult = ref<OCRResult | null>(null)
  const isProcessingOCR = ref(false)

  /**
   * 이미지 파일 업로드 처리 (갤러리에서 선택)
   */
  const handleImageUpload = (event: Event): string | null => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return null

    selectedImage.value = file

    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      imagePreview.value = result
    }
    reader.readAsDataURL(file)

    // 기존 OCR 결과 초기화
    ocrResult.value = null

    return URL.createObjectURL(file)
  }

  /**
   * OCR 처리 (촬영된 이미지 또는 업로드된 파일)
   */
  const processOCR = async (capturedImageUrl?: string): Promise<OCRResult> => {
    if (!capturedImageUrl && !selectedImage.value) {
      throw new Error('처리할 이미지가 없습니다.')
    }

    isProcessingOCR.value = true

    try {
      const formData = new FormData()

      if (selectedImage.value) {
        // 파일에서 선택한 경우
        formData.append('cardImage', selectedImage.value)
      } else if (capturedImageUrl) {
        // 카메라에서 촬영한 경우 - Data URL을 Blob으로 변환
        const response = await fetch(capturedImageUrl)
        const blob = await response.blob()
        formData.append('cardImage', blob, 'card.jpg')
      }

      const result = await request({
        method: 'POST',
        url: '/cards/ocr',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      ocrResult.value = result
      return result
    } catch (error) {
      console.error('OCR 처리 실패:', error)
      throw new Error('카드 정보 인식에 실패했습니다. 다시 시도해주세요.')
    } finally {
      isProcessingOCR.value = false
    }
  }

  /**
   * OCR 결과 초기화
   */
  const clearOCRResult = (): void => {
    ocrResult.value = null
    selectedImage.value = null
    imagePreview.value = null
  }

  return {
    // 상태
    imagePreview: readonly(imagePreview),
    ocrResult: readonly(ocrResult),
    isProcessingOCR: readonly(isProcessingOCR),

    // 메서드
    handleImageUpload,
    processOCR,
    clearOCRResult,
  }
}
