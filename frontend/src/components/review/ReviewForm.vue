<template>
  <v-card class="review-form" elevation="2">
    <v-card-title class="pb-2">
      <h3 class="text-h5" :class="accessibilityStore.fontSizeClass">
        <v-icon class="mr-2">mdi-comment-edit</v-icon>
        리뷰 작성하기
      </h3>
    </v-card-title>

    <v-card-text>
      <v-form ref="reviewForm" v-model="formValid">
        <!-- 기본 정보 -->
        <div class="mb-6">
          <h4 class="text-h6 mb-4" :class="accessibilityStore.fontSizeClass">기본 정보</h4>
          
          <!-- 리뷰 제목 -->
          <v-text-field
            v-model="reviewData.title"
            label="리뷰 제목"
            placeholder="여행지에 대한 간단한 제목을 입력해주세요"
            :rules="titleRules"
            counter="200"
            required
            class="mb-4"
          ></v-text-field>

          <!-- 전체 평점 -->
          <div class="mb-4">
            <label class="text-subtitle-1 font-weight-medium mb-2 d-block">
              전체 평점 <span class="text-error">*</span>
            </label>
            <div class="d-flex align-center">
              <v-rating
                v-model="reviewData.overall_rating"
                color="amber"
                size="large"
                hover
                half-increments
                class="mr-4"
              ></v-rating>
              <span class="text-h6">{{ reviewData.overall_rating || 0 }}점</span>
            </div>
          </div>

          <!-- 방문 정보 -->
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="reviewData.visit_date"
                label="방문 날짜"
                type="date"
                class="mb-4"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="reviewData.visit_purpose"
                label="방문 목적"
                :items="visitPurposeOptions"
                class="mb-4"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="reviewData.companion_type"
                label="동반자 유형"
                :items="companionTypeOptions"
                class="mb-4"
              ></v-select>
            </v-col>
          </v-row>
        </div>

        <!-- 세부 평점 -->
        <div class="mb-6">
          <h4 class="text-h6 mb-4" :class="accessibilityStore.fontSizeClass">세부 평점</h4>
          
          <v-row>
            <v-col cols="12" md="6">
              <div class="rating-item mb-4">
                <label class="text-subtitle-2 mb-2 d-block">접근성</label>
                <div class="d-flex align-center">
                  <v-rating
                    v-model="reviewData.accessibility_rating"
                    color="blue"
                    size="small"
                    hover
                    half-increments
                    class="mr-2"
                  ></v-rating>
                  <span>{{ reviewData.accessibility_rating || 0 }}점</span>
                </div>
              </div>
            </v-col>
            
            <v-col cols="12" md="6">
              <div class="rating-item mb-4">
                <label class="text-subtitle-2 mb-2 d-block">이동 편의성</label>
                <div class="d-flex align-center">
                  <v-rating
                    v-model="reviewData.mobility_rating"
                    color="green"
                    size="small"
                    hover
                    half-increments
                    class="mr-2"
                  ></v-rating>
                  <span>{{ reviewData.mobility_rating || 0 }}점</span>
                </div>
              </div>
            </v-col>
            
            <v-col cols="12" md="6">
              <div class="rating-item mb-4">
                <label class="text-subtitle-2 mb-2 d-block">시설 편의성</label>
                <div class="d-flex align-center">
                  <v-rating
                    v-model="reviewData.facility_rating"
                    color="orange"
                    size="small"
                    hover
                    half-increments
                    class="mr-2"
                  ></v-rating>
                  <span>{{ reviewData.facility_rating || 0 }}점</span>
                </div>
              </div>
            </v-col>
            
            <v-col cols="12" md="6">
              <div class="rating-item mb-4">
                <label class="text-subtitle-2 mb-2 d-block">서비스</label>
                <div class="d-flex align-center">
                  <v-rating
                    v-model="reviewData.service_rating"
                    color="purple"
                    size="small"
                    hover
                    half-increments
                    class="mr-2"
                  ></v-rating>
                  <span>{{ reviewData.service_rating || 0 }}점</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- 리뷰 내용 -->
        <div class="mb-6">
          <h4 class="text-h6 mb-4" :class="accessibilityStore.fontSizeClass">상세 리뷰</h4>
          
          <v-textarea
            v-model="reviewData.content"
            label="리뷰 내용"
            placeholder="여행지에 대한 자세한 경험을 공유해주세요"
            :rules="contentRules"
            counter="2000"
            rows="6"
            required
            class="mb-4"
          ></v-textarea>
        </div>

        <!-- 접근성 정보 -->
        <div class="mb-6">
          <h4 class="text-h6 mb-4" :class="accessibilityStore.fontSizeClass">접근성 정보</h4>
          
          <!-- 접근성 기능 -->
          <div class="mb-4">
            <label class="text-subtitle-2 mb-2 d-block">이용 가능한 접근성 기능</label>
            <v-select
              v-model="reviewData.accessibility_features"
              :items="accessibilityFeatureOptions"
              label="접근성 기능을 선택해주세요"
              multiple
              chips
              closable-chips
              class="mb-2"
            ></v-select>
          </div>

          <!-- 접근성 문제점 -->
          <div class="mb-4">
            <label class="text-subtitle-2 mb-2 d-block">접근성 문제점</label>
            <v-select
              v-model="reviewData.accessibility_issues"
              :items="accessibilityIssueOptions"
              label="문제점을 선택해주세요"
              multiple
              chips
              closable-chips
              class="mb-2"
            ></v-select>
          </div>

          <!-- 유용한 팁 -->
          <v-textarea
            v-model="reviewData.helpful_tips"
            label="유용한 팁"
            placeholder="다른 이용자들에게 도움이 될 만한 팁을 공유해주세요"
            rows="3"
            class="mb-4"
          ></v-textarea>
        </div>

        <!-- 추천 여부 -->
        <div class="mb-6">
          <v-switch
            v-model="reviewData.would_recommend"
            label="이 여행지를 다른 사람들에게 추천하시겠습니까?"
            color="primary"
            inset
          ></v-switch>
        </div>

        <!-- 이미지 업로드 -->
        <div class="mb-6">
          <h4 class="text-h6 mb-4" :class="accessibilityStore.fontSizeClass">
            <v-icon class="mr-2">mdi-camera</v-icon>
            사진 추가 (선택사항)
          </h4>
          <p class="text-body-2 text-grey-darken-1 mb-4">
            여행지의 접근성 정보나 시설 상태를 보여줄 수 있는 사진을 추가해주세요.
          </p>
          
          <ImageUploader
            :max-files="5"
            :max-file-size="10 * 1024 * 1024"
            @files-selected="handleFilesSelected"
            @upload-complete="handleImageUpload"
            @upload-error="handleImageUploadError"
          />
        </div>
      </v-form>
    </v-card-text>

    <v-card-actions class="px-6 pb-6">
      <v-spacer></v-spacer>
      <v-btn
        variant="outlined"
        @click="$emit('cancel')"
        :disabled="loading"
      >
        취소
      </v-btn>
      <v-btn
        color="primary"
        @click="submitReview"
        :loading="loading"
        :disabled="!formValid"
      >
        리뷰 등록
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'
import { reviewAPI } from '@/api/review'
import ImageUploader from './ImageUploader.vue'

