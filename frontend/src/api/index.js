import axios from 'axios'

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // CORS 인증 정보 포함
})

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 토큰 갱신 중인지 여부
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 응답 인터셉터 - 에러 처리 및 토큰 자동 갱신
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config
    
    if (error.response) {
      // 401 Unauthorized - 토큰 만료
      if (error.response.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // 이미 토큰 갱신 중이면 대기열에 추가
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }).catch(err => {
            return Promise.reject(err)
          })
        }
        
        originalRequest._retry = true
        isRefreshing = true
        
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (refreshToken) {
          try {
            // 토큰 갱신 시도
            const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
            
            if (response.success) {
              const { access_token, refresh_token: newRefreshToken } = response.tokens
              localStorage.setItem('access_token', access_token)
              localStorage.setItem('refresh_token', newRefreshToken)
              
              // 대기 중인 요청들 처리
              processQueue(null, access_token)
              
              // 원래 요청 재시도
              originalRequest.headers.Authorization = `Bearer ${access_token}`
              return api(originalRequest)
            }
          } catch (refreshError) {
            processQueue(refreshError, null)
            // 리프레시 토큰도 만료된 경우
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        } else {
          // 리프레시 토큰이 없으면 로그인 페이지로
          window.location.href = '/login'
        }
      }
      
      // 에러 메시지 반환
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

export default api