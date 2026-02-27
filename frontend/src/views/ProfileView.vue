<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- 프로필 헤더 -->
      <v-col cols="12">
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <!-- 프로필 이미지 -->
              <v-avatar size="120" class="me-6">
                <v-img
                  v-if="profileStore.profileImageUrl"
                  :src="profileStore.profileImageUrl"
                  :alt="`${profile?.name || '사용자'}님의 프로필 사진`"
                />
                <v-icon v-else size="60" color="grey-lighten-1">
                  mdi-account-circle
                </v-icon>
              </v-avatar>

              <!-- 기본 정보 -->
              <div class="flex-grow-1">
                <h1 class="text-h4 mb-2">
                  {{ profile?.name || '이름 없음' }}
                  <v-chip
                    :color="getUserTypeColor(profile?.user_type)"
                    class="ms-2"
                    size="small"
                  >
                    {{ getUserTypeText(profile?.user_type) }}
                  </v-chip>
                </h1>
                <p class="text-h6 text-medium-emphasis mb-1">{{ profile?.nickname }}</p>
                <p class="text-body-1 text-medium-emphasis mb-3">
                  {{ profile?.email }}
                </p>
                <div class="d-flex gap-2">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="editProfile"
                  >
                    <v-icon start>mdi-pencil</v-icon>
                    프로필 수정
                  </v-btn>
                  <v-btn
                    v-if="profileStore.isDisabledTraveler"
                    color="secondary"
                    variant="outlined"
                    @click="editDisabilityProfile"
                  >
                    <v-icon start>mdi-account-details</v-icon>
                    장애 정보 관리
                  </v-btn>
                  <v-btn
                    v-if="profileStore.isCompanion"
                    color="secondary"
                    variant="outlined"
                    @click="editCompanionProfile"
                  >
                    <v-icon start>mdi-account-heart</v-icon>
                    동행인 정보 관리
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 활동 대시보드 -->
      <v-col cols="12">
        <ActivityDashboard 
          :statistics="profileStatistics"
          @refresh-statistics="loadProfileStatistics"
        />
      </v-col>

      <!-- 상세 정보 카드들 -->
      <v-col cols="12" md="6">
        <!-- 기본 정보 카드 -->
        <v-card elevation="1" class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-account</v-icon>
            기본 정보
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-phone</v-icon>
                </template>
                <v-list-item-title>전화번호</v-list-item-title>
                <v-list-item-subtitle>
                  {{ profile?.phone || '등록되지 않음' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-calendar</v-icon>
                </template>
                <v-list-item-title>생년월일</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(profile?.birth_date) || '등록되지 않음' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-human-male-female</v-icon>
                </template>
                <v-list-item-title>성별</v-list-item-title>
                <v-list-item-subtitle>
                  {{ getGenderText(profile?.gender) || '등록되지 않음' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-map-marker</v-icon>
                </template>
                <v-list-item-title>거주지</v-list-item-title>
                <v-list-item-subtitle>
                  {{ getLocation(profile) || '등록되지 않음' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <!-- 장애인 프로필 카드 -->
        <v-card
          v-if="profileStore.isDisabledTraveler"
          elevation="1"
          class="mb-4"
        >
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-account-details</v-icon>
            장애 정보
          </v-card-title>
          <v-card-text>
            <div v-if="disabilityProfile">
              <div v-if="disabilityProfile.disability_types?.length" class="mb-3">
                <h4 class="mb-2">장애 유형</h4>
                <v-chip-group>
                  <v-chip
                    v-for="type in disabilityProfile.disability_types"
                    :key="type"
                    size="small"
                    color="primary"
                    variant="outlined"
                  >
                    {{ type }}
                  </v-chip>
                </v-chip-group>
              </div>

              <div v-if="disabilityProfile.assistive_devices?.length" class="mb-3">
                <h4 class="mb-2">보조기기</h4>
                <v-chip-group>
                  <v-chip
                    v-for="device in disabilityProfile.assistive_devices"
                    :key="device"
                    size="small"
                    color="secondary"
                    variant="outlined"
                  >
                    {{ device }}
                  </v-chip>
                </v-chip-group>
              </div>

              <div v-if="disabilityProfile.emergency_contacts?.length" class="mb-3">
                <h4 class="mb-2">응급 연락처</h4>
                <v-list dense>
                  <v-list-item
                    v-for="contact in disabilityProfile.emergency_contacts"
                    :key="`${contact.name}-${contact.phone}`"
                  >
                    <v-list-item-title>{{ contact.name }} ({{ contact.relation }})</v-list-item-title>
                    <v-list-item-subtitle>{{ contact.phone }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </div>
            <div v-else>
              <p class="text-medium-emphasis">장애 정보가 등록되지 않았습니다.</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- 동행인 프로필 카드 -->
        <v-card
          v-if="profileStore.isCompanion"
          elevation="1"
          class="mb-4"
        >
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2" color="secondary">mdi-account-heart</v-icon>
            동행인 정보
          </v-card-title>
          <v-card-text>
            <div v-if="companionProfile">
              <div v-if="companionProfile.supportable_disabilities?.length" class="mb-3">
                <h4 class="mb-2">지원 가능 장애 유형</h4>
                <v-chip-group>
                  <v-chip
                    v-for="type in companionProfile.supportable_disabilities"
                    :key="type"
                    size="small"
                    color="primary"
                    variant="outlined"
                  >
                    {{ type }}
                  </v-chip>
                </v-chip-group>
              </div>

              <div class="mb-3">
                <h4 class="mb-2">경력</h4>
                <p>{{ companionProfile.experience_years || 0 }}년</p>
              </div>

              <div v-if="companionProfile.experience_description" class="mb-3">
                <h4 class="mb-2">경력 설명</h4>
                <p>{{ companionProfile.experience_description }}</p>
              </div>

              <div v-if="companionProfile.certifications?.length" class="mb-3">
                <h4 class="mb-2">자격증</h4>
                <v-list dense>
                  <v-list-item
                    v-for="cert in companionProfile.certifications"
                    :key="`${cert.name}-${cert.issuer}`"
                  >
                    <v-list-item-title>{{ cert.name }}</v-list-item-title>
                    <v-list-item-subtitle>발급기관: {{ cert.issuer }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </div>
            <div v-else>
              <p class="text-medium-emphasis">동행인 정보가 등록되지 않았습니다.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 로딩 오버레이 -->
    <v-overlay
      v-model="profileStore.isLoading"
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/api/user'
import ActivityDashboard from '@/components/profile/ActivityDashboard.vue'

const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()

// State for activity dashboard
const profileStatistics = ref(null)

// Computed properties
const profile = computed(() => profileStore.profile)
const disabilityProfile = computed(() => profileStore.disabilityProfile)
const companionProfile = computed(() => profileStore.companionProfile)

// Methods
const getUserTypeColor = (userType) => {
  switch (userType) {
    case 'disabled_traveler': return 'primary'
    case 'companion': return 'secondary'
    case 'general': return 'info'
    default: return 'grey'
  }
}

const getUserTypeText = (userType) => {
  switch (userType) {
    case 'disabled_traveler': return '장애인 여행자'
    case 'companion': return '동행인'
    case 'general': return '일반 사용자'
    default: return '미분류'
  }
}

const getGenderText = (gender) => {
  switch (gender) {
    case 'M': return '남성'
    case 'F': return '여성'
    case 'O': return '기타'
    default: return null
  }
}

const getLocation = (profile) => {
  if (!profile) return null
  const parts = []
  if (profile.region_city) parts.push(profile.region_city)
  if (profile.region_district) parts.push(profile.region_district)
  return parts.length ? parts.join(' ') : null
}

const formatDate = (dateString) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const editProfile = () => {
  router.push('/profile/edit')
}

const editDisabilityProfile = () => {
  router.push('/profile/disability')
}

const editCompanionProfile = () => {
  router.push('/profile/companion')
}

// Load profile statistics
const loadProfileStatistics = async () => {
  try {
    const response = await userAPI.getProfileStatistics()
    console.log('프로필 통계 API 응답:', response)
    
    // API 응답 구조 확인 및 올바른 데이터 추출
    if (response.success && response.data) {
      profileStatistics.value = response.data
    } else if (response.reviews) {
      // 직접 통계 데이터가 온 경우
      profileStatistics.value = response
    } else {
      console.warn('예상과 다른 통계 API 응답 구조:', response)
      profileStatistics.value = null
    }
    
    console.log('설정된 프로필 통계:', profileStatistics.value)
  } catch (error) {
    console.error('프로필 통계 로드 실패:', error)
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  try {
    // 프로필 정보와 통계를 병렬로 로드
    await Promise.all([
      profileStore.fetchProfile(),
      loadProfileStatistics()
    ])
  } catch (error) {
    console.error('프로필 로드 실패:', error)
  }
})
</script>

<style scoped>
.v-chip-group {
  gap: 8px;
}
</style>