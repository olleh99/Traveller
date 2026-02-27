import api from './index'

const travelPlanAPI = {
  // 사용자의 여행 계획 목록 조회
  getTravelPlansByUser(userId, page = 1, limit = 10, status = null) {
    const params = new URLSearchParams({ page, limit })
    if (status) params.append('status', status)
    return api.get(`/travel-plans/user/${userId}?${params}`)
  },

  // 여행 계획 상세 조회
  getTravelPlanById(planId) {
    return api.get(`/travel-plans/${planId}`)
  },

  // 새 여행 계획 생성
  createTravelPlan(planData) {
    return api.post('/travel-plans', planData)
  },

  // 여행 계획 수정
  updateTravelPlan(planId, updateData) {
    return api.put(`/travel-plans/${planId}`, updateData)
  },

  // 여행 계획 삭제
  deleteTravelPlan(planId) {
    return api.delete(`/travel-plans/${planId}`)
  },

  // 일차에 여행지 추가
  addDestinationToDay(dayId, destinationData) {
    return api.post(`/travel-plans/days/${dayId}/destinations`, destinationData)
  },

  // 일차에서 여행지 제거
  removeDestinationFromDay(planDestinationId) {
    return api.delete(`/travel-plans/destinations/${planDestinationId}`)
  },

  // 여행지 순서 변경
  reorderDestinations(dayId, destinations) {
    return api.put(`/travel-plans/days/${dayId}/reorder`, { destinations })
  },

  // 여행지 세부 정보 수정
  updatePlanDestination(planDestinationId, updateData) {
    return api.put(`/travel-plans/destinations/${planDestinationId}`, updateData)
  },

  // 일차별 정보 수정
  updatePlanDay(dayId, updateData) {
    return api.put(`/travel-plans/days/${dayId}`, updateData)
  }
}

export default travelPlanAPI