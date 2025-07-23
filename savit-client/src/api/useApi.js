import { ref } from 'vue'
import apiClient from '@/api/axios'

// 사용법
// request({
//     method: 'POST'
//     url:,
//     data:,
// })

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const request = async (config) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient(config)
      return response.data
    } catch (err) {
      error.value = err
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
