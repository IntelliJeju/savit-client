import { ref } from 'vue'
import apiClient from '@/api/axios'
import type { AxiosRequestConfig } from 'axios'

// 사용법
// request({
//     method: 'POST'
//     url:,
//     data:,
// })

export function useApi() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const request = async (config: AxiosRequestConfig) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient(config)
      return response.data
    } catch (err) {
      if (err instanceof Error) {
        error.value = err
      } else {
        error.value = new Error(String(err))
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    request,
  }
}