const props = defineProps({
  destinationId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['success', 'cancel'])

const accessibilityStore = useAccessibilityStore()

// State
const formValid = ref(false)
const loading = ref(false)
const reviewForm = ref(null)
const selectedImages = ref([])
const imageUploadData = ref(null)

// Form data
const reviewData = reactive({
  title: '',
  overall_rating: 0,
  accessibility_rating: 0,
  mobility_rating: 0,
  facility_rating: 0,
  service_rating: 0,
  content: '',
  accessibility_features: [],
  accessibility_issues: [],
  helpful_tips: '',
  visit_date: '',
  visit_purpose: '',
  companion_type: '',
  would_recommend: false
})

// Validation rules
const titleRules = [
  v => !!v || '제목을 입력해주세요',
  v => (v && v.length <= 200) || '제목은 200자 이내로 입력해주세요'
]

const contentRules = [
  v => !!v || '리뷰 내용을 입력해주세요',
  v => (v && v.length <= 2000) || '리뷰 내용은 2000자 이내로 입력해주세요'
]

// Options
const visitPurposeOptions = [
  { title: '여가/관광', value: 'leisure' },
  { title: '업무', value: 'business' },
  { title: '의료', value: 'medical' },
  { title: '교육', value: 'education' },
  { title: '기타', value: 'other' }
]

const companionTypeOptions = [
  { title: '혼자', value: 'alone' },
  { title: '가족', value: 'family' },
  { title: '친구', value: 'friend' },
  { title: '간병인/도우미', value: 'caregiver' },
  { title: '단체', value: 'group' }
]

const accessibilityFeatureOptions = [
  { title: '휠체어 접근 가능', value: 'wheelchair_access' },
  { title: '점자 안내', value: 'braille_guide' },
  { title: '음성 안내', value: 'audio_guide' },
  { title: '수어 안내', value: 'sign_language' },
  { title: '엘리베이터', value: 'elevator' },
  { title: '경사로', value: 'ramp' },
  { title: '장애인 주차장', value: 'disabled_parking' },
  { title: '장애인 화장실', value: 'disabled_restroom' },
  { title: '안내 도우미', value: 'guide_assistant' }
]

const accessibilityIssueOptions = [
  { title: '단차', value: 'steps' },
  { title: '좁은 통로', value: 'narrow_path' },
  { title: '가파른 경사', value: 'steep_slope' },
  { title: '부족한 조명', value: 'poor_lighting' },
  { title: '소음', value: 'noise' },
  { title: '복잡한 구조', value: 'complex_layout' },
  { title: '표지판 부족', value: 'lack_of_signs' },
  { title: '도움 요청 어려움', value: 'hard_to_get_help' }
]

// Methods
const handleFilesSelected = (files) => {
  selectedImages.value = files
}

const handleImageUpload = (uploadData) => {
  imageUploadData.value = uploadData
}

const handleImageUploadError = (error) => {
  console.error('이미지 업로드 오류:', error)
  alert('이미지 업로드에 실패했습니다: ' + error)
}

const submitReview = async () => {
  try {
    // 폼 유효성 검사
    const { valid } = await reviewForm.value.validate()
    if (!valid) return

    // 필수 필드 검사
    if (!reviewData.overall_rating || reviewData.overall_rating === 0) {
      alert('전체 평점을 입력해주세요.')
      return
    }

    loading.value = true

    // API 호출을 위한 데이터 준비
    const submitData = {
      user_id: props.userId,
      destination_id: props.destinationId,
      ...reviewData,
      // 0점인 세부 평점은 null로 변경
      accessibility_rating: reviewData.accessibility_rating || null,
      mobility_rating: reviewData.mobility_rating || null,
      facility_rating: reviewData.facility_rating || null,
      service_rating: reviewData.service_rating || null
    }

    // 1. 먼저 리뷰 생성
    const reviewResponse = await reviewAPI.createReview(submitData)
    const reviewId = reviewResponse.data.review_id

    // 2. 이미지가 있는 경우 업로드
    if (selectedImages.value.length > 0 && imageUploadData.value) {
      try {
        // 이미지 업로드를 위한 FormData 생성
        const formData = new FormData()
        
        selectedImages.value.forEach((fileData, index) => {
          formData.append('images', fileData.file)
        })
        
        // 첫 번째 이미지의 타입과 설명을 기본값으로 사용
        if (selectedImages.value[0]) {
          formData.append('imageType', selectedImages.value[0].imageType)
          formData.append('description', selectedImages.value[0].description)
        }

        // 이미지 업로드 API 호출
        await reviewAPI.uploadReviewImages(reviewId, formData)
        
        // 업로드 성공 콜백 호출
        imageUploadData.value.onSuccess()
        
      } catch (imageError) {
        console.error('이미지 업로드 실패:', imageError)
        // 이미지 업로드 실패 시에도 리뷰는 생성된 상태이므로 경고만 표시
        alert('리뷰는 등록되었지만 이미지 업로드에 실패했습니다.')
        imageUploadData.value.onError('이미지 업로드에 실패했습니다.')
      }
    }
    
    emit('success', reviewResponse)
    
  } catch (error) {
    console.error('리뷰 작성 실패:', error)
    
    if (error.response?.status === 409) {
      alert('이미 이 여행지에 대한 리뷰를 작성하셨습니다.')
    } else {
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form {
  max-width: 800px;
  margin: 0 auto;
}

.rating-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;
}

/* 고대비 모드 */
.high-contrast .rating-item {
  border: 2px solid #333;
  background-color: #f0f0f0;
}

/* 애니메이션 감소 모드 */
.reduce-motion .v-rating {
  transition: none;
}
</style>