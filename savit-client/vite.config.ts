import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  server: {
    host: '0.0.0.0', // 모든 IP에서 접근 가능
    port: 5173,
    // 선택사항: 자동으로 브라우저 열지 않기
    open: false,
    // HTTPS 설정 (Firebase Messaging 필요)
    allowedHosts: ['3db3eeb4f562.ngrok-free.app'],
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          //Vue 관련 라이브러리들
          'vue-vendor': ['vue', 'vue-router', 'pinia'],

          //UI 라이브러리
          'ui-vendor': ['oh-vue-icons', 'swiper'],

          //HTTP 클라이언트
          'http-vendor': ['axios', 'form-data'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
