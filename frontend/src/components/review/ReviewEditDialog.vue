<template>
  <v-dialog
    v-model="localDialog"
    max-width="800"
    persistent
    scrollable
    class="review-edit-dialog"
  >
    <v-card v-if="editingReview">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>리뷰 수정</span>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pb-0">
        <v-form ref="formRef" v-model="isFormValid">
          <!-- 여행지 정보 (읽기 전용) -->
          <div class="mb-4">
            <v-chip
              color="primary"
              variant="outlined"
              class="mb-2"
            >
              <v-icon start size="small">mdi-map-marker</v-icon>
              {{ editingReview.destination?.name || '여행지' }}
            </v-chip>
          </div>

          <!-- 리뷰 제목 -->
          <v-text-field
            v-model="formData.title"
            label="리뷰 제목 *"
            :rules="[rules.required]"
            variant="outlined"
            class="mb-4"
          />

          <!-- 전체 평점 -->
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium mb-2 d-block">전체 평점 *</label>
            <div class="d-flex align-center">
              <v-rating
                v-model="formData.overall_rating"
                color="amber"
                size="large"
                hover
                class="mr-3"
              />
              <span class="text-h6">{{ formData.overall_rating }}점</span>
            </div>
          </div>

          <!-- 세부 평점 -->
          <v-expansion-panels class="mb-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-star-outline</v-icon>
                  세부 평점 (선택사항)
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <label class="text-body-2 font-weight-medium mb-2 d-block">접근성</label>
                    <div class="d-flex align-center mb-3">
                      <v-rating
                        v-model="formData.accessibility_rating"
                        color="blue"
                        size="small"
                        hover
                        clearable
                        class="mr-2"
                      />
                      <span class="text-body-2">{{ formData.accessibility_rating || 0 }}점</span>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <label class="text-body-2 font-weight-medium mb-2 d-block">이동편의성</label>
                    <div class="d-flex align-center mb-3">
                      <v-rating
                        v-model="formData.mobility_rating"
                        color="green"
                        size="small"
                        hover
                        clearable
                        class="mr-2"
                      />
                      <span class="text-body-2">{{ formData.mobility_rating || 0 }}점</span>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <label class="text-body-2 font-weight-medium mb-2 d-block">시설편의성</label>
                    <div class="d-flex align-center mb-3">
                      <v-rating
                        v-model="formData.facility_rating"
                        color="orange"
                        size="small"
                        hover
                        clearable
                        class="mr-2"
                      />
                      <span class="text-body-2">{{ formData.facility_rating || 0 }}점</span>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <label class="text-body-2 font-weight-medium mb-2 d-block">서비스</label>
                    <div class="d-flex align-center mb-3">
                      <v-rating
                        v-model="formData.service_rating"
                        color="purple"
                        size="small"
                        hover
                        clearable
                        class="mr-2"
                      />
                      <span class="text-body-2">{{ formData.service_rating || 0 }}점</span>
                    </div>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- 리뷰 내용 -->
          <v-textarea
            v-model="formData.content"
            label="리뷰 내용 *"
            :rules="[rules.required]"
            variant="outlined"
            rows="5"
            class="mb-4"
          />

          <!-- 접근성 기능 -->
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium mb-2 d-block">이용 가능한 접근성 기능</label>
            <v-chip-group
              v-model="formData.accessibility_features"
              multiple
              column
            >
              <v-chip
                v-for="feature in accessibilityFeatures"
                :key="feature.value"
                :value="feature.value"
                filter
                variant="outlined"
                size="small"
              >
                {{ feature.label }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- 접근성 문제 -->
          <div class="mb-4">
            <label class="text-body-2 font-weight-medium mb-2 d-block">주의사항 및 접근성 문제</label>
            <v-chip-group
              v-model="formData.accessibility_issues"
              multiple
              column
            >
              <v-chip
                v-for="issue in accessibilityIssues"
                :key="issue.value"
                :value="issue.value"
                filter
                variant="outlined"
                size="small"
                color="warning"
              >
                {{ issue.label }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- 유용한 팁 -->
          <v-textarea
            v-model="formData.helpful_tips"
            label="유용한 팁 (선택사항)"
            variant="outlined"
            rows="3"
            class="mb-4"
          />

          <!-- 방문 날짜 -->
          <v-text-field
            v-model="formData.visit_date"
            label="방문 날짜 (선택사항)"
            type="date"
            variant="outlined"
            class="mb-4"
          />

          <!-- 추천 여부 -->
          <div class="mb-4">
            <v-checkbox
              v-model="formData.would_recommend"
              label="이 여행지를 다른 사람에게 추천하시겠습니까?"
              color="success"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          취소
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!isFormValid"
          @click="saveReview"
        >
          수정 완료
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { reviewAPI } from '@/api/review'

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false
  },
  review: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:dialog', 'review-updated'])

// Local dialog state
const localDialog = computed({
  get: () => props.dialog,
  set: (value) => emit('update:dialog', value)
})

// Form state
const formRef = ref(null)
const isFormValid = ref(false)
const loading = ref(false)
const editingReview = ref(null)

// Form data
const formData = ref({
  title: '',
  overall_rating: 5,
  accessibility_rating: null,
  mobility_rating: null,
  facility_rating: null,
  service_rating: null,
  content: '',
  accessibility_features: [],
  accessibility_issues: [],
  helpful_tips: '',
  visit_date: '',
  would_recommend: false
})

// Validation rules
const rules = {
  required: (value) => !!value || '필수 입력 항목입니다.'
}

// 접근성 기능 옵션
const accessibilityFeatures = [
  { label: '휠체어 접근', value: 'wheelchair_access' },
  { label: '점자 안내', value: 'braille_guide' },
  { label: '음성 안내', value: 'audio_guide' },
  { label: '수어 안내', value: 'sign_language' },
  { label: '엘리베이터', value: 'elevator' },
  { label: '경사로', value: 'ramp' },
  { label: '장애인 주차장', value: 'disabled_parking' },
  { label: '장애인 화장실', value: 'disabled_restroom' },
  { label: '안내 도우미', value: 'guide_assistant' }
]

// 접근성 문제 옵션
const accessibilityIssues = [
  { label: '단차', value: 'steps' },
  { label: '좁은 통로', value: 'narrow_path' },
  { label: '가파른 경사', value: 'steep_slope' },
  { label: '부족한 조명', value: 'poor_lighting' },
  { label: '소음', value: 'noise' },
  { label: '복잡한 구조', value: 'complex_layout' },
  { label: '표지판 부족', value: 'lack_of_signs' },
  { label: '도움 요청 어려움', value: 'hard_to_get_help' }
]

// Watch for review changes
watch(() => props.review, (newReview) => {
  if (newReview) {
    editingReview.value = newReview
    // 폼 데이터 초기화
    formData.value = {
      title: newReview.title || '',
      overall_rating: newReview.overall_rating || 5,
      accessibility_rating: newReview.accessibility_rating || null,
      mobility_rating: newReview.mobility_rating || null,
      facility_rating: newReview.facility_rating || null,
      service_rating: newReview.service_rating || null,
      content: newReview.content || '',
      accessibility_features: Array.isArray(newReview.accessibility_features) ? [...newReview.accessibility_features] : [],
      accessibility_issues: Array.isArray(newReview.accessibility_issues) ? [...newReview.accessibility_issues] : [],
      helpful_tips: newReview.helpful_tips || '',
      visit_date: newReview.visit_date ? newReview.visit_date.split('T')[0] : '',
      would_recommend: newReview.would_recommend || false
    }
  }
}, { immediate: true })

// Methods
const closeDialog = () => {
  localDialog.value = false
}

const saveReview = async () => {
  if (!editingReview.value || !isFormValid.value) return

  try {
    loading.value = true

    // API 호출을 위한 데이터 준비
    const updateData = {
      title: formData.value.title,
      overall_rating: formData.value.overall_rating,
      accessibility_rating: formData.value.accessibility_rating,
      mobility_rating: formData.value.mobility_rating,
      facility_rating: formData.value.facility_rating,
      service_rating: formData.value.service_rating,
      content: formData.value.content,
      accessibility_features: formData.value.accessibility_features,
      accessibility_issues: formData.value.accessibility_issues,
      helpful_tips: formData.value.helpful_tips,
      visit_date: formData.value.visit_date || null,
      would_recommend: formData.value.would_recommend
    }

    // API 호출
    const response = await reviewAPI.updateReview(editingReview.value.review_id, updateData)

    if (response.data.success) {
      emit('review-updated', response.data.data)
      closeDialog()
    } else {
      throw new Error(response.data.message || '리뷰 수정에 실패했습니다.')
    }

  } catch (error) {
    console.error('리뷰 수정 실패:', error)
    alert('리뷰 수정에 실패했습니다. 다시 시도해주세요.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-edit-dialog {
  z-index: 2001;
}

.v-chip-group {
  gap: 8px;
}

.v-expansion-panel-text {
  padding-top: 16px;
}
</style>