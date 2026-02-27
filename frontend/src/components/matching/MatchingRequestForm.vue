<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-account-plus" class="mr-3" color="primary" />
      동행 요청하기
      <v-spacer />
      <span v-if="companion" class="text-subtitle-2">
        {{ companion.name }}님에게
      </span>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
      <v-form ref="form" v-model="isFormValid" @submit.prevent="handleSubmit">
        <!-- 여행 계획 선택 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">여행 계획</h3>
          
          <!-- 기존 여행 계획 선택 -->
          <v-radio-group v-model="requestType" class="mb-4">
            <v-radio
              label="기존 여행 계획 사용"
              value="existing"
            />
            <v-radio
              label="새로운 여행 정보 입력"
              value="new"
            />
          </v-radio-group>

          <!-- 기존 계획 선택 -->
          <v-select
            v-if="requestType === 'existing'"
            v-model="formData.travel_plan_id"
            :items="travelPlans"
            item-title="title"
            item-value="plan_id"
            label="여행 계획 선택"
            variant="outlined"
            class="mb-4"
            :rules="requestType === 'existing' ? [rules.required] : []"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-subtitle>
                  {{ formatDateRange(item.raw.start_date, item.raw.end_date) }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <!-- 새로운 여행 정보 -->
          <div v-if="requestType === 'new'">
            <v-text-field
              v-model="formData.travel_destination"
              label="여행 목적지"
              variant="outlined"
              class="mb-4"
              :rules="requestType === 'new' ? [rules.required] : []"
            />
            
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.travel_start_date"
                  label="시작일"
                  type="date"
                  variant="outlined"
                  :rules="requestType === 'new' ? [rules.required] : []"
                  :min="minDate"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.travel_end_date"
                  label="종료일"
                  type="date"
                  variant="outlined"
                  :rules="requestType === 'new' ? [rules.required, rules.endDateValid] : []"
                  :min="formData.travel_start_date || minDate"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model.number="formData.travelers_count"
              label="여행 인원수"
              type="number"
              variant="outlined"
              min="1"
              max="10"
              class="mb-4"
              :rules="requestType === 'new' ? [rules.required] : []"
            />
          </div>
        </div>

        <!-- 필요한 서비스 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">필요한 동행 서비스</h3>
          <v-row>
            <v-col
              v-for="service in availableServices"
              :key="service.value"
              cols="12"
              sm="6"
              md="4"
            >
              <v-checkbox
                v-model="formData.required_services"
                :label="service.label"
                :value="service.value"
                color="primary"
                density="compact"
              >
                <template v-slot:prepend>
                  <v-icon :icon="service.icon" size="small" />
                </template>
              </v-checkbox>
            </v-col>
          </v-row>
        </div>

        <!-- 요청 메시지 -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4">요청 메시지</h3>
          <v-textarea
            v-model="formData.request_message"
            label="동행인에게 전할 메시지"
            variant="outlined"
            rows="4"
            placeholder="안녕하세요! 저와 함께 여행하실 동행인을 찾고 있습니다. 자세한 사항은 메시지로 논의하면 좋겠습니다."
            :rules="[rules.required]"
          />
        </div>

        <!-- 특별 요구사항 -->
        <div>
          <h3 class="text-h6 mb-4">특별 요구사항 (선택사항)</h3>
          <v-textarea
            v-model="formData.special_requirements"
            label="추가로 알려주실 사항이 있다면 적어주세요"
            variant="outlined"
            rows="3"
            placeholder="예: 휠체어 사용, 특정 시간대 지원 필요, 언어 지원 등"
          />
        </div>
      </v-form>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-6">
      <v-spacer />
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
        :disabled="!isFormValid"
        @click="handleSubmit"
      >
        <v-icon start>mdi-send</v-icon>
        요청 보내기
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTravelPlanStore } from '@/stores/travelPlan'

const props = defineProps({
  companion: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

const authStore = useAuthStore()
const travelPlanStore = useTravelPlanStore()

// State
const form = ref(null)
const isFormValid = ref(false)
const loading = ref(false)
const requestType = ref('existing')
const travelPlans = ref([])

// 오늘 날짜
const minDate = new Date().toISOString().split('T')[0]

// 폼 데이터
const formData = reactive({
  travel_plan_id: null,
  travel_destination: '',
  travel_start_date: '',
  travel_end_date: '',
  travelers_count: 1,
  required_services: [],
  request_message: '',
  special_requirements: ''
})

// 유효성 검사 규칙
const rules = {
  required: v => !!v || '필수 항목입니다',
  endDateValid: v => {
    if (!formData.travel_start_date || !v) return true
    return new Date(v) >= new Date(formData.travel_start_date) || '종료일은 시작일 이후여야 합니다'
  }
}

// 서비스 옵션
const availableServices = [
  { value: 'mobility_assistance', label: '이동 지원', icon: 'mdi-wheelchair-accessibility' },
  { value: 'visual_assistance', label: '시각 지원', icon: 'mdi-eye' },
  { value: 'hearing_assistance', label: '청각 지원', icon: 'mdi-ear-hearing' },
  { value: 'communication_support', label: '의사소통 지원', icon: 'mdi-message-text' },
  { value: 'medical_assistance', label: '의료 지원', icon: 'mdi-medical-bag' },
  { value: 'daily_living_support', label: '일상생활 지원', icon: 'mdi-hand-heart' },
  { value: 'emergency_support', label: '응급상황 대응', icon: 'mdi-alert-circle' },
  { value: 'transportation', label: '교통수단 이용', icon: 'mdi-car' }
]

// Methods
const loadTravelPlans = async () => {
  try {
    await travelPlanStore.fetchUserPlans()
    travelPlans.value = travelPlanStore.plans.filter(plan => 
      plan.status === 'draft' || plan.status === 'confirmed'
    )
  } catch (error) {
    console.error('여행 계획 로드 실패:', error)
  }
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const startStr = start.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
  const endStr = end.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  })
  
  return `${startStr} ~ ${endStr}`
}

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    loading.value = true
    
    // 선택된 여행 계획의 정보 추출
    if (requestType.value === 'existing' && formData.travel_plan_id) {
      const selectedPlan = travelPlans.value.find(plan => plan.plan_id === formData.travel_plan_id)
      if (selectedPlan) {
        formData.travel_destination = selectedPlan.title
        formData.travel_start_date = selectedPlan.start_date
        formData.travel_end_date = selectedPlan.end_date
        formData.travelers_count = selectedPlan.travelers_count
      }
    }
    
    // 요청 데이터 준비
    const requestData = {
      companion_id: props.companion.user_id,
      travel_plan_id: requestType.value === 'existing' ? formData.travel_plan_id : null,
      request_message: formData.request_message,
      travel_start_date: formData.travel_start_date,
      travel_end_date: formData.travel_end_date,
      travel_destination: formData.travel_destination,
      travelers_count: formData.travelers_count,
      required_services: formData.required_services,
      special_requirements: formData.special_requirements || null
    }
    
    emit('submit', requestData)
  } catch (error) {
    console.error('요청 처리 실패:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadTravelPlans()
  
  // 기본 메시지 설정
  formData.request_message = `안녕하세요! ${props.companion.name}님께 동행을 요청드리고 싶습니다. 함께 즐거운 여행을 만들어가면 좋겠습니다.`
})
</script>

<style scoped>
.v-card {
  max-height: 90vh;
  overflow-y: auto;
}

:deep(.v-input__details) {
  padding-top: 8px;
}
</style>