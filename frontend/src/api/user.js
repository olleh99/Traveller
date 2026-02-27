import apiClient from './index'

export const userAPI = {
  // 프로필 조회
  async getProfile() {
    const response = await apiClient.get('/users/profile')
    return response
  },

  // 프로필 수정
  async updateProfile(profileData) {
    const response = await apiClient.put('/users/profile', profileData)
    return response
  },

  // 프로필 이미지 업로드
  async uploadProfileImage(file) {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await apiClient.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response
  },

  // 프로필 이미지 삭제
  async deleteProfileImage() {
    const response = await apiClient.delete('/users/profile/image')
    return response
  },

  // 장애인 프로필 조회
  async getDisabilityProfile() {
    const response = await apiClient.get('/users/disability-profile')
    return response.data
  },

  // 장애인 프로필 수정
  async updateDisabilityProfile(profileData) {
    const response = await apiClient.put('/users/disability-profile', profileData)
    return response
  },

  // 동행인 프로필 조회
  async getCompanionProfile() {
    const response = await apiClient.get('/users/companion-profile')
    return response.data
  },

  // 동행인 프로필 수정
  async updateCompanionProfile(profileData) {
    const response = await apiClient.put('/users/companion-profile', profileData)
    return response
  },

  // 프로필 통계 조회
  async getProfileStatistics() {
    const response = await apiClient.get('/users/profile/statistics')
    return response.data
  },

  // 최근 활동 내역 조회
  async getRecentActivities(limit = 10) {
    const response = await apiClient.get('/users/profile/activities', {
      params: { limit }
    })
    return response.data
  }
}