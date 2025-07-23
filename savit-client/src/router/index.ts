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
  {
    path: '/auth',
    component: MainLayout,
    meta: { showNavigation: false, requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    meta: { showNavigation: true, requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashBoard,
      },
    ],
  },
  {
    path: '/card',
    component: MainLayout,
    meta: { showNavigation: true, requiresAuth: true },
    children: [
      {
        path: 'current',
        name: 'CardCurrent',
        component: CardCurrent,
      },
      {
        path: 'register',
        name: 'CardRegister',
        component: CardRegister,
      },
    ],
  },
  {
    path: '/budget',
    component: MainLayout,
    meta: { showNavigation: true, requiresAuth: true },
    children: [
      {
        path: 'check',
        name: 'BudgetCheck',
        component: BudgetCheck,
      },
      {
        path: 'setting',
        name: 'BudgetSetting',
        component: BudgetSetting,
      },
    ],
  },
  {
    path: '/challenge',
    component: MainLayout,
    meta: { showNavigation: true, requiresAuth: true },
    children: [
      {
        path: '',
        name: 'ChallengeMain',
        component: ChallengeMain,
      },
      {
        path: 'current',
        name: 'ChallengeCurrent',
        component: ChallengeCurrent,
      },
      {
        path: 'detail',
        name: 'ChallengeDetail',
        component: ChallengeDetail,
      },
      {
        path: 'statistics',
        name: 'ChallengeStatistics',
        component: ChallengeStatistics,
      },
      {
        path: 'result',
        name: 'ChallengeResult',
        component: ChallengeResult,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
