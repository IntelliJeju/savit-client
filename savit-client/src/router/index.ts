import { useAuthStore } from '@/stores/auth'
import type { Card } from '@/types/card'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const MainLayout = () => import('@/layout/MainLayout.vue')

// Index
const DashBoard = () => import('@/views/DashBoard.vue')

// Auth
const Login = () => import('@/views/user/Login.vue')
const LoginCallback = () => import('@/views/user/LoginCallback.vue')
const UserPage = () => import('@/views/user/UserPage.vue')

// Card
const CardCurrent = () => import('@/views/card/CardCurrent.vue')
const CardRegister = () => import('@/views/card/CardRegister.vue')
const RegisterCallback = () => import('@/views/card/RegisterCallback.vue')
const CardUsage = () => import('@/views/card/CardUsage.vue')

// Budget
const BudgetCheck = () => import('@/views/budget/BudgetCheck.vue')
const BudgetSetting = () => import('@/views/budget/BudgetSetting.vue')
const BudgetChoice = () => import('@/views/budget/BudgetChoice.vue')
const BudgetCategorySetting = () => import('@/views/budget/BudgetCategorySetting.vue')

// Challenge
const ChallengeMain = () => import('@/views/challenge/ChallengeMain.vue')
const ChallengeCurrent = () => import('@/views/challenge/ChallengeCurrent.vue')
const ChallengeDetail = () => import('@/views/challenge/ChallengeDetail.vue')
const ChallengeStatistics = () => import('@/views/challenge/ChallengeStatistics.vue')
const ChallengeResult = () => import('@/views/challenge/ChallengeResult.vue')
const PaymentCallback = () => import('@/views/challenge/PaymentCallback.vue')

const routes: Array<RouteRecordRaw> = [
  //auth
  {
    path: '/auth/login',
    name: 'Login',
    component: Login,
    meta: {
      showNavigation: false,
      requiresAuth: false,
      showBackButton: false,
      showHeader: false,
      title: '',
    },
  },
  {
    path: '/auth/login/callback',
    name: 'LoginCallback',
    component: LoginCallback,
    meta: {
      showNavigation: false,
      requiresAuth: false,
      showBackButton: false,
      showHeader: false,
      title: '',
    },
  },

  {
    path: '/auth/mypage',
    name: 'Userpage',
    component: UserPage,
    meta: {
      showNavigation: false,
      requiresAuth: false,
      showBackButton: false,
      showHeader: false,
      title: '',
    },
  },

  //index
  {
    path: '/home',
    name: 'Dashboard',
    component: DashBoard,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: false,
      showHeader: true,
      title: '',
    },
  },

  //card
  {
    path: '/card',
    name: 'CardCurrent',
    component: CardCurrent,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: false,
      showHeader: true,
      title: '카드 사용 현황',
    },
  },
  {
    path: '/card/register',
    name: 'CardRegister',
    component: CardRegister,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      title: '카드 등록',
    },
  },
  {
    path: '/card/register/callback',
    name: 'RegisterCallback',
    component: RegisterCallback,
    meta: {
      showNavigation: false,
      requiresAuth: true,
      showBackButton: false,
      showHeader: false,
      title: '',
    },
  },
  {
    path: '/card/usage',
    name: 'CardUsage',
    component: CardUsage,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      showTitle: true,
      title: '카드 이용내역',
    },
  },
  //budget
  {
    path: '/budget',
    name: 'BudgetCheck',
    component: BudgetCheck,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: false,
      showHeader: true,
      title: '카테고리별 지출내역',
    },
  },
  {
    path: '/budget/choice',
    name: 'BudgetChoice',
    component: BudgetChoice,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      title: '예산 타입 선택',
    },
  },
  {
    path: '/budget/all',
    name: 'BudgetSetting',
    component: BudgetSetting,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      title: '전체 예산 설정',
    },
  },
  {
    path: '/budget/categories/list',
    name: 'BudgetCategorySetting',
    component: BudgetCategorySetting,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      title: '카테고리 예산 설정',
    },
  },

  //challenge
  {
    path: '/challenge',
    name: 'ChallengeMain',
    component: ChallengeMain,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: false,
      showHeader: true,
      title: '챌린지',
    },
  },
  {
    path: '/challenge/current/:id',
    name: 'ChallengeCurrent',
    component: ChallengeCurrent,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      title: '챌린지 현황',
    },
  },
  {
    path: '/challenge/detail/:id',
    name: 'ChallengeDetail',
    component: ChallengeDetail,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      title: '챌린지 상세',
    },
  },
  {
    path: '/challenge/statistics',
    name: 'ChallengeStatistics',
    component: ChallengeStatistics,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
      title: '챌린지 통계',
    },
  },
  {
    path: '/challenge/result/:id',
    name: 'ChallengeResult',
    component: ChallengeResult,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: false,
      showHeader: false,
      title: '',
    },
  },
  {
    path: '/challenge/payment/callback',
    name: 'PaymentCallback',
    component: PaymentCallback,
    meta: {
      showNavigation: false,
      requiresAuth: true,
      showBackButton: false,
      showHeader: false,
      title: '',
    },
  },
  // 404 페이지 - 존재하지 않는 모든 경로를 /home으로 리다이렉트
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 기본값 설정
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  // localhost에서는 인증 체크 건너뛰기
  // if (isLocalhost) {
  //   next()
  //   return
  // }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/auth/login')
    return
  }

  if (to.path === '/auth/login' && authStore.isLoggedIn) {
    next('/home')
    return
  }

  // 인증된 사용자의 경우 카드 데이터 자동 로드
  if (to.meta.requiresAuth && authStore.isLoggedIn) {
    const { useCardsStore } = await import('@/stores/cards')
    const cardsStore = useCardsStore()

    await cardsStore.fetchTransactions(1, 'GET')

    // 카드 데이터가 없으면 불러오기
    if (cardsStore.cardsList.length === 0) {
      try {
        const cards = await cardsStore.fetchCards()

        const promises = cards.map((card: Card) => cardsStore.fetchTransactions(card.cardId, 'GET'))
        await Promise.allSettled(promises)
      } catch (error) {
        console.error('카드 데이터 로드 실패:', error)
        // 에러가 발생해도 페이지 이동은 계속 진행
      }
    }
  }

  next()
})

export default router
