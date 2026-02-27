<template>
  <div class="companion-search">
    <v-container>
      <!-- 헤더 -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-bold mb-2">
          {{ isGeneralUser ? '함께 여행할 사람 찾기' : '동행인 찾기' }}
        </h1>
        <p class="text-body-1 text-grey-darken-1">
          {{ isGeneralUser ? '함께 여행할 사람을 찾아보세요' : '나에게 맞는 동행인을 찾아보세요' }}
        </p>
      </div>

      <!-- 검색 필터 -->
      <v-card class="mb-6">
        <v-card-title>
          <v-icon start>mdi-filter</v-icon>
          검색 조건
        </v-card-title>
        <v-card-text>
          <v-row>
            <!-- 지원 가능 장애 유형 - 장애인 사용자만 표시 -->
            <v-col v-if="!isGeneralUser" cols="12" md="6">
              <v-select
                v-model="searchFilters.supportable_disabilities"
                :items="disabilityTypes"
                label="지원 가능 장애 유형"
                multiple
                chips
                variant="outlined"
              />
            </v-col>

            <!-- 최소 경력 - 장애인 사용자만 표시 -->
            <v-col v-if="!isGeneralUser" cols="12" md="3">
              <v-select
                v-model="searchFilters.experience_years_min"
                :items="experienceOptions"
                label="최소 경력"
                variant="outlined"
              />
            </v-col>

            <!-- 정렬 기준 -->
            <v-col cols="12" md="3">
              <v-select
                v-model="searchFilters.sort"
                :items="sortOptions"
                label="정렬 기준"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-btn
                color="primary"
                @click="searchCompanions"
                prepend-icon="mdi-magnify"
                :loading="loading"
              >
                검색
              </v-btn>
              <v-btn
                variant="outlined"
                @click="resetFilters"
                class="ml-2"
              >
                초기화
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 검색 결과 -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4">동행인을 검색하는 중...</p>
      </div>

      <div v-else-if="companions.length === 0 && !loading" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-search</v-icon>
        <h3 class="text-h6 mb-2">검색 결과가 없습니다</h3>
        <p class="text-body-2 text-grey-darken-1">
          다른 조건으로 검색해보세요
        </p>
      </div>

      <v-row v-else>
        <v-col
          v-for="companion in companions"
          :key="companion.user_id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="companion-card"
            @click="viewCompanionProfile(companion)"
            hover
          >
            <v-card-text>
              <!-- 프로필 이미지 -->
              <div class="d-flex align-center mb-4">
                <v-avatar size="60" class="mr-4">
                  <v-img
                    v-if="companion.profile_image_url"
                    :src="companion.profile_image_url"
                    :alt="companion.name"
                  />
                  <v-icon v-else size="40">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-bold">{{ companion.name }}</h3>
                  <p class="text-body-2 text-grey-darken-1 mb-0">
                    {{ companion.nickname }}
                  </p>
                  <div class="d-flex align-center">
                    <v-rating
                      :model-value="companion.companionProfile?.average_rating || 0"
                      readonly
                      color="amber"
                      size="small"
                      density="compact"
                    />
                    <span class="text-caption ml-2">
                      ({{ companion.companionProfile?.total_reviews || 0 }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- 경력 정보 - 동행인만 표시 -->
              <div v-if="!isGeneralUser && companion.companionProfile" class="mb-3">
                <v-chip
                  color="primary"
                  variant="tonal"
                  size="small"
                  class="mr-2"
                >
                  {{ companion.companionProfile?.experience_years || 0 }}년 경력
                </v-chip>
                <v-chip
                  v-if="companion.companionProfile?.certifications?.length"
                  color="success"
                  variant="tonal"
                  size="small"
                >
                  자격증 {{ companion.companionProfile.certifications.length }}개
                </v-chip>
              </div>

              <!-- 지원 가능 장애 유형 - 동행인만 표시 -->
              <div v-if="!isGeneralUser && companion.companionProfile" class="mb-3">
                <p class="text-caption text-grey-darken-1 mb-1">지원 가능 장애</p>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="disability in companion.companionProfile?.supportable_disabilities || []"
                    :key="disability"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ getDisabilityLabel(disability) }}
                  </v-chip>
                </div>
              </div>
              
              <!-- 일반 사용자 정보 -->
              <div v-if="isGeneralUser" class="mb-3">
                <v-chip
                  color="primary"
                  variant="tonal"
                  size="small"
                >
                  일반 여행자
                </v-chip>
              </div>

              <!-- 소개 -->
              <p 
                v-if="companion.companionProfile?.experience_description" 
                class="text-body-2 text-grey-darken-1"
              >
                {{ truncateText(companion.companionProfile.experience_description, 100) }}
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click.stop="requestMatching(companion)"
                :disabled="isRequestPending(companion.user_id)"
              >
                <v-icon start>mdi-account-plus</v-icon>
                {{ isRequestPending(companion.user_id) ? '요청됨' : '매칭 요청' }}
              </v-btn>
              <v-spacer />
              <v-btn
                variant="text"
                size="small"
                @click.stop="viewCompanionProfile(companion)"
              >
                상세보기
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          @update:model-value="loadCompanions"
        />
      </div>
    </v-container>

    <!-- 매칭 요청 다이얼로그 -->
    <v-dialog
      v-model="showMatchingDialog"
      max-width="600"
      scrollable
    >
      <MatchingRequestForm
        v-if="showMatchingDialog"
        :companion="selectedCompanion"
        @submit="submitMatchingRequest"
        @cancel="showMatchingDialog = false"
      />
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { matchingAPI } from '@/api/matching'
import MatchingRequestForm from '@/components/matching/MatchingRequestForm.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const companions = ref([])
const currentPage = ref(1)
const totalPages = ref(0)
const totalItems = ref(0)
const showMatchingDialog = ref(false)
const selectedCompanion = ref(null)
const pendingRequests = ref([])

// Computed
const isGeneralUser = computed(() => authStore.user?.user_type === 'general_user')

// 검색 필터
const searchFilters = reactive({
  supportable_disabilities: [],
  experience_years_min: null,
  sort: 'recent'
})

// 옵션 데이터
const disabilityTypes = [
  { title: '시각장애', value: 'visual_impairment' },
  { title: '청각장애', value: 'hearing_impairment' },
  { title: '지체장애', value: 'mobility_impairment' },
  { title: '뇌병변장애', value: 'brain_lesion' },
  { title: '지적장애', value: 'intellectual_disability' },
  { title: '자폐성장애', value: 'autism' },
  { title: '정신장애', value: 'mental_illness' }
]

const experienceOptions = [
  { title: '경력 무관', value: null },
  { title: '1년 이상', value: 1 },
  { title: '2년 이상', value: 2 },
  { title: '3년 이상', value: 3 },
  { title: '5년 이상', value: 5 }
]

const sortOptions = [
  { title: '최근 가입순', value: 'recent' },
  { title: '경력순', value: 'experience' },
  { title: '평점순', value: 'rating' }
]

// Methods
const searchCompanions = async () => {
  currentPage.value = 1
  await loadCompanions()
}

const loadCompanions = async () => {
  try {
    loading.value = true
    
    const params = {
      page: currentPage.value,
      limit: 12,
      ...searchFilters
    }
    
    // 빈 배열 제거
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key]) && params[key].length === 0) {
        delete params[key]
      }
    })
    
    const response = await matchingAPI.searchCompanions(params)
    companions.value = response.data.companions
    totalPages.value = response.data.pagination.totalPages
    totalItems.value = response.data.pagination.totalItems
  } catch (error) {
    console.error('동행인 검색 실패:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchFilters.supportable_disabilities = []
  searchFilters.experience_years_min = null
  searchFilters.sort = 'recent'
  searchCompanions()
}

const requestMatching = (companion) => {
  selectedCompanion.value = companion
  showMatchingDialog.value = true
}

const submitMatchingRequest = async (requestData) => {
  try {
    await matchingAPI.createMatchingRequest({
      ...requestData,
      companion_id: selectedCompanion.value.user_id
    })
    
    // 요청된 동행인 ID 추가
    pendingRequests.value.push(selectedCompanion.value.user_id)
    
    showMatchingDialog.value = false
    // 성공 메시지 표시
  } catch (error) {
    console.error('매칭 요청 실패:', error)
  }
}

const viewCompanionProfile = (companion) => {
  router.push(`/companions/${companion.user_id}`)
}

const isRequestPending = (companionId) => {
  return pendingRequests.value.includes(companionId)
}

const getDisabilityLabel = (disability) => {
  const found = disabilityTypes.find(item => item.value === disability)
  return found ? found.title : disability
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Lifecycle
onMounted(() => {
  // 모든 사용자 유형이 동행매칭 페이지에 접근 가능하도록 수정
  loadCompanions()
})
</script>

<style scoped>
.companion-card {
  height: 100%;
  transition: transform 0.2s;
  cursor: pointer;
}

.companion-card:hover {
  transform: translateY(-2px);
}

:deep(.v-chip-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>