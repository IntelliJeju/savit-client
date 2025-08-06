import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import type {
  availChallengeList,
  Challenge,
  ParticipatingChallenge,
  ParticipatingChallengeDetail,
} from '@/types/challenges'

export const useChallengeStore = defineStore('challenge', () => {
  const { request, loading } = useApi()

  const availChallengeList = ref<availChallengeList[]>([])
  const availChallengeDetailMap = ref(new Map<number, Challenge>())
  const participatingChallengeList = ref<ParticipatingChallenge[]>([])
  const participatingChallengeDetailList = ref<ParticipatingChallengeDetail[]>([])


  const fetchAvailChallengeList = async () => {
    try {
      const res = await request({ method: 'GET', url: '/challenge/available' })
      console.log(res)
      availChallengeList.value = res
    } catch (err) {
      console.error('fetchAvailChallengeList error: ', err)
      throw err
    }
  }

  const fetchAvailChallengeDetail = async (id: number) => {
    if (!availChallengeDetailMap.value.has(id)) {
      try {
        const res = await request({ method: 'GET', url: `/challenge/available/${id}` })
        console.log(res)
        availChallengeDetailMap.value.set(id, res)
      } catch (err) {
        console.error('fetchAvailChallengeDetail error: ', err)
        throw err
      }
    }
  }

  const fetchParticipateChallenges = async () => {
    try {
      const res = await request({ method: 'GET', url: '/challenge/participating' })
      console.log(res)
      participatingChallengeList.value = res
    } catch (err) {
      console.error('fetchParticipateChallenges error: ', err)
      throw err
    }
  }

  const fetchParticipateChallengeDetail = async (id: number) => {
    try {
      const existingIndex = participatingChallengeDetailList.value.findIndex(
        item => item.challengeId === id
      )
      
      const res = await request({ method: 'GET', url: `/challenge/participating/${id}` })
      console.log(res)
      
      const challengeDetail = { challengeId: id, ...res }
      
      if (existingIndex >= 0) {
        participatingChallengeDetailList.value[existingIndex] = challengeDetail
      } else {
        participatingChallengeDetailList.value.push(challengeDetail)
      }
    } catch (err) {
      console.error('fetchParticipateChallengeDetail error: ', err)
      throw err
    }
  }

  const joinChallenge = async (id: number) => {
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

  const getChallengeById = computed(() => (id: number) => {
    return availChallengeDetailMap.value.get(id)
  })

  const getParticipatingChallengeList = computed(() => participatingChallengeList.value)

  const getParticipatingChallengeDetailById = computed(() => (id: number) => {
    return participatingChallengeDetailList.value.find(item => item.challengeId === id)
  })

  const getParticipatingChallengeDetailList = computed(() => participatingChallengeDetailList.value)

  return {
    //fetch
    fetchAvailChallengeList,
    fetchAvailChallengeDetail,
    fetchParticipateChallenges,
    fetchParticipateChallengeDetail,
    joinChallenge,

    //computed
    getChallengeById,
    getParticipatingChallengeList,
    getParticipatingChallengeDetailById,
    getParticipatingChallengeDetailList,

    //ref
    participatingChallengeDetailList,
    availChallengeList,
    loading,
  }
})
