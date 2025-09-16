<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/2bd95d83-d139-4b41-8637-3c12df2c7263" />


# 🏦 SAVIT Client

SAVIT은 개인 자산 관리 및 소비 습관 개선을 위한 스마트 가계부 애플리케이션입니다. 카드 사용 내역 추적, 예산 관리, 절약 챌린지 등의 기능을 통해 사용자의 건전한 소비 습관 형성을 지원합니다.

## 🌟 주요 기능

### 💳 카드 관리
- 실시간 카드 사용 내역 조회
- 여러 카드 등록 및 통합 관리
- 카테고리별 지출 분석
- 월별/기간별 사용량 통계

### 💰 예산 관리
- 월별 예산 설정 및 관리
- 카테고리별 세부 예산 배정
- 예산 대비 실제 지출 모니터링
- 지출 알림 및 경고 시스템

### 🏆 절약 챌린지
- 다양한 절약 목표 챌린지 참여
- 챌린지 진행 상황 실시간 추적
- 성과 기반 리워드 시스템
- 챌린지 통계 및 결과 분석

### 📊 대시보드 & 분석
- 종합 재정 상태 대시보드
- 소비 패턴 시각화
- 월별/카테고리별 지출 트렌드
- 절약 성과 리포트

## 🛠 기술 스택

### Frontend Framework
- **Vue 3** - 반응형 프론트엔드 프레임워크
- **TypeScript** - 타입 안전성 보장
- **Vite** - 빠른 개발 서버 및 빌드 도구

### 상태 관리 & 라우팅
- **Pinia** - 상태 관리 라이브러리
- **Vue Router** - 클라이언트 사이드 라우팅

### 스타일링 & UI
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Pretendard** - 한국어 최적화 폰트
- **Swiper** - 터치 슬라이더 컴포넌트
- **oh-vue-icons** - 아이콘 라이브러리

### API & 통신
- **Axios** - HTTP 클라이언트
- **Firebase** - 푸시 알림 서비스

### 결제 & 인증
- **아임포트 (iamport)** - 결제 시스템 연동

### 개발 도구
- **ESLint** - 코드 품질 검사
- **Prettier** - 코드 포맷팅
- **Vue DevTools** - 개발 디버깅

## 📁 프로젝트 구조

```
src/
├── api/                    # API 관련 설정
│   ├── axios.ts           # Axios 인스턴스 및 인터셉터
│   └── useApi.ts          # API 호출 컴포저블
├── components/            # 재사용 가능한 컴포넌트
│   ├── budget/            # 예산 관련 컴포넌트
│   ├── card/              # 카드 관련 컴포넌트
│   ├── challenge/         # 챌린지 관련 컴포넌트
│   └── ...
├── layout/                # 레이아웃 컴포넌트
├── router/                # Vue Router 설정
├── stores/                # Pinia 스토어
│   ├── auth.ts           # 인증 상태 관리
│   ├── cards.ts          # 카드 데이터 관리
│   ├── budgets.ts        # 예산 데이터 관리
│   └── challenges.ts     # 챌린지 데이터 관리
├── types/                 # TypeScript 타입 정의
├── utils/                 # 유틸리티 함수
├── views/                 # 페이지 컴포넌트
│   ├── budget/           # 예산 관리 페이지
│   ├── card/             # 카드 관리 페이지
│   ├── challenge/        # 챌린지 페이지
│   └── user/             # 사용자 관리 페이지
└── App.vue               # 루트 컴포넌트
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 22+
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   ```bash
   # .env 파일 생성 후 다음 내용 추가
   VITE_APP_API_BASE_URL=your_api_url
   VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key
   VITE_IAMPORT_CODE=your_iamport_code
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **프로덕션 빌드**
   ```bash
   npm run build
   ```

### 개발 도구

- **타입 검사**: `npm run type-check`
- **린트 검사**: `npm run lint`
- **코드 포맷팅**: `npm run format`

## 📱 주요 페이지

- **대시보드** (`/home`) - 종합 재정 상태 개요
- **카드 관리** (`/card`) - 카드 등록 및 사용 내역 조회
- **예산 관리** (`/budget`) - 예산 설정 및 지출 모니터링
- **챌린지** (`/challenge`) - 절약 챌린지 참여 및 관리
- **마이페이지** (`/auth/mypage`) - 사용자 정보 및 설정

## 🔐 인증 시스템

- JWT 기반 토큰 인증
- 자동 토큰 갱신 (Refresh Token)
- 로그인 상태 지속성 (LocalStorage)
- 보호된 라우트 가드

## 📊 상태 관리

### Auth Store
- 사용자 인증 상태
- 토큰 관리
- 사용자 정보

### Cards Store
- 등록된 카드 목록
- 카드 거래 내역
- 카드 통계 데이터

### Budgets Store
- 월별 예산 정보
- 카테고리별 예산
- 예산 대비 지출 현황

### Challenges Store
- 진행 중인 챌린지
- 챌린지 통계
- 챌린지 결과

## 🔧 개발 환경 설정

### VS Code 확장 프로그램 (권장)
- Volar (Vue 3 언어 지원)
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### 코드 스타일
- ESLint + Prettier 설정 적용
- Vue 3 Composition API 스타일 가이드 준수
- TypeScript strict 모드

## 🌐 배포

- **Vercel** - 프로덕션 배포 플랫폼
- 자동 배포 파이프라인 구성
- 환경별 설정 분리

## 📄 라이선스

이 프로젝트는 개인 프로젝트로 관리되고 있습니다.

---

**SAVIT과 함께 스마트한 자산 관리를 시작하세요! 💪**
