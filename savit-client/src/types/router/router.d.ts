import 'vue-router'

//router meta 데이터 타입 지정
declare module 'vue-router' {
  interface RouteMeta {
    showNavigation: boolean
    showBackButton: boolean
    showHeader: boolean
    requiresAuth: boolean
    title: string
  }
}
