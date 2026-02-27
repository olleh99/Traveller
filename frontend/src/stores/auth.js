import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'
import router from '@/router'
import socketService from '@/services/socket'

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // 계산된 속성
  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)
  const userType = computed(() => user.value?.user_type || null)
  const userName = computed(() => user.value?.name || '')
  const userNickname = computed(() => user.value?.nickname || '')

  // 토큰 저장
  const saveTokens = (tokens) => {
    accessToken.value = tokens.access_token
    refreshToken.value = tokens.refresh_token
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
  }

  // 토큰 삭제
  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // 로그인
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        // 토큰 저장
        saveTokens(response.tokens)
        
        // 사용자 정보 저장
        user.value = response.user
        
        // Socket 연결
        socketService.connect()
        
        return { success: true }
      }
    } catch (err) {
      error.value = err.error || '로그인에 실패했습니다.'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      // 로그아웃 API 에러는 무시하고 계속 진행
      // (로컬 상태 정리가 더 중요함)
    } finally {
      // Socket 연결 해제
      socketService.disconnect()
      
      // 상태 초기화
      user.value = null
      clearTokens()
      
      // 다른 스토어 데이터 초기화
      const { useTravelPlanStore } = await import('./travelPlan')
      const travelPlanStore = useTravelPlanStore()
      travelPlanStore.clearAllData()
      
      // 알림 스토어 초기화
      const { useNotificationStore } = await import('./notification')
      const notificationStore = useNotificationStore()
      notificationStore.clearNotifications()
      
      // 로그인 페이지로 이동
      router.push('/login')
    }
  }

  // 회원가입
  const signup = async (userData) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authAPI.signup(userData)
      
      if (response.success) {
        return { success: true, message: response.message }
      }
    } catch (err) {
      error.value = err.error || '회원가입에 실패했습니다.'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 사용자 정보 가져오기
  let fetchUserPromise = null
  const fetchUser = async () => {
    if (!accessToken.value) return
    
    // 이미 요청 중이면 기존 Promise 반환 (중복 호출 방지)
    if (fetchUserPromise) return fetchUserPromise
    
    fetchUserPromise = (async () => {
      try {
        const response = await authAPI.getMe()
        if (response.success) {
          user.value = response.user
        }
      } catch (err) {
        // 토큰이 유효하지 않으면 로그아웃
        if (err.status === 401) {
          clearTokens()
          user.value = null
        }
      } finally {
        fetchUserPromise = null
      }
    })()
    
    return fetchUserPromise
  }

  // 이메일 중복 확인
  const checkEmail = async (email) => {
    try {
      const response = await authAPI.checkEmail(email)
      return response.available
    } catch (err) {
      return false
    }
  }

  // 닉네임 중복 확인
  const checkNickname = async (nickname) => {
    try {
      const response = await authAPI.checkNickname(nickname)
      return response.available
    } catch (err) {
      return false
    }
  }

  // 앱 시작 시 사용자 정보 로드
  const initAuth = async () => {
    if (accessToken.value) {
      await fetchUser()
      // 사용자 정보가 있으면 소켓 연결
      if (user.value) {
        socketService.connect()
      }
    }
  }
  
  // 인증 여부 확인용 getter
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const token = computed(() => accessToken.value)

  return {
    // 상태
    user,
    isLoading,
    error,
    
    // 계산된 속성
    isLoggedIn,
    userType,
    userName,
    userNickname,
    isAuthenticated,
    token,
    
    // 액션
    login,
    logout,
    signup,
    fetchUser,
    checkEmail,
    checkNickname,
    initAuth
  }
})