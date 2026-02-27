import apiClient from './index'

export const travelPlansAPI = {
  // 여행 계획 목록 조회
  async getTravelPlans(params = {}) {
    const response = await apiClient.get('/travel-plans', { params })
    return response.data
  },

  // 여행 계획 상세 조회
  async getTravelPlan(planId) {
    const response = await apiClient.get(`/travel-plans/${planId}`)
    return response.data
  },

  // 여행 계획 생성
  async createTravelPlan(planData) {
    const response = await apiClient.post('/travel-plans', planData)
    return response.data
  },

  // 여행 계획 수정
  async updateTravelPlan(planId, planData) {
    const response = await apiClient.put(`/travel-plans/${planId}`, planData)
    return response.data
  },

  // 여행 계획 삭제
  async deleteTravelPlan(planId) {
    const response = await apiClient.delete(`/travel-plans/${planId}`)
    return response.data
  },

  // 여행 계획 상태 변경
  async updatePlanStatus(planId, status) {
    const response = await apiClient.patch(`/travel-plans/${planId}/status`, { status })
    return response.data
  },

  // 여행지를 일정에 추가
  async addDestinationToPlan(planId, destinationData) {
    const response = await apiClient.post(`/travel-plans/${planId}/destinations`, destinationData)
    return response.data
  },

  // 일정에서 여행지 제거
  async removeDestinationFromPlan(planId, planDestinationId) {
    const response = await apiClient.delete(`/travel-plans/${planId}/destinations/${planDestinationId}`)
    return response.data
  },

  // 여행지 순서 변경
  async updateDestinationOrder(planId, destinations) {
    const response = await apiClient.patch(`/travel-plans/${planId}/destinations/order`, { destinations })
    return response.data
  }
}