import axios from './index'

const favoritesAPI = {
  // 사용자별 즐겨찾기 목록 조회
  getFavoritesByUser(userId, page = 1, limit = 20) {
    return axios.get(`/favorites/user/${userId}?page=${page}&limit=${limit}`)
  },

  // 즐겨찾기 추가
  addFavorite(userId, destinationId, note = null) {
    return axios.post('/favorites', {
      user_id: userId,
      destination_id: destinationId,
      note
    })
  },

  // 즐겨찾기 제거
  removeFavorite(favoriteId) {
    return axios.delete(`/favorites/${favoriteId}`)
  },

  // 즐겨찾기 상태 확인
  checkFavoriteStatus(userId, destinationId) {
    return axios.get(`/favorites/check/${userId}/${destinationId}`)
  },

  // 즐겨찾기 토글 (추가/제거)
  toggleFavorite(userId, destinationId) {
    return axios.post('/favorites/toggle', {
      user_id: userId,
      destination_id: destinationId
    })
  }
}

export default favoritesAPI