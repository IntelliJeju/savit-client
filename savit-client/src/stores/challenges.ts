import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '@/api/useApi'
import type {
  availChallengeList,
  Challenge,
  ParticipatingChallenge,
  ParticipatingChallengeDetail,
  Statistics,
} from '@/types/challenges'

export const useChallengeStore = defineStore('challenge', () => {
  const { request, loading } = useApi()

  //data
  const availChallengeList = ref<availChallengeList[]>([])
  const availChallengeDetailList = ref(new Map<number, Challenge>())
  const participatingChallengeList = ref<ParticipatingChallenge[]>([])
  const participatingChallengeDetailList = ref(new Map<number, ParticipatingChallengeDetail>())
  const challengeStatistics = ref<Statistics[]>([])

  //fetch
  const fetchAvailChallengeList = async () => {
    try {
      const res = await request({ method: 'GET', url: '/challenge/available' })
      availChallengeList.value = res
    } catch (err) {
      console.error('fetchAvailChallengeList error: ', err)
      throw err
    }
  }

  const fetchAvailChallengeDetail = async (id: number, opts?: { force?: boolean }) => {
    const force = !!opts?.force

    if (!force && availChallengeDetailList.value.has(id)) return

    try {
      const res = await request({ method: 'GET', url: `/challenge/available/${id}` })
      availChallengeDetailList.value.set(id, res)
    } catch (err) {
      console.error('fetchAvailChallengeDetail error: ', err)
      throw err
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
      const res = await request({ method: 'GET', url: `/challenge/participating/${id}` })
      console.log('participants detail: ', res)

      const challengeDetail = { challengeId: id, ...res }
      participatingChallengeDetailList.value.set(id, challengeDetail)
    } catch (err) {
      console.error('fetchParticipateChallengeDetail error: ', err)
      throw err
    }
  }

  const fetchChallengeStatistics = async () => {
    try {
      const res = await request({ method: 'GET', url: '/challenge/stats' })
      console.log(res)
      challengeStatistics.value = res
    } catch (err) {
      console.error('fetchChallengeStatistics error: ', err)
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

  //computed
  const getChallengeById = computed(() => (id: number) => {
    return availChallengeDetailList.value.get(id)
  })

  const getParticipatingChallengeList = computed(() => {
    return participatingChallengeList.value
  })

  const getParticipatingChallengeDetailById = computed(() => (id: number) => {
    return participatingChallengeDetailList.value.get(id)
  })

  const getParticipatingChallengeDetailList = computed(() =>
    Array.from(participatingChallengeDetailList.value.values()),
  )

  const getChallengeStatistics = computed(() => challengeStatistics.value)

  const getChallengeStatisticsById = computed(
    () => (id: number) =>
      challengeStatistics.value.filter((challenge) => challenge.challengeId === id)[0],
  )

  return {
    //fetch
    fetchAvailChallengeList,
    fetchAvailChallengeDetail,
    fetchParticipateChallenges,
    fetchParticipateChallengeDetail,
    fetchChallengeStatistics,
    joinChallenge,

    //computed
    getChallengeById,
    getParticipatingChallengeList,
    getParticipatingChallengeDetailById,
    getParticipatingChallengeDetailList,
    getChallengeStatistics,
    getChallengeStatisticsById,

    //ref
    participatingChallengeDetailList,
    availChallengeList,
    loading,
  }
})
