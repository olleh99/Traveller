import apiClient from './index'

export const matchingAPI = {
  // 동행인 검색
  async searchCompanions(params = {}) {
    const response = await apiClient.get('/matching/companions/search', { params })
    return response
  },

  // 매칭 요청 생성
  async createMatchingRequest(requestData) {
    const response = await apiClient.post('/matching/requests', requestData)
    return response
  },

  // 받은 매칭 요청 목록 (동행인용)
  async getReceivedRequests(params = {}) {
    const response = await apiClient.get('/matching/requests/received', { params })
    return response
  },

  // 보낸 매칭 요청 목록 (여행자용)
  async getSentRequests(params = {}) {
    const response = await apiClient.get('/matching/requests/sent', { params })
    return response
  },

  // 매칭 요청 응답 (승인/거절)
  async respondToRequest(requestId, responseData) {
    const response = await apiClient.put(`/matching/requests/${requestId}/respond`, responseData)
    return response
  },

  // 매칭 요청 취소
  async cancelRequest(requestId) {
    const response = await apiClient.delete(`/matching/requests/${requestId}`)
    return response
  },

  // 나의 매칭 목록
  async getMyMatches(params = {}) {
    const response = await apiClient.get('/matching/matches', { params })
    return response
  },

  // 사용자 매칭 목록 (상태별)
  async getUserMatches(status = null) {
    const params = status ? { status } : {}
    const response = await apiClient.get('/matching/matches', { params })
    return response
  },

  // 매칭 요청 승인
  async approveMatchingRequest(requestId) {
    const response = await apiClient.put(`/matching/requests/${requestId}/respond`, {
      status: 'accepted',
      response_message: '매칭 요청을 승인합니다.'
    })
    return response
  },

  // 매칭 요청 거절
  async rejectMatchingRequest(requestId) {
    const response = await apiClient.put(`/matching/requests/${requestId}/respond`, {
      status: 'rejected',
      response_message: '매칭 요청을 거절합니다.'
    })
    return response
  },

  // 매칭 종료
  async endMatch(matchId) {
    const response = await apiClient.put(`/matching/matches/${matchId}/end`)
    return response
  }
}