<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-map-plus" class="mr-3" color="primary"></v-icon>
      새 여행 계획 만들기
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <v-form ref="form" v-model="valid" @submit.prevent="createPlan">
        <!-- 기본 정보 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">기본 정보</h3>
          
          <v-text-field
            v-model="formData.title"
            label="여행 제목"
            :rules="titleRules"
            variant="outlined"
            prepend-inner-icon="mdi-text"
            placeholder="예: 부산 가족 여행"
            class="mb-4"
            required
          ></v-text-field>

          <v-textarea
            v-model="formData.description"
            label="여행 설명 (선택사항)"
            variant="outlined"
            prepend-inner-icon="mdi-text-long"
            placeholder="여행의 목적이나 특별한 계획을 간단히 설명해주세요"
            rows="3"
            class="mb-4"
          ></v-textarea>
        </div>

        <!-- 날짜 및 인원 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">날짜 및 인원</h3>
          
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.start_date"
                label="시작일"
                type="date"
                :rules="startDateRules"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-start"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.end_date"
                label="종료일"
                type="date"
                :rules="endDateRules"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-end"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-text-field
            v-model.number="formData.travelers_count"
            label="여행 인원수"
            type="number"
            :rules="travelersRules"
            variant="outlined"
            prepend-inner-icon="mdi-account-group"
            min="1"
            max="20"
            class="mb-4"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="formData.budget"
            label="예상 예산 (원, 선택사항)"
            type="number"
            variant="outlined"
            prepend-inner-icon="mdi-currency-krw"
            min="0"
            placeholder="1000000"
          ></v-text-field>
        </div>

        <!-- 접근성 정보 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">접근성 정보</h3>
          
          <v-checkbox
            v-model="formData.has_disabled_member"
            label="장애인 또는 거동불편자가 함께 여행합니다"
            color="primary"
            class="mb-4"
          ></v-checkbox>

          <div v-if="formData.has_disabled_member">
            <p class="text-body-2 text-grey-darken-1 mb-3">
              필요한 접근성 지원을 선택해주세요 (중복 선택 가능)
            </p>
            
            <v-row>
              <v-col
                v-for="requirement in accessibilityOptions"
                :key="requirement.value"
                cols="12"
                sm="6"
                md="4"
              >
                <v-checkbox
                  v-model="formData.accessibility_requirements"
                  :label="requirement.label"
                  :value="requirement.value"
                  color="primary"
                  density="compact"
                >
                  <template v-slot:prepend>
                    <v-icon :icon="requirement.icon" size="small"></v-icon>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- 예상 일정 미리보기 -->
        <div v-if="formData.start_date && formData.end_date && isValidDateRange" class="mb-6">
          <h3 class="text-h6 mb-4">예상 일정 미리보기</h3>
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:title>{{ getDaysCount() }}일 {{ getDaysCount() - 1 }}박 여행</template>
            계획을 생성하면 각 날짜별로 상세 일정을 추가할 수 있습니다.
          </v-alert>
          
          <div class="preview-days">
            <v-chip
              v-for="(day, index) in getPreviewDays()"
              :key="index"
              class="ma-1"
              color="primary"
              variant="outlined"
            >
              {{ day }}
            </v-chip>
          </div>
        </div>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-6">
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        @click="$emit('cancel')"
        :disabled="loading"
      >
        취소
      </v-btn>
      <v-btn
        color="primary"
        :loading="loading"
        :disabled="!valid"
        @click="createPlan"
      >
        <v-icon start>mdi-check</v-icon>
        여행 계획 만들기
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTravelPlanStore } from '@/stores/travelPlan'

const emit = defineEmits(['created', 'cancel'])

const travelPlanStore = useTravelPlanStore()

// State
const form = ref(null)
const valid = ref(false)
const loading = ref(false)

const formData = ref({
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  travelers_count: 1,
  budget: null,
  has_disabled_member: false,
  accessibility_requirements: []
})

// 접근성 옵션
const accessibilityOptions = [
  { value: 'wheelchair', label: '휠체어 접근', icon: 'mdi-wheelchair-accessibility' },
  { value: 'visual_impairment', label: '시각장애 지원', icon: 'mdi-eye-off' },
  { value: 'hearing_impairment', label: '청각장애 지원', icon: 'mdi-ear-hearing-off' },
  { value: 'mobility_assistance', label: '이동 보조', icon: 'mdi-human-cane' },
  { value: 'cognitive_support', label: '인지 지원', icon: 'mdi-brain' },
  { value: 'elevator_access', label: '엘리베이터 필수', icon: 'mdi-elevator' },
  { value: 'disabled_parking', label: '장애인 주차장', icon: 'mdi-car' },
  { value: 'barrier_free', label: '무장벽 환경', icon: 'mdi-security' }
]

// Validation rules
const titleRules = [
  v => !!v || '여행 제목을 입력해주세요',
  v => (v && v.length >= 2) || '제목은 2글자 이상이어야 합니다',
  v => (v && v.length <= 100) || '제목은 100글자 이하여야 합니다'
]

const startDateRules = [
  v => !!v || '시작일을 선택해주세요',
  v => {
    if (!v) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(v)
    return startDate >= today || '시작일은 오늘 이후여야 합니다'
  }
]

const endDateRules = [
  v => !!v || '종료일을 선택해주세요',
  v => {
    if (!v || !formData.value.start_date) return true
    const startDate = new Date(formData.value.start_date)
    const endDate = new Date(v)
    return endDate > startDate || '종료일은 시작일보다 늦어야 합니다'
  }
]

const travelersRules = [
  v => !!v || '여행 인원수를 입력해주세요',
  v => v >= 1 || '최소 1명 이상이어야 합니다',
  v => v <= 20 || '최대 20명까지 가능합니다'
]

// Computed
const isValidDateRange = computed(() => {
  if (!formData.value.start_date || !formData.value.end_date) return false
  const startDate = new Date(formData.value.start_date)
  const endDate = new Date(formData.value.end_date)
  return endDate > startDate
})

// Methods
const getDaysCount = () => {
  if (!formData.value.start_date || !formData.value.end_date) return 0
  const startDate = new Date(formData.value.start_date)
  const endDate = new Date(formData.value.end_date)
  const diffTime = Math.abs(endDate - startDate)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const getPreviewDays = () => {
  if (!isValidDateRange.value) return []
  
  const days = []
  const startDate = new Date(formData.value.start_date)
  const daysCount = getDaysCount()
  
  for (let i = 0; i < daysCount; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    
    const dateStr = currentDate.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
    
    days.push(`${i + 1}일차 (${dateStr})`)
  }
  
  return days
}

const createPlan = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    loading.value = true
    
    const planData = {
      ...formData.value,
      // 접근성 요구사항이 없으면 빈 배열로 설정
      accessibility_requirements: formData.value.has_disabled_member 
        ? formData.value.accessibility_requirements 
        : []
    }
    
    const newPlan = await travelPlanStore.createPlan(planData)
    emit('created', newPlan)
  } catch (error) {
    // 에러는 store에서 처리됨
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.preview-days {
  max-height: 200px;
  overflow-y: auto;
}

.v-card {
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .v-card-text {
    padding: 1rem !important;
  }
  
  .v-card-actions {
    padding: 1rem !important;
  }
}
</style>