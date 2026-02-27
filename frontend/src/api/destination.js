import api from './index'

/**
 * 여행지 관련 API 모듈
 */
export const destinationAPI = {
  /**
   * 여행지 목록 조회
   * @param {Object} params - 쿼리 파라미터
   * @param {number} params.page - 페이지 번호 (기본값: 1)
   * @param {number} params.limit - 페이지당 항목 수 (기본값: 10)
   * @param {string} params.category - 카테고리 필터
   * @param {string} params.region - 지역 필터
   * @param {string} params.search - 검색 키워드
   * @returns {Promise} 여행지 목록 데이터
   */
  async getDestinations(params = {}) {
    try {
      const response = await api.get('/destinations', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 여행지 상세 조회
   * @param {string} id - 여행지 ID
   * @returns {Promise} 여행지 상세 데이터
   */
  async getDestination(id) {
    try {
      const response = await api.get(`/destinations/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 여행지 등록 (인증 필요)
   * @param {Object} destinationData - 여행지 정보
   * @returns {Promise} 등록된 여행지 데이터
   */
  async createDestination(destinationData) {
    try {
      const response = await api.post('/destinations', destinationData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 여행지 수정 (인증 필요)
   * @param {string} id - 여행지 ID
   * @param {Object} destinationData - 수정할 여행지 정보
   * @returns {Promise} 수정된 여행지 데이터
   */
  async updateDestination(id, destinationData) {
    try {
      const response = await api.put(`/destinations/${id}`, destinationData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 여행지 삭제 (인증 필요)
   * @param {string} id - 여행지 ID
   * @returns {Promise} 삭제 결과
   */
  async deleteDestination(id) {
    try {
      const response = await api.delete(`/destinations/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 추천 여행지 조회 (홈페이지용)
   * @param {number} limit - 조회할 개수 (기본값: 6)
   * @returns {Promise} 추천 여행지 목록
   */
  async getRecommendedDestinations(limit = 6) {
    try {
      const response = await api.get('/destinations', {
        params: {
          limit,
          page: 1,
          sort: 'recommended' // 백엔드에서 추천 로직 구현 필요
        }
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default destinationAPI