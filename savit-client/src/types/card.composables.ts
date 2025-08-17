// OCR 결과 타입
export interface OCRResult {
  cardNumber?: string
  confidence?: number
  [key: string]: any
}

// 카드 번호 4구역 타입
export interface CardNumberParts {
  part1: string
  part2: string
  part3: string
  part4: string
}

// 카드사 조직 타입
export interface CardOrganization {
  code: string
  name: string
}

// 카드 폼 이벤트 타입
export interface CardFormEvents {
  'update:organization': [value: string]
  'update:loginId': [value: string]
  'update:loginPw': [value: string]
  'update:birthDate': [value: string]
  cardNumberInput: [partIndex: number, event: Event]
  passwordInput: [event: Event]
  submit: []
}

// 카메라 이벤트 타입
export interface CameraEvents {
  start: []
  capture: []
  retake: []
  upload: [event: Event]
  processOCR: []
}

// 기존 타입 재export
export type { registerCardForm } from '@/types/card'
