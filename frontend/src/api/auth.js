import api from './index'

// 인증 관련 API
export const authAPI = {
  // 이메일 중복 확인
  checkEmail: (email) => {
    return api.post('/auth/check-email', { email })
  },

  // 닉네임 중복 확인
  checkNickname: (nickname) => {
    return api.post('/auth/check-nickname', { nickname })
  },

  // 회원가입
  signup: (userData) => {
    return api.post('/auth/signup', userData)
  },

  // 로그인
  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },

  // 로그아웃
  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token')
    return api.post('/auth/logout', { refresh_token: refreshToken })
  },

  // 토큰 새로고침
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh', { refresh_token: refreshToken })
  },

  // 현재 사용자 정보 조회
  getMe: () => {
    return api.get('/auth/me')
  }
}