import { ref, readonly, onUnmounted } from 'vue'

/**
 * 카메라 관련 기능을 관리하는 컴포저블
 * - 카메라 시작/중지
 * - 사진 촬영
 * - 권한 관리
 * - 미디어 스트림 관리
 */
export function useCamera() {
  // 상태 관리
  const showCamera = ref(false)
  const capturedImage = ref<string | null>(null)
  const videoElement = ref<HTMLVideoElement | null>(null)
  const mediaStream = ref<MediaStream | null>(null)
  const isStartingCamera = ref(false)

  /**
   * 카메라 시작
   */
  const startCamera = async (): Promise<void> => {
    if (isStartingCamera.value) return
    
    isStartingCamera.value = true
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라 우선
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      mediaStream.value = stream
      showCamera.value = true
      
      // 비디오 엘리먼트에 스트림 연결
      if (videoElement.value) {
        videoElement.value.srcObject = stream
      }
    } catch (error: any) {
      console.error('카메라 접근 실패:', error)
      showCamera.value = false
      
      let errorMessage = '카메라 접근에 실패했습니다.'
      if (error.name === 'NotAllowedError') {
        errorMessage = '카메라 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해주세요.'
      }
      alert(errorMessage)
      throw error
    } finally {
      isStartingCamera.value = false
    }
  }

  /**
   * 사진 촬영
   */
  const capturePhoto = (): string | null => {
    if (!videoElement.value) return null
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) return null
    
    // 캔버스 크기를 비디오 크기에 맞춤
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    
    // 비디오 프레임을 캔버스에 그리기
    context.drawImage(videoElement.value, 0, 0)
    
    // 이미지 데이터 URL 생성
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    capturedImage.value = imageDataUrl
    
    // 카메라 중지
    stopCamera()
    
    return imageDataUrl
  }

  /**
   * 다시 촬영
   */
  const retakePhoto = async (): Promise<void> => {
    capturedImage.value = null
    await startCamera()
  }

  /**
   * 카메라 중지
   */
  const stopCamera = (): void => {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop())
      mediaStream.value = null
    }
    showCamera.value = false
  }

  /**
   * capturedImage 직접 설정 (갤러리 이미지용)
   */
  const setCapturedImage = (imageUrl: string): void => {
    capturedImage.value = imageUrl
  }

  /**
   * 컴포넌트 언마운트 시 정리
   */
  onUnmounted(() => {
    stopCamera()
  })

  return {
    // 상태
    showCamera: readonly(showCamera),
    capturedImage: readonly(capturedImage),
    videoElement,
    isStartingCamera: readonly(isStartingCamera),
    
    // 메서드
    startCamera,
    capturePhoto,
    retakePhoto,
    stopCamera,
    setCapturedImage
  }
}