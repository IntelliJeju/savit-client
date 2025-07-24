import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const MainLayout = () => import('@/layout/MainLayout.vue')

// Index
const DashBoard = () => import('@/views/DashBoard.vue')

// Auth
const Login = () => import('@/views/user/Login.vue')

// Card
const CardCurrent = () => import('@/views/card/CardCurrent.vue')
const CardRegister = () => import('@/views/card/CardRegister.vue')
const CardUsage = () => import('@/views/card/CardUsage.vue')

// Budget
const BudgetCheck = () => import('@/views/budget/BudgetCheck.vue')
const BudgetSetting = () => import('@/views/budget/BudgetSetting.vue')

// Challenge
const ChallengeMain = () => import('@/views/challenge/ChallengeMain.vue')
const ChallengeCurrent = () => import('@/views/challenge/ChallengeCurrent.vue')
const ChallengeDetail = () => import('@/views/challenge/ChallengeDetail.vue')
const ChallengeStatistics = () => import('@/views/challenge/ChallengeStatistics.vue')
const ChallengeResult = () => import('@/views/challenge/ChallengeResult.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
  },
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
    path: '/card/usage',
    name: 'CardUsage',
    component: CardUsage,
    meta: {
      showNavigation: true,
      requiresAuth: true,
      showBackButton: true,
      showHeader: true,
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
      title: '카테고리별 지출',
    },
  },
  {
    path: '/budget/setting',
    name: 'BudgetSetting',
    component: BudgetSetting,
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
    path: '/challenge/current',
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
    path: '/challenge/detail',
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
    path: '/challenge/result',
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 기본값 설정
router.beforeEach((to, from, next) => {
  if (!to.meta.hasOwnProperty('showNavigation')) {
    to.meta.showNavigation = true
  }
  if (!to.meta.hasOwnProperty('showBackButton')) {
    to.meta.showBackButton = false
  }
  if (!to.meta.hasOwnProperty('requiresAuth')) {
    to.meta.requiresAuth = true
  }
  if (!to.meta.hasOwnProperty('showHeader')) {
    to.meta.showHeader = true
  }
  if (!to.meta.hasOwnProperty('title')) {
    to.meta.title = ''
  }
  next()
})

export default router
