import api from './index'

export const messagesApi = {
  // 매칭별 메시지 목록 조회
  async getMessages(matchId, page = 1, limit = 50) {
    const response = await api.get(`/messages/match/${matchId}`, {
      params: { page, limit }
    })
    return response
  },

  // 메시지 전송
  async sendMessage(matchId, content, messageType = 'text') {
    const response = await api.post(`/messages/match/${matchId}`, {
      content,
      message_type: messageType
    })
    return response
  },

  // 메시지 삭제
  async deleteMessage(messageId) {
    const response = await api.delete(`/messages/${messageId}`)
    return response
  },

  // 읽지 않은 메시지 수 조회
  async getUnreadCount(matchId) {
    const response = await api.get(`/messages/match/${matchId}/unread`)
    return response
  },

  // 모든 매칭의 읽지 않은 메시지 수 조회
  async getAllUnreadCounts() {
    const response = await api.get('/messages/unread-counts')
    return response
  },

  // 메시지 검색
  async searchMessages(matchId, query, page = 1, limit = 20) {
    const response = await api.get(`/messages/match/${matchId}/search`, {
      params: { query, page, limit }
    })
    return response
  }
}