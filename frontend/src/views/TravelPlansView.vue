<template>
  <div class="travel-plans-page">
    <v-container class="py-8">
      <!-- 페이지 헤더 -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">
            <v-icon size="large" class="mr-3">mdi-map</v-icon>
            나의 여행 계획
          </h1>
          <p class="text-h6 text-grey-darken-1">
            접근성을 고려한 완벽한 여행 계획을 세워보세요
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
        >
          새 여행 계획
        </v-btn>
      </div>

      <!-- 통계 카드 -->
      <v-row v-if="statistics" class="mb-6">
        <v-col cols="12" md="3">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="blue-lighten-5" class="mb-3">
              <v-icon size="32" color="blue">mdi-map-multiple</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-blue mb-1">
              {{ statistics.total || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium">총 여행 계획</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="amber-lighten-5" class="mb-3">
              <v-icon size="32" color="amber">mdi-file-edit</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-amber mb-1">
              {{ statistics.byStatus?.draft || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium">임시저장</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="green-lighten-5" class="mb-3">
              <v-icon size="32" color="green">mdi-check-circle</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-green mb-1">
              {{ statistics.byStatus?.confirmed || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium">확정된 계획</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="purple-lighten-5" class="mb-3">
              <v-icon size="32" color="purple">mdi-trophy</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-purple mb-1">
              {{ statistics.byStatus?.completed || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium">완료된 여행</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filter Tabs -->
      <v-tabs v-model="activeTab" class="mb-6" color="primary">
        <v-tab value="all">전체 ({{ plans.length }})</v-tab>
        <v-tab value="draft">임시저장 ({{ draftPlans.length }})</v-tab>
        <v-tab value="confirmed">확정 ({{ confirmedPlans.length }})</v-tab>
        <v-tab value="completed">완료 ({{ completedPlans.length }})</v-tab>
      </v-tabs>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="text-h6 mt-4">여행 계획을 불러오는 중...</p>
      </div>

      <!-- Error -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="mb-6"
      >
        <template v-slot:title>오류가 발생했습니다</template>
        {{ error }}
        <template v-slot:append>
          <v-btn variant="text" @click="loadPlans">다시 시도</v-btn>
        </template>
      </v-alert>

      <!-- Empty State -->
      <div v-else-if="filteredPlans.length === 0" class="text-center py-12">
        <v-icon icon="mdi-map-outline" size="120" color="grey-lighten-1" class="mb-4"></v-icon>
        <h2 class="text-h4 mb-4">여행 계획이 없습니다</h2>
        <p class="text-body-1 mb-6 text-grey-darken-1">
          {{ getEmptyMessage() }}
        </p>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
        >
          첫 번째 여행 계획 만들기
        </v-btn>
      </div>

      <!-- Plans Grid -->
      <v-row v-else>
        <v-col
          v-for="plan in filteredPlans"
          :key="plan.plan_id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="travel-plan-card h-100"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="2"
            @click="viewPlan(plan)"
          >
            <!-- Status Badge -->
            <div class="status-badge">
              <v-chip
                :color="getStatusColor(plan.status)"
                size="small"
                variant="flat"
              >
                {{ getStatusText(plan.status) }}
              </v-chip>
            </div>

            <v-card-title class="pb-2">
              <h3 class="text-h6" :class="accessibilityStore.fontSizeClass">
                {{ plan.title }}
              </h3>
            </v-card-title>

            <v-card-subtitle class="pb-2">
              <v-icon icon="mdi-calendar" size="small" class="mr-1"></v-icon>
              {{ formatDateRange(plan.start_date, plan.end_date) }}
              <span class="ml-2">
                <v-icon icon="mdi-account-group" size="small" class="mr-1"></v-icon>
                {{ plan.travelers_count }}명
              </span>
            </v-card-subtitle>

            <v-card-text>
              <p v-if="plan.description" class="text-body-2 mb-3">
                {{ truncateText(plan.description, 100) }}
              </p>

              <!-- Accessibility Info -->
              <div v-if="plan.has_disabled_member" class="mb-3">
                <v-chip
                  color="info"
                  size="small"
                  prepend-icon="mdi-wheelchair-accessibility"
                >
                  접근성 고려
                </v-chip>
              </div>

              <!-- Days Count -->
              <div class="d-flex align-center text-caption text-grey-darken-1">
                <v-icon icon="mdi-calendar-multiple" size="small" class="mr-1"></v-icon>
                {{ getDaysCount(plan.start_date, plan.end_date) }}일 여행
                <v-spacer></v-spacer>
                <span>{{ formatDate(plan.created_at) }} 생성</span>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                variant="text"
                size="small"
                @click.stop="editPlan"
              >
                <v-icon start>mdi-pencil</v-icon>
                수정
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                @click.stop="duplicatePlan(plan)"
              >
                <v-icon start>mdi-content-copy</v-icon>
                복사
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                size="small"
                color="error"
                @click.stop="confirmDelete(plan)"
              >
                <v-icon start>mdi-delete</v-icon>
                삭제
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create Plan Dialog -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="600"
      persistent
    >
      <TravelPlanCreateForm
        @created="onPlanCreated"
        @cancel="showCreateDialog = false"
      />
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>여행 계획 삭제</v-card-title>
        <v-card-text>
          <p>정말로 "{{ deleteTarget?.title }}" 여행 계획을 삭제하시겠습니까?</p>
          <p class="text-caption text-error mt-2">
            삭제된 계획은 복구할 수 없습니다.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            :loading="deleteLoading"
            @click="deletePlan"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAccessibilityStore } from '@/stores/accessibility'
import { useTravelPlanStore } from '@/stores/travelPlan'
import { useAuthStore } from '@/stores/auth'
import { travelPlansAPI } from '@/api/travelPlans'
import TravelPlanCreateForm from '@/components/travel/TravelPlanCreateForm.vue'

const router = useRouter()
const route = useRoute()
const accessibilityStore = useAccessibilityStore()
const travelPlanStore = useTravelPlanStore()
const authStore = useAuthStore()

// State
const activeTab = ref('all')
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const deleteTarget = ref(null)
const deleteLoading = ref(false)

// Local state for plans
const plans = ref([])
const loading = ref(false)
const error = ref(null)

// Statistics
const statistics = computed(() => {
  if (plans.value.length === 0) return null
  
  const totalPlans = plans.value.length
  const statusStats = {}
  
  plans.value.forEach(plan => {
    statusStats[plan.status] = (statusStats[plan.status] || 0) + 1
  })
  
  return {
    total: totalPlans,
    byStatus: statusStats
  }
})

// Computed
const draftPlans = computed(() => 
  plans.value.filter(plan => plan.status === 'draft')
)

const confirmedPlans = computed(() => 
  plans.value.filter(plan => plan.status === 'confirmed')
)

const completedPlans = computed(() => 
  plans.value.filter(plan => plan.status === 'completed')
)

const filteredPlans = computed(() => {
  switch (activeTab.value) {
    case 'draft':
      return draftPlans.value
    case 'confirmed':
      return confirmedPlans.value
    case 'completed':
      return completedPlans.value
    default:
      return plans.value
  }
})

// Methods
const loadPlans = async () => {
  const userId = authStore.user?.user_id
  if (!userId) {
    error.value = '로그인이 필요합니다.'
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    const response = await travelPlansAPI.getTravelPlans({ page: 1, limit: 50 })
    plans.value = response.travelPlans || []
    
  } catch (err) {
    console.error('여행 계획 목록 로드 실패:', err)
    error.value = '여행 계획 목록을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

const forceRefresh = async () => {
  // 강제 새로고침
  await loadPlans()
}

const viewPlan = (plan) => {
  router.push({ name: 'travel-plan-detail', params: { id: plan.plan_id } })
}

const editPlan = () => {
  // TODO: 여행 계획 편집 페이지 구현 후 활성화
  alert('여행 계획 편집 기능은 곧 구현될 예정입니다!')
}

const duplicatePlan = async (plan) => {
  try {
    const duplicatedData = {
      title: `${plan.title} (복사본)`,
      description: plan.description,
      start_date: plan.start_date,
      end_date: plan.end_date,
      travelers_count: plan.travelers_count,
      has_disabled_member: plan.has_disabled_member,
      accessibility_requirements: plan.accessibility_requirements,
      budget: plan.budget,
      user_id: authStore.user.user_id
    }
    
    const response = await travelPlanAPI.createTravelPlan(duplicatedData)
    // 로컬 상태에 새 계획 추가
    plans.value.unshift(response.data)
  } catch (error) {
    console.error('여행 계획 복사 실패:', error)
    error.value = '여행 계획 복사에 실패했습니다.'
  }
}

const confirmDelete = (plan) => {
  deleteTarget.value = plan
  showDeleteDialog.value = true
}

const deletePlan = async () => {
  if (!deleteTarget.value) return
  
  try {
    deleteLoading.value = true
    await travelPlansAPI.deleteTravelPlan(deleteTarget.value.plan_id)
    
    // 로컬 상태에서 제거
    plans.value = plans.value.filter(plan => plan.plan_id !== deleteTarget.value.plan_id)
    
    showDeleteDialog.value = false
    deleteTarget.value = null
  } catch (error) {
    console.error('여행 계획 삭제 실패:', error)
    error.value = '여행 계획 삭제에 실패했습니다.'
  } finally {
    deleteLoading.value = false
  }
}

const onPlanCreated = (plan) => {
  showCreateDialog.value = false
  // 로컬 상태에 새 계획 추가
  plans.value.unshift(plan)
  router.push({ name: 'travel-plan-detail', params: { id: plan.plan_id } })
}

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'draft':
      return '임시저장된 여행 계획이 없습니다.'
    case 'confirmed':
      return '확정된 여행 계획이 없습니다.'
    case 'completed':
      return '완료된 여행 계획이 없습니다.'
    default:
      return '아직 여행 계획이 없습니다. 첫 번째 계획을 만들어보세요!'
  }
}

const getStatusColor = (status) => {
  const colors = {
    draft: 'orange',
    confirmed: 'green',
    completed: 'blue',
    cancelled: 'red'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    draft: '임시저장',
    confirmed: '확정',
    completed: '완료',
    cancelled: '취소됨'
  }
  return texts[status] || status
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
  const end = new Date(endDate).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
  return `${start} ~ ${end}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const getDaysCount = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Lifecycle - 다른 페이지들처럼 단순하게 처리
onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
.travel-plan-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.travel-plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.high-contrast-card {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff;
}

.high-contrast .travel-plan-card {
  background-color: #000 !important;
}

@media (max-width: 600px) {
  .travel-plan-card {
    margin-bottom: 1rem;
  }
}
</style>