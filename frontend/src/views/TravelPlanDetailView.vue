<template>
  <div class="travel-plan-detail">
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
      class="ma-4"
    >
      <template v-slot:title>오류가 발생했습니다</template>
      {{ error }}
      <template v-slot:append>
        <v-btn variant="text" @click="loadPlan">다시 시도</v-btn>
      </template>
    </v-alert>

    <!-- Plan Detail -->
    <div v-else-if="currentPlan" class="plan-content">
      <!-- Header -->
      <v-app-bar
        color="primary"
        dark
        elevation="2"
        height="80"
      >
        <v-btn
          icon
          @click="$router.go(-1)"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-app-bar-title class="text-h5">
          {{ currentPlan.title }}
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <!-- Status Chip -->
        <v-chip
          :color="getStatusColor(currentPlan.status)"
          variant="flat"
          class="mr-3"
        >
          {{ getStatusText(currentPlan.status) }}
        </v-chip>

        <!-- Actions Menu -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              v-bind="props"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="editPlan">
              <v-list-item-title>
                <v-icon start size="small">mdi-pencil</v-icon>
                계획 수정
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="changePlanStatus">
              <v-list-item-title>
                <v-icon start size="small">mdi-check-circle</v-icon>
                상태 변경
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="sharePlan">
              <v-list-item-title>
                <v-icon start size="small">mdi-share</v-icon>
                공유하기
              </v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="deletePlan" class="text-error">
              <v-list-item-title>
                <v-icon start size="small">mdi-delete</v-icon>
                계획 삭제
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <!-- Plan Info -->
      <v-container class="py-6">
        <v-row>
          <v-col cols="12" md="8">
            <!-- Plan Summary -->
            <v-card class="mb-6" elevation="2">
              <v-card-text>
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-calendar-range" size="large" color="primary" class="mr-3"></v-icon>
                  <div>
                    <h3 class="text-h6">{{ formatDateRange(currentPlan.start_date, currentPlan.end_date) }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-0">
                      {{ getDaysCount() }}일 {{ getDaysCount() - 1 }}박 여행
                    </p>
                  </div>
                </div>

                <div v-if="currentPlan.description" class="mb-4">
                  <p class="text-body-1">{{ currentPlan.description }}</p>
                </div>

                <div class="d-flex flex-wrap gap-3">
                  <v-chip color="info" size="small">
                    <v-icon start size="small">mdi-account-group</v-icon>
                    {{ currentPlan.travelers_count }}명
                  </v-chip>
                  
                  <v-chip v-if="currentPlan.has_disabled_member" color="purple" size="small">
                    <v-icon start size="small">mdi-wheelchair-accessibility</v-icon>
                    접근성 고려
                  </v-chip>
                  
                  <v-chip v-if="currentPlan.budget" color="green" size="small">
                    <v-icon start size="small">mdi-currency-krw</v-icon>
                    {{ formatBudget(currentPlan.budget) }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>

            <!-- Daily Itinerary -->
            <div class="daily-itinerary">
              <div class="d-flex justify-space-between align-center mb-4">
                <h2 class="text-h5">일정</h2>
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  @click="showDestinationPicker = true"
                >
                  여행지 추가
                </v-btn>
              </div>

              <!-- Days List -->
              <div v-if="currentPlan.days && currentPlan.days.length > 0">
                <v-expansion-panels
                  v-model="openPanels"
                  multiple
                  variant="accordion"
                >
                  <v-expansion-panel
                    v-for="day in sortedDays"
                    :key="day.day_id"
                    :value="day.day_id"
                  >
                    <v-expansion-panel-title>
                      <div class="d-flex align-center">
                        <v-avatar color="primary" size="32" class="mr-3">
                          {{ day.day_number }}
                        </v-avatar>
                        <div>
                          <h3 class="text-h6">{{ day.title || `${day.day_number}일차` }}</h3>
                          <p class="text-body-2 text-grey-darken-1 mb-0">
                            {{ formatDate(day.date) }}
                            <span v-if="day.destinations && day.destinations.length > 0">
                              · {{ day.destinations.length }}개 장소
                            </span>
                          </p>
                        </div>
                      </div>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text>
                      <DayItinerary
                        :day="day"
                        @add-destination="addDestinationToDay"
                        @remove-destination="removeDestination"
                        @update-destination="updateDestination"
                        @reorder-destinations="reorderDestinations"
                        @update-day="updateDay"
                      />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-8">
                <v-icon icon="mdi-calendar-blank" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
                <h3 class="text-h6 mb-2">일정이 아직 없습니다</h3>
                <p class="text-body-2 text-grey-darken-1 mb-4">
                  여행지를 추가하여 상세 일정을 만들어보세요
                </p>
                <v-btn
                  color="primary"
                  size="large"
                  prepend-icon="mdi-plus"
                  @click="showDestinationPicker = true"
                >
                  첫 번째 여행지 추가
                </v-btn>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <!-- Plan Statistics -->
            <v-card class="mb-4" elevation="2">
              <v-card-title>여행 통계</v-card-title>
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-3">
                  <span>총 여행 일수</span>
                  <v-chip color="primary" size="small">{{ getDaysCount() }}일</v-chip>
                </div>
                <div class="d-flex justify-space-between align-center mb-3">
                  <span>계획된 장소</span>
                  <v-chip color="info" size="small">{{ getTotalDestinations() }}개</v-chip>
                </div>
                <div class="d-flex justify-space-between align-center mb-3">
                  <span>여행 인원</span>
                  <v-chip color="green" size="small">{{ currentPlan.travelers_count }}명</v-chip>
                </div>
                <div v-if="currentPlan.budget" class="d-flex justify-space-between align-center">
                  <span>예산</span>
                  <v-chip color="orange" size="small">{{ formatBudget(currentPlan.budget) }}</v-chip>
                </div>
              </v-card-text>
            </v-card>

            <!-- Accessibility Info -->
            <v-card v-if="currentPlan.has_disabled_member" class="mb-4" elevation="2">
              <v-card-title>
                <v-icon start>mdi-wheelchair-accessibility</v-icon>
                접근성 정보
              </v-card-title>
              <v-card-text>
                <div v-if="currentPlan.accessibility_requirements && currentPlan.accessibility_requirements.length > 0">
                  <v-chip
                    v-for="requirement in currentPlan.accessibility_requirements"
                    :key="requirement"
                    size="small"
                    class="ma-1"
                    color="purple"
                    variant="outlined"
                  >
                    {{ getAccessibilityLabel(requirement) }}
                  </v-chip>
                </div>
                <p v-else class="text-body-2 text-grey-darken-1 mb-0">
                  장애인 동행자가 있는 여행입니다.
                </p>
              </v-card-text>
            </v-card>

            <!-- Quick Actions -->
            <v-card elevation="2">
              <v-card-title>빠른 작업</v-card-title>
              <v-card-text>
                <v-btn
                  block
                  variant="outlined"
                  class="mb-2"
                  prepend-icon="mdi-map-marker-plus"
                  @click="showDestinationPicker = true"
                >
                  여행지 추가
                </v-btn>
                <v-btn
                  block
                  variant="outlined"
                  class="mb-2"
                  prepend-icon="mdi-check-circle"
                  @click="changePlanStatus"
                  :disabled="currentPlan.status === 'confirmed'"
                >
                  계획 확정하기
                </v-btn>
                <v-btn
                  block
                  variant="outlined"
                  prepend-icon="mdi-share"
                  @click="sharePlan"
                >
                  계획 공유하기
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Destination Picker Dialog -->
    <v-dialog
      v-model="showDestinationPicker"
      max-width="800"
      persistent
    >
      <DestinationPicker
        :selected-day="selectedDay"
        @destination-selected="onDestinationSelected"
        @cancel="showDestinationPicker = false"
      />
    </v-dialog>

    <!-- Status Change Dialog -->
    <v-dialog
      v-model="showStatusDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>계획 상태 변경</v-card-title>
        <v-card-text>
          <v-select
            v-model="newStatus"
            :items="statusOptions"
            label="새 상태"
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showStatusDialog = false">취소</v-btn>
          <v-btn color="primary" @click="updatePlanStatus">변경</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTravelPlanStore } from '@/stores/travelPlan'
import travelPlanAPI from '@/api/travelPlan'
import DayItinerary from '@/components/travel/DayItinerary.vue'
import DestinationPicker from '@/components/travel/DestinationPicker.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const travelPlanStore = useTravelPlanStore()

// State
const openPanels = ref([])
const showDestinationPicker = ref(false)
const showStatusDialog = ref(false)
const selectedDay = ref(null)
const newStatus = ref('')

// Local state
const currentPlan = ref(null)
const loading = ref(false)
const error = ref(null)

// Computed
const sortedDays = computed(() => {
  if (!currentPlan?.days) return []
  return [...currentPlan.days].sort((a, b) => a.day_number - b.day_number)
})

const statusOptions = [
  { title: '임시저장', value: 'draft' },
  { title: '확정', value: 'confirmed' },
  { title: '완료', value: 'completed' },
  { title: '취소됨', value: 'cancelled' }
]

// Methods
const loadPlan = async () => {
  if (!props.id) {
    error.value = '계획 ID가 필요합니다.'
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    const response = await travelPlanAPI.getTravelPlanById(props.id)
    currentPlan.value = response.data
    
    // 기본적으로 첫 번째 패널 열기
    if (currentPlan.value?.days?.length > 0) {
      openPanels.value = [currentPlan.value.days[0].day_id]
    }
    
  } catch (err) {
    console.error('여행 계획 상세 조회 실패:', err)
    error.value = '여행 계획을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

const getDaysCount = () => {
  if (!currentPlan) return 0
  const startDate = new Date(currentPlan.start_date)
  const endDate = new Date(currentPlan.end_date)
  const diffTime = Math.abs(endDate - startDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const getTotalDestinations = () => {
  if (!currentPlan?.days) return 0
  return currentPlan.days.reduce((total, day) => {
    return total + (day.destinations?.length || 0)
  }, 0)
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const end = new Date(endDate).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  })
  return `${start} ~ ${end}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

const formatBudget = (budget) => {
  return new Intl.NumberFormat('ko-KR').format(budget) + '원'
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

const getAccessibilityLabel = (requirement) => {
  const labels = {
    wheelchair: '휠체어 접근',
    visual_impairment: '시각장애 지원',
    hearing_impairment: '청각장애 지원',
    mobility_assistance: '이동 보조',
    cognitive_support: '인지 지원',
    elevator_access: '엘리베이터 필수',
    disabled_parking: '장애인 주차장',
    barrier_free: '무장벽 환경'
  }
  return labels[requirement] || requirement
}

// Actions
const editPlan = () => {
  // TODO: 편집 모드 구현
  alert('계획 편집 기능은 곷 구현될 예정입니다!')
}

const changePlanStatus = () => {
  newStatus.value = currentPlan.status
  showStatusDialog.value = true
}

const updatePlanStatus = async () => {
  try {
    await travelPlanAPI.updateTravelPlan(currentPlan.value.plan_id, { status: newStatus.value })
    currentPlan.value.status = newStatus.value
    showStatusDialog.value = false
  } catch (error) {
    console.error('상태 변경 실패:', error)
    error.value = '상태 변경에 실패했습니다.'
  }
}

const sharePlan = () => {
  // TODO: 공유 기능 구현
  alert('공유 기능은 곷 구현될 예정입니다!')
}

const deletePlan = async () => {
  if (confirm('정말로 이 여행 계획을 삭제하시겠습니까?')) {
    try {
      await travelPlanAPI.deleteTravelPlan(currentPlan.value.plan_id)
      router.push('/travel-plans')
    } catch (error) {
      console.error('계획 삭제 실패:', error)
      error.value = '계획 삭제에 실패했습니다.'
    }
  }
}

const addDestinationToDay = (day) => {
  selectedDay.value = day
  showDestinationPicker.value = true
}

const onDestinationSelected = async (destinationData) => {
  try {
    if (selectedDay.value) {
      await travelPlanAPI.addDestinationToDay(selectedDay.value.day_id, destinationData)
      // 데이터 새로고침
      await loadPlan()
    }
    showDestinationPicker.value = false
    selectedDay.value = null
  } catch (error) {
    console.error('여행지 추가 실패:', error)
    error.value = '여행지 추가에 실패했습니다.'
  }
}

const removeDestination = async (planDestinationId) => {
  try {
    await travelPlanAPI.removeDestinationFromDay(planDestinationId)
    // 데이터 새로고침
    await loadPlan()
  } catch (error) {
    console.error('여행지 제거 실패:', error)
    error.value = '여행지 제거에 실패했습니다.'
  }
}

const updateDestination = async (planDestinationId, updateData) => {
  try {
    await travelPlanAPI.updatePlanDestination(planDestinationId, updateData)
    // 데이터 새로고침
    await loadPlan()
  } catch (error) {
    console.error('여행지 수정 실패:', error)
    error.value = '여행지 수정에 실패했습니다.'
  }
}

const reorderDestinations = async (dayId, destinations) => {
  try {
    await travelPlanAPI.reorderDestinations(dayId, destinations)
    // 데이터 새로고침
    await loadPlan()
  } catch (error) {
    console.error('순서 변경 실패:', error)
    error.value = '순서 변경에 실패했습니다.'
  }
}

const updateDay = async (dayId, updateData) => {
  try {
    await travelPlanAPI.updatePlanDay(dayId, updateData)
    // 데이터 새로고침
    await loadPlan()
  } catch (error) {
    console.error('일차 수정 실패:', error)
    error.value = '일차 수정에 실패했습니다.'
  }
}

// Watchers
// Lifecycle - 다른 페이지들처럼 단순하게 처리
onMounted(() => {
  loadPlan()
})

// props.id가 변경될 때만 새로 로드
watch(() => props.id, () => {
  loadPlan()
})
</script>

<style scoped>
.travel-plan-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.plan-content {
  background-color: #f5f5f5;
  min-height: calc(100vh - 80px);
  margin-top: 80px;
}

.daily-itinerary {
  max-width: 100%;
}

@media (max-width: 600px) {
  .plan-content {
    margin-top: 80px;
  }
}
</style>