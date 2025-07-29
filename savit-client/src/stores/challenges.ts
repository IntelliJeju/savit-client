import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import type { availChallengeList, Challenge } from '@/types/challenges'

export const useChallengeStore = defineStore('challenge', () => {
  const { request, loading } = useApi()

  const availChallengeList = ref<availChallengeList[]>([])
  const availChallengeDetailMap = ref(new Map<string, Challenge>())

  const availDummy = [
    {
      id: '1',
      title: '카페 월 10회 이하 챌린지',
      startDate: '2025-08-01',
      endDate: '2025-08-31',
      categoryName: '카페',
    },
    {
      id: '2',
      title: '배달음식 월 5회 이하 챌린지',
      startDate: '2025-08-01',
      endDate: '2025-08-31',
      categoryName: '배달',
    },
    {
      id: '3',
      title: '쇼핑 월 20만원 이하 챌린지',
      startDate: '2025-08-01',
      endDate: '2025-08-31',
      categoryName: '쇼핑',
    },
  ]

  const detailDummy = {
    title: '커피 끊기 챌린지',
    description: '한 달간 커피값 줄이기',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    entryFee: 5000,
    targetCount: 20,
    targetAmount: 0,
    type: 'COUNT', // COUNT / AMOUNT
    joined_count: 100,
  }

  const getAvailChallengeList = async () => {
    try {
      //   const res = await request({ method: 'GET', url: '/challenge' })
      const res = availDummy
      availChallengeList.value = res
    } catch (err) {
      console.error('getAvailChallengeList error: ', err)
      throw err
    }
  }

  const getAvailChallengeDetail = async (id: string) => {
    if (!availChallengeDetailMap.value.has(id)) {
      try {
        // const res = await request({ method: 'GET', url: `/challenges/${id}` })
        const res = detailDummy
        availChallengeDetailMap.value.set(id, res)
      } catch (err) {
        console.error('getAvailChallengeDetail error: ', err)
        throw err
      }
    }
  }

  const joinChallenge = async (id: string) => {
    try {
      //   const res = await request({ method: 'POST', url: `/challenges/${id}/join` })
      const res = true
      if (res) {
        return true
      }
    } catch (err) {
      console.error('joinChallenge error: ', err)
      throw err
    }
  }

  const getChallengeById = (id: string) => {
    return availChallengeDetailMap.value.get(id)
  }

  return {
    getAvailChallengeList,
    getAvailChallengeDetail,
    joinChallenge,
    getChallengeById,
    availChallengeList,
    loading,
  }
})
