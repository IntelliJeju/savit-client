import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const MainLayout = () => import('@/layout/MainLayout.vue')

// Index
const DashBoard = () => import('@/views/DashBoard.vue')

// Auth
const Login = () => import('@/views/user/Login.vue')

// Card
const CardCurrent = () => import('@/views/card/CardCurrent.vue')
const CardRegister = () => import('@/views/card/CardRegister.vue')

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
  //auth
  {
    path: '/auth/login',
    name: 'Login',
    component: Login,
    meta: { showNavigation: false, requiresAuth: false, showBackButton: false },
  },

  //index
  {
    path: '/',
    name: 'Dashboard',
    component: DashBoard,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },

  //card
  {
    path: '/card/current',
    name: 'CardCurrent',
    component: CardCurrent,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },
  {
    path: '/card/register',
    name: 'CardRegister',
    component: CardRegister,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },

  //budget
  {
    path: '/budget/check',
    name: 'BudgetCheck',
    component: BudgetCheck,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },
  {
    path: '/budget/setting',
    name: 'BudgetSetting',
    component: BudgetSetting,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },

  //challenge
  {
    path: '/challenge',
    name: 'ChallengeMain',
    component: ChallengeMain,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },
  {
    path: '/challenge/current',
    name: 'ChallengeCurrent',
    component: ChallengeCurrent,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },
  {
    path: '/challenge/detail',
    name: 'ChallengeDetail',
    component: ChallengeDetail,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },
  {
    path: '/challenge/statistics',
    name: 'ChallengeStatistics',
    component: ChallengeStatistics,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },
  {
    path: '/challenge/result',
    name: 'ChallengeResult',
    component: ChallengeResult,
    meta: { showNavigation: true, requiresAuth: true, showBackButton: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
