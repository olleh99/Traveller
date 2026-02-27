import { defineStore } from 'pinia'
import { userAPI } from '@/api/user'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    disabilityProfile: null,
    companionProfile: null,
    isLoading: false,
    error: null
  }),

  getters: {
    hasProfile: (state) => !!state.profile,
    hasDisabilityProfile: (state) => !!state.disabilityProfile,
    hasCompanionProfile: (state) => !!state.companionProfile,
    isDisabledTraveler: (state) => state.profile?.user_type === 'disabled_traveler',
    isCompanion: (state) => state.profile?.user_type === 'companion',
    profileImageUrl: (state) => {
      if (state.profile?.profile_image_url) {
        return `${import.meta.env.VITE_API_BASE_URL}${state.profile.profile_image_url}`
      }
      return null
    }
  },

  actions: {
    // 프로필 조회
    async fetchProfile() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await userAPI.getProfile()
        
        if (!response) {
          throw new Error('API 응답이 없습니다.')
        }
        
        // API 응답 구조에 따라 데이터 추출
        const userData = response.data || response
        
        if (!userData) {
          throw new Error('사용자 데이터가 없습니다.')
        }
        
        this.profile = userData
        
        // 장애인/동행인 프로필도 함께 로드 (안전하게)
        this.disabilityProfile = userData.disabilityProfile || null
        this.companionProfile = userData.companionProfile || null
        
        return userData
      } catch (error) {
        this.error = error.response?.data?.error || '프로필을 불러오는데 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 프로필 수정
    async updateProfile(profileData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await userAPI.updateProfile(profileData)
        this.profile = { ...this.profile, ...response.data }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '프로필 수정에 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 프로필 이미지 업로드
    async uploadProfileImage(file) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await userAPI.uploadProfileImage(file)
        if (this.profile) {
          this.profile.profile_image_url = response.data.profile_image_url
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '이미지 업로드에 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 프로필 이미지 삭제
    async deleteProfileImage() {
      this.isLoading = true
      this.error = null
      
      try {
        await userAPI.deleteProfileImage()
        if (this.profile) {
          this.profile.profile_image_url = null
        }
      } catch (error) {
        this.error = error.response?.data?.error || '이미지 삭제에 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 장애인 프로필 조회
    async fetchDisabilityProfile() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await userAPI.getDisabilityProfile()
        this.disabilityProfile = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '장애인 프로필을 불러오는데 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 장애인 프로필 수정
    async updateDisabilityProfile(profileData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await userAPI.updateDisabilityProfile(profileData)
        this.disabilityProfile = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '장애인 프로필 수정에 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 동행인 프로필 조회
    async fetchCompanionProfile() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await userAPI.getCompanionProfile()
        this.companionProfile = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '동행인 프로필을 불러오는데 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 동행인 프로필 수정
    async updateCompanionProfile(profileData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await userAPI.updateCompanionProfile(profileData)
        this.companionProfile = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || '동행인 프로필 수정에 실패했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 상태 초기화
    clearProfile() {
      this.profile = null
      this.disabilityProfile = null
      this.companionProfile = null
      this.error = null
    }
  }
})