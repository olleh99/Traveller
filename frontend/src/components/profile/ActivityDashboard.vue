<template>
  <div class="activity-dashboard">
    <!-- 프로필 완성도 -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-account-check</v-icon>
        프로필 완성도
      </v-card-title>
      <v-card-text>
        <div class="d-flex align-center mb-3">
          <v-progress-circular
            :model-value="statistics?.profileCompletion || 0"
            size="60"
            width="6"
            color="primary"
            class="mr-4"
          >
            <span class="text-h6 font-weight-bold">
              {{ statistics?.profileCompletion || 0 }}%
            </span>
          </v-progress-circular>
          <div>
            <h4 class="text-h6 mb-1">
              {{ getCompletionMessage(statistics?.profileCompletion || 0) }}
            </h4>
            <p class="text-body-2 text-grey-darken-1 mb-0">
              프로필을 완성하여 더 나은 서비스를 받아보세요
            </p>
          </div>
        </div>
        <v-btn
          v-if="(statistics?.profileCompletion || 0) < 100"
          color="primary"
          variant="outlined"
          size="small"
          @click="$router.push('/profile/edit')"
        >
          프로필 완성하기
        </v-btn>
      </v-card-text>
      
      <!-- 임시 디버깅 버튼 -->
      <v-card-actions>
        <v-btn color="warning" size="small" @click="debugReviews">
          리뷰 데이터 확인
        </v-btn>
        <v-btn color="info" size="small" @click="debugStatistics">
          통계 API 확인
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 활동 통계 카드들 -->
    <v-row class="mb-6">
      <!-- 리뷰 통계 -->
      <v-col cols="12" md="4">
        <v-card 
          class="h-100 stat-card" 
          elevation="2"
          @click="$router.push('/my-reviews')"
        >
          <v-card-text class="text-center">
            <v-avatar size="64" color="blue-lighten-5" class="mb-3">
              <v-icon size="32" color="blue">mdi-comment-text</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-blue mb-1">
              {{ statistics?.reviews?.total || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium mb-2">작성한 리뷰</p>
            <div class="d-flex justify-center align-center gap-2">
              <v-chip size="small" color="amber" variant="flat">
                <v-icon start size="small">mdi-star</v-icon>
                평균 {{ statistics?.reviews?.averageRating || '0.0' }}점
              </v-chip>
            </div>
            <div class="mt-2">
              <v-chip size="small" color="green" variant="outlined">
                <v-icon start size="small">mdi-thumb-up</v-icon>
                도움됨 {{ statistics?.reviews?.totalHelpful || 0 }}개
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 여행 계획 통계 -->
      <v-col cols="12" md="4">
        <v-card 
          class="h-100 stat-card" 
          elevation="2"
          @click="$router.push('/travel-plans')"
        >
          <v-card-text class="text-center">
            <v-avatar size="64" color="purple-lighten-5" class="mb-3">
              <v-icon size="32" color="purple">mdi-map</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-purple mb-1">
              {{ statistics?.travelPlans?.total || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium mb-2">여행 계획</p>
            <div class="d-flex justify-center flex-wrap gap-1">
              <v-chip 
                v-if="statistics?.travelPlans?.byStatus?.completed > 0"
                size="small" 
                color="blue" 
                variant="flat"
              >
                완료 {{ statistics.travelPlans.byStatus.completed }}
              </v-chip>
              <v-chip 
                v-if="statistics?.travelPlans?.byStatus?.confirmed > 0"
                size="small" 
                color="green" 
                variant="flat"
              >
                확정 {{ statistics.travelPlans.byStatus.confirmed }}
              </v-chip>
              <v-chip 
                v-if="statistics?.travelPlans?.byStatus?.draft > 0"
                size="small" 
                color="orange" 
                variant="outlined"
              >
                임시저장 {{ statistics.travelPlans.byStatus.draft }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 즐겨찾기 통계 -->
      <v-col cols="12" md="4">
        <v-card 
          class="h-100 stat-card" 
          elevation="2"
          @click="$router.push('/favorites')"
        >
          <v-card-text class="text-center">
            <v-avatar size="64" color="red-lighten-5" class="mb-3">
              <v-icon size="32" color="red">mdi-heart</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-red mb-1">
              {{ statistics?.favorites?.total || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium mb-2">즐겨찾기</p>
            <p class="text-body-2 text-grey-darken-1">
              관심있는 여행지
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 최근 활동 타임라인 -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-timeline</v-icon>
          최근 활동
        </div>
        <v-btn
          variant="text"
          size="small"
          @click="loadActivities"
          :loading="activitiesLoading"
        >
          새로고침
          <v-icon end>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- 로딩 상태 -->
        <div v-if="activitiesLoading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2 text-body-2">활동 내역을 불러오는 중...</p>
        </div>

        <!-- 활동 없음 -->
        <div v-else-if="!activities || activities.length === 0" class="text-center py-6">
          <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-history</v-icon>
          <p class="text-body-1 text-grey-darken-1">아직 활동 내역이 없습니다</p>
          <p class="text-body-2 text-grey-darken-1">리뷰를 작성하거나 여행 계획을 세워보세요!</p>
        </div>

        <!-- 활동 타임라인 -->
        <v-timeline v-else side="end" density="compact">
          <v-timeline-item
            v-for="activity in activities"
            :key="`${activity.type}-${activity.id}`"
            :dot-color="getActivityColor(activity.type)"
            size="small"
          >
            <template v-slot:icon>
              <v-icon size="16" color="white">
                {{ getActivityIcon(activity.type) }}
              </v-icon>
            </template>

            <div class="activity-item">
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <h4 class="text-subtitle-1 font-weight-medium">
                    {{ activity.title }}
                  </h4>
                  <p class="text-body-2 text-grey-darken-1 mb-1">
                    {{ activity.subtitle }}
                  </p>
                </div>
                <v-chip size="small" variant="outlined">
                  {{ formatActivityDate(activity.date) }}
                </v-chip>
              </div>
              
              <!-- 활동별 추가 정보 -->
              <div v-if="activity.type === 'review'" class="mt-2">
                <v-rating
                  :model-value="activity.data.overall_rating"
                  readonly
                  color="amber"
                  size="small"
                  density="compact"
                />
              </div>
              
              <div v-if="activity.type === 'travel_plan'" class="mt-2">
                <v-chip
                  size="small"
                  :color="getPlanStatusColor(activity.data.status)"
                  variant="flat"
                >
                  {{ getPlanStatusText(activity.data.status) }}
                </v-chip>
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>

        <!-- 더보기 버튼 -->
        <div v-if="activities && activities.length >= 10" class="text-center mt-4">
          <v-btn
            variant="outlined"
            @click="viewAllActivities"
          >
            모든 활동 보기
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '@/api/user'

const props = defineProps({
  statistics: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['refresh-statistics'])
const router = useRouter()

// State
const activities = ref([])
const activitiesLoading = ref(false)

// Methods
const loadActivities = async () => {
  try {
    activitiesLoading.value = true
    const response = await userAPI.getRecentActivities(10)
    
    console.log('최근 활동 API 응답:', response) // 디버깅용 로그
    
    // 응답 구조 확인 및 안전한 데이터 추출
    if (response && response.success && response.data) {
      activities.value = response.data.activities || []
    } else {
      console.warn('최근 활동 API 응답 구조가 예상과 다릅니다:', response)
      activities.value = []
    }
  } catch (error) {
    console.error('최근 활동 조회 실패:', error)
    console.error('Error details:', error.response || error)
    activities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

// 디버깅용 메서드
const debugReviews = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/debug/reviews', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('디버그 리뷰 데이터:', data);
      alert(`리뷰 개수: ${data.reviewCount}\n사용자 ID: ${data.userId}\n자세한 내용은 콘솔을 확인하세요.`);
    } else {
      console.error('디버그 API 오류:', response.status, response.statusText);
      alert('디버그 API 호출 실패: ' + response.status);
    }
  } catch (error) {
    console.error('디버깅 오류:', error);
    alert('디버깅 중 오류 발생');
  }
}

// 통계 API 디버깅용 메서드
const debugStatistics = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users/profile/statistics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('디버그 통계 데이터:', data);
      alert(`통계 API 응답:\n리뷰: ${data.data?.reviews?.total || 0}개\n즐겨찾기: ${data.data?.favorites?.total || 0}개\n여행계획: ${data.data?.travelPlans?.total || 0}개\n\n자세한 내용은 콘솔을 확인하세요.`);
    } else {
      console.error('통계 API 오류:', response.status, response.statusText);
      alert('통계 API 호출 실패: ' + response.status);
    }
  } catch (error) {
    console.error('통계 디버깅 오류:', error);
    alert('통계 디버깅 중 오류 발생');
  }
}

const getCompletionMessage = (percentage) => {
  if (percentage >= 90) return '프로필이 거의 완성되었습니다!'
  if (percentage >= 70) return '프로필이 잘 채워져 있습니다'
  if (percentage >= 50) return '프로필을 더 완성해보세요'
  return '프로필 정보를 입력해주세요'
}

const getActivityColor = (type) => {
  const colors = {
    review: 'blue',
    favorite: 'red',
    travel_plan: 'purple'
  }
  return colors[type] || 'grey'
}

const getActivityIcon = (type) => {
  const icons = {
    review: 'mdi-comment-text',
    favorite: 'mdi-heart',
    travel_plan: 'mdi-map'
  }
  return icons[type] || 'mdi-circle'
}

const formatActivityDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))

  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
}

const getPlanStatusColor = (status) => {
  const colors = {
    draft: 'orange',
    confirmed: 'green',
    completed: 'blue',
    cancelled: 'red'
  }
  return colors[status] || 'grey'
}

const getPlanStatusText = (status) => {
  const texts = {
    draft: '임시저장',
    confirmed: '확정',
    completed: '완료',
    cancelled: '취소됨'
  }
  return texts[status] || status
}

const viewAllActivities = () => {
  // TODO: 전체 활동 내역 페이지로 이동
  router.push('/profile/activities')
}

// Lifecycle
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activity-dashboard {
  max-width: 100%;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.activity-item {
  padding: 8px 0;
}

.activity-item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
  padding-bottom: 12px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .stat-card:hover {
    transform: none;
  }
}

/* 접근성 */
.stat-card:focus {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
}

/* 고대비 모드 */
.v-theme--dark .activity-item {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
</style>