import api from './index'

export const reviewAPI = {
  // 여행지별 리뷰 목록 조회
  async getReviewsByDestination(destinationId, params = {}) {
    try {
      const response = await api.get(`/reviews/destination/${destinationId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          sortBy: params.sortBy || 'created_at',
          sortOrder: params.sortOrder || 'DESC',
          status: params.status || 'approved'
        }
      })
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 특정 리뷰 상세 조회
  async getReview(reviewId) {
    try {
      const response = await api.get(`/reviews/${reviewId}`)
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 리뷰 작성
  async createReview(reviewData) {
    try {
      const response = await api.post('/reviews', reviewData)
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 리뷰 수정
  async updateReview(reviewId, reviewData) {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData)
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 리뷰 삭제
  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}`)
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 리뷰 도움됨 토글
  async toggleHelpful(reviewId) {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`)
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 리뷰 이미지 업로드
  async uploadReviewImages(reviewId, formData) {
    try {
      const response = await api.post(`/reviews/${reviewId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 리뷰 이미지 삭제
  async deleteReviewImage(imageId) {
    try {
      const response = await api.delete(`/reviews/images/${imageId}`)
      
      return response
    } catch (error) {
      throw error
    }
  },

  // 사용자별 리뷰 목록 조회
  async getReviewsByUser(userId, params = {}) {
    try {
      const response = await api.get(`/reviews/user/${userId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          sortBy: params.sortBy || 'created_at',
          sortOrder: params.sortOrder || 'DESC',
          status: params.status || 'approved'
        }
      })
      
      return response
    } catch (error) {
      throw error
    }
  }
}