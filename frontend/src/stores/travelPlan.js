import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { travelPlansAPI } from '@/api/travelPlans'
import { useAuthStore } from './auth'

export const useTravelPlanStore = defineStore('travelPlan', () => {
  // State
  const plans = ref([])
  const currentPlan = ref(null)
  const loading = ref(false)
  const error = ref(null)
  let lastLoadedUserId = null

  // Auth store
  const authStore = useAuthStore()

  // Getters
  const activePlans = computed(() => 
    plans.value.filter(plan => plan.status !== 'cancelled')
  )

  const draftPlans = computed(() => 
    plans.value.filter(plan => plan.status === 'draft')
  )

  const confirmedPlans = computed(() => 
    plans.value.filter(plan => plan.status === 'confirmed')
  )

  const completedPlans = computed(() => 
    plans.value.filter(plan => plan.status === 'completed')
  )

  // Actions
  const fetchUserPlans = async (userId = null, status = null) => {
    const targetUserId = userId || authStore.user?.user_id
    
    // 이미 로딩 중이면 잠시 대기
    if (loading.value) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!loading.value) {
            resolve(plans.value)
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
    }
    
    if (!targetUserId) {
      error.value = '사용자 정보가 필요합니다.'
      return []
    }

    try {
      loading.value = true
      error.value = null
      lastLoadedUserId = targetUserId
      
      const response = await travelPlansAPI.getTravelPlans({ page: 1, limit: 50, status })
      plans.value = response.data.travelPlans || []
      
      return plans.value
    } catch (err) {
      error.value = err.message || '여행 계획을 불러올 수 없습니다.'
      plans.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchPlanById = async (planId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await travelPlansAPI.getTravelPlan(planId)
      currentPlan.value = response.data
      
      return response.data
    } catch (err) {
      error.value = err.message || '여행 계획을 불러올 수 없습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  const createPlan = async (planData) => {
    try {
      loading.value = true
      error.value = null
      
      // 사용자 ID 추가
      const data = {
        ...planData,
        user_id: authStore.user?.user_id
      }
      
      const response = await travelPlansAPI.createTravelPlan(data)
      
      // 목록에 추가
      plans.value.unshift(response.data)
      currentPlan.value = response.data
      
      return response.data
    } catch (err) {
      error.value = err.message || '여행 계획 생성에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlan = async (planId, updateData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await travelPlansAPI.updateTravelPlan(planId, updateData)
      
      // 목록에서 업데이트
      const index = plans.value.findIndex(plan => plan.plan_id === planId)
      if (index !== -1) {
        plans.value[index] = { ...plans.value[index], ...response.data }
      }
      
      // 현재 계획이 업데이트된 것이면 갱신
      if (currentPlan.value?.plan_id === planId) {
        currentPlan.value = { ...currentPlan.value, ...response.data }
      }
      
      return response.data
    } catch (err) {
      error.value = err.message || '여행 계획 수정에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePlan = async (planId) => {
    try {
      loading.value = true
      error.value = null
      
      await travelPlansAPI.deleteTravelPlan(planId)
      
      // 목록에서 제거
      plans.value = plans.value.filter(plan => plan.plan_id !== planId)
      
      // 현재 계획이 삭제된 것이면 초기화
      if (currentPlan.value?.plan_id === planId) {
        currentPlan.value = null
      }
      
      return true
    } catch (err) {
      error.value = err.message || '여행 계획 삭제에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addDestinationToDay = async (dayId, destinationData) => {
    try {
      const response = await travelPlanAPI.addDestinationToDay(dayId, destinationData)
      
      // 현재 계획이 있으면 업데이트
      if (currentPlan.value) {
        const day = currentPlan.value.days?.find(d => d.day_id === dayId)
        if (day) {
          if (!day.destinations) day.destinations = []
          day.destinations.push(response.data)
        }
      }
      
      return response.data
    } catch (err) {
      error.value = err.message || '여행지 추가에 실패했습니다.'
      throw err
    }
  }

  const removeDestinationFromDay = async (planDestinationId) => {
    try {
      await travelPlanAPI.removeDestinationFromDay(planDestinationId)
      
      // 현재 계획에서 제거
      if (currentPlan.value?.days) {
        currentPlan.value.days.forEach(day => {
          if (day.destinations) {
            day.destinations = day.destinations.filter(
              dest => dest.plan_destination_id !== planDestinationId
            )
          }
        })
      }
      
      return true
    } catch (err) {
      error.value = err.message || '여행지 제거에 실패했습니다.'
      throw err
    }
  }

  const reorderDestinations = async (dayId, destinations) => {
    try {
      await travelPlanAPI.reorderDestinations(dayId, destinations)
      
      // 현재 계획에서 순서 업데이트
      if (currentPlan.value) {
        const day = currentPlan.value.days?.find(d => d.day_id === dayId)
        if (day && day.destinations) {
          // 새로운 순서대로 정렬
          const orderedDestinations = destinations
            .sort((a, b) => a.order_index - b.order_index)
            .map(dest => 
              day.destinations.find(d => d.plan_destination_id === dest.plan_destination_id)
            )
            .filter(Boolean)
          
          day.destinations = orderedDestinations
        }
      }
      
      return true
    } catch (err) {
      error.value = err.message || '여행지 순서 변경에 실패했습니다.'
      throw err
    }
  }

  const updatePlanDestination = async (planDestinationId, updateData) => {
    try {
      const response = await travelPlanAPI.updatePlanDestination(planDestinationId, updateData)
      
      // 현재 계획에서 업데이트
      if (currentPlan.value?.days) {
        currentPlan.value.days.forEach(day => {
          if (day.destinations) {
            const index = day.destinations.findIndex(
              dest => dest.plan_destination_id === planDestinationId
            )
            if (index !== -1) {
              day.destinations[index] = response.data
            }
          }
        })
      }
      
      return response.data
    } catch (err) {
      error.value = err.message || '여행지 정보 수정에 실패했습니다.'
      throw err
    }
  }

  const updatePlanDay = async (dayId, updateData) => {
    try {
      const response = await travelPlanAPI.updatePlanDay(dayId, updateData)
      
      // 현재 계획에서 업데이트
      if (currentPlan.value?.days) {
        const index = currentPlan.value.days.findIndex(day => day.day_id === dayId)
        if (index !== -1) {
          currentPlan.value.days[index] = { ...currentPlan.value.days[index], ...response.data }
        }
      }
      
      return response.data
    } catch (err) {
      error.value = err.message || '일차 정보 수정에 실패했습니다.'
      throw err
    }
  }

  // Clear functions
  const clearCurrentPlan = () => {
    currentPlan.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const clearAllData = () => {
    plans.value = []
    currentPlan.value = null
    error.value = null
    loading.value = false
    lastLoadedUserId = null
  }

  return {
    // State
    plans,
    currentPlan,
    loading,
    error,
    
    // Getters
    activePlans,
    draftPlans,
    confirmedPlans,
    completedPlans,
    
    // Actions
    fetchUserPlans,
    fetchPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    addDestinationToDay,
    removeDestinationFromDay,
    reorderDestinations,
    updatePlanDestination,
    updatePlanDay,
    clearCurrentPlan,
    clearError,
    clearAllData
  }
})