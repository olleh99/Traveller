<template>
  <div class="review-list">
    <!-- 리뷰 통계 -->
    <v-card v-if="statistics" class="mb-6" elevation="2">
      <v-card-title class="pb-2">
        <h3 class="text-h5" :class="accessibilityStore.fontSizeClass">
          <v-icon class="mr-2">mdi-chart-box</v-icon>
          리뷰 통계
        </h3>
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3" class="text-center">
            <div class="mb-2">
              <span class="text-h4 font-weight-bold text-primary">
                {{ statistics.averageRating }}
              </span>
              <span class="text-h6">/5.0</span>
            </div>
            <v-rating
              :model-value="parseFloat(statistics.averageRating)"
              readonly
              color="amber"
              half-increments
              size="small"
              class="mb-2"
            ></v-rating>
            <div class="text-body-2 text-grey-darken-1">
              총 {{ statistics.totalReviews }}개 리뷰
            </div>
          </v-col>
          
          <v-col cols="12" md="9">
            <div class="detailed-ratings">
              <div class="rating-row mb-2">
                <span class="rating-label">접근성</span>
                <v-rating
                  :model-value="parseFloat(statistics.averageAccessibilityRating)"
                  readonly
                  color="blue"
                  size="small"
                  half-increments
                  class="mx-3"
                ></v-rating>
                <span class="rating-value">{{ statistics.averageAccessibilityRating }}</span>
              </div>
              
              <div class="rating-row mb-2">
                <span class="rating-label">이동편의성</span>
                <v-rating
                  :model-value="parseFloat(statistics.averageMobilityRating)"
                  readonly
                  color="green"
                  size="small"
                  half-increments
                  class="mx-3"
                ></v-rating>
                <span class="rating-value">{{ statistics.averageMobilityRating }}</span>
              </div>
              
              <div class="rating-row mb-2">
                <span class="rating-label">시설편의성</span>
                <v-rating
                  :model-value="parseFloat(statistics.averageFacilityRating)"
                  readonly
                  color="orange"
                  size="small"
                  half-increments
                  class="mx-3"
                ></v-rating>
                <span class="rating-value">{{ statistics.averageFacilityRating }}</span>
              </div>
              
              <div class="rating-row">
                <span class="rating-label">서비스</span>
                <v-rating
                  :model-value="parseFloat(statistics.averageServiceRating)"
                  readonly
                  color="purple"
                  size="small"
                  half-increments
                  class="mx-3"
                ></v-rating>
                <span class="rating-value">{{ statistics.averageServiceRating }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 정렬 및 필터 -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h5" :class="accessibilityStore.fontSizeClass">
        리뷰 {{ totalReviews }}개
      </h3>
      
      <v-select
        v-model="sortOption"
        :items="sortOptions"
        label="정렬"
        variant="outlined"
        density="compact"
        style="max-width: 200px;"
        @update:model-value="loadReviews"
      ></v-select>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
      <p class="mt-4 text-h6">리뷰를 불러오는 중...</p>
    </div>

    <!-- 리뷰 목록 -->
    <div v-else-if="reviews.length > 0">
      <v-card
        v-for="review in reviews"
        :key="review.review_id"
        class="review-item mb-4"
        elevation="1"
      >
        <v-card-text>
          <!-- 리뷰 헤더 -->
          <div class="d-flex justify-space-between align-start mb-3">
            <div class="flex-grow-1">
              <div class="d-flex align-center mb-2">
                <v-rating
                  :model-value="review.overall_rating"
                  readonly
                  color="amber"
                  size="small"
                  class="mr-2"
                ></v-rating>
                <span class="text-h6 font-weight-bold">{{ review.overall_rating }}점</span>
                
                <v-chip
                  v-if="review.would_recommend"
                  color="success"
                  size="small"
                  class="ml-3"
                >
                  <v-icon start size="small">mdi-thumb-up</v-icon>
                  추천
                </v-chip>
              </div>
              
              <h4 class="text-h6 mb-2" :class="accessibilityStore.fontSizeClass">
                {{ review.title }}
              </h4>
            </div>
            
            <div class="text-right">
              <div class="text-body-2 text-grey-darken-1">
                {{ review.user?.name || '익명' }}
              </div>
              <div class="text-caption text-grey-darken-1">
                {{ formatDate(review.created_at) }}
              </div>
            </div>
          </div>

          <!-- 세부 평점 -->
          <div v-if="hasDetailedRatings(review)" class="detailed-ratings-compact mb-3">
            <div class="d-flex flex-wrap gap-3">
              <div v-if="review.accessibility_rating" class="rating-chip">
                <span class="text-caption">접근성</span>
                <v-rating
                  :model-value="review.accessibility_rating"
                  readonly
                  color="blue"
                  size="x-small"
                  class="mx-1"
                ></v-rating>
                <span class="text-caption">{{ review.accessibility_rating }}</span>
              </div>
              
              <div v-if="review.mobility_rating" class="rating-chip">
                <span class="text-caption">이동편의성</span>
                <v-rating
                  :model-value="review.mobility_rating"
                  readonly
                  color="green"
                  size="x-small"
                  class="mx-1"
                ></v-rating>
                <span class="text-caption">{{ review.mobility_rating }}</span>
              </div>
              
              <div v-if="review.facility_rating" class="rating-chip">
                <span class="text-caption">시설편의성</span>
                <v-rating
                  :model-value="review.facility_rating"
                  readonly
                  color="orange"
                  size="x-small"
                  class="mx-1"
                ></v-rating>
                <span class="text-caption">{{ review.facility_rating }}</span>
              </div>
              
              <div v-if="review.service_rating" class="rating-chip">
                <span class="text-caption">서비스</span>
                <v-rating
                  :model-value="review.service_rating"
                  readonly
                  color="purple"
                  size="x-small"
                  class="mx-1"
                ></v-rating>
                <span class="text-caption">{{ review.service_rating }}</span>
              </div>
            </div>
          </div>

          <!-- 리뷰 내용 -->
          <div class="review-content mb-3">
            <p class="text-body-1" :class="accessibilityStore.fontSizeClass">
              {{ review.content }}
            </p>
          </div>

          <!-- 리뷰 이미지 -->
          <div v-if="review.images && review.images.length > 0" class="review-images mb-3">
            <div class="image-gallery">
              <div 
                v-for="(image, index) in review.images.slice(0, 4)" 
                :key="image.image_id"
                class="image-item"
                :class="{ 'image-more': index === 3 && review.images.length > 4 }"
                @click="openImageGallery(review.images, index)"
              >
                <v-img
                  :src="`http://localhost:3000${image.image_url}`"
                  :alt="image.description || `리뷰 이미지 ${index + 1}`"
                  :height="index === 0 ? 200 : 120"
                  cover
                  class="rounded cursor-pointer"
                  :class="{ 'first-image': index === 0 }"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                    </div>
                  </template>
                  
                  <!-- 추가 이미지 개수 표시 -->
                  <div 
                    v-if="index === 3 && review.images.length > 4" 
                    class="image-overlay d-flex align-center justify-center"
                  >
                    <div class="text-white text-h5 font-weight-bold">
                      +{{ review.images.length - 4 }}
                    </div>
                  </div>
                  
                  <!-- 이미지 타입 배지 -->
                  <div class="image-type-badge">
                    <v-chip
                      :color="getImageTypeColor(image.image_type)"
                      size="x-small"
                      variant="flat"
                      class="text-white"
                    >
                      {{ getImageTypeLabel(image.image_type) }}
                    </v-chip>
                  </div>
                </v-img>
              </div>
            </div>
          </div>

          <!-- 접근성 정보 -->
          <div v-if="review.accessibility_features?.length > 0 || review.accessibility_issues?.length > 0" class="accessibility-info mb-3">
            <div v-if="review.accessibility_features?.length > 0" class="mb-2">
              <span class="text-body-2 font-weight-medium text-success">이용 가능한 기능:</span>
              <v-chip
                v-for="feature in review.accessibility_features"
                :key="feature"
                size="small"
                color="success"
                variant="outlined"
                class="ml-2 mr-1 mb-1"
              >
                {{ getAccessibilityFeatureLabel(feature) }}
              </v-chip>
            </div>
            
            <div v-if="review.accessibility_issues?.length > 0">
              <span class="text-body-2 font-weight-medium text-warning">주의사항:</span>
              <v-chip
                v-for="issue in review.accessibility_issues"
                :key="issue"
                size="small"
                color="warning"
                variant="outlined"
                class="ml-2 mr-1 mb-1"
              >
                {{ getAccessibilityIssueLabel(issue) }}
              </v-chip>
            </div>
          </div>

          <!-- 유용한 팁 -->
          <div v-if="review.helpful_tips" class="helpful-tips mb-3">
            <div class="bg-blue-lighten-5 pa-3 rounded">
              <div class="d-flex align-center mb-2">
                <v-icon color="blue" class="mr-2">mdi-lightbulb</v-icon>
                <span class="text-body-2 font-weight-medium text-blue">유용한 팁</span>
              </div>
              <p class="text-body-2 mb-0">{{ review.helpful_tips }}</p>
            </div>
          </div>

          <!-- 방문 정보 -->
          <div v-if="review.visit_date || review.visit_purpose || review.companion_type" class="visit-info mb-3">
            <div class="d-flex flex-wrap gap-2">
              <v-chip v-if="review.visit_date" size="small" variant="outlined">
                <v-icon start size="small">mdi-calendar</v-icon>
                {{ formatDate(review.visit_date) }}
              </v-chip>
              <v-chip v-if="review.visit_purpose" size="small" variant="outlined">
                <v-icon start size="small">mdi-target</v-icon>
                {{ getVisitPurposeLabel(review.visit_purpose) }}
              </v-chip>
              <v-chip v-if="review.companion_type" size="small" variant="outlined">
                <v-icon start size="small">mdi-account-group</v-icon>
                {{ getCompanionTypeLabel(review.companion_type) }}
              </v-chip>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="d-flex justify-space-between align-center">
            <v-btn
              variant="text"
              size="small"
              @click="toggleHelpful(review)"
              :disabled="helpfulLoading === review.review_id"
            >
              <v-icon start>mdi-thumb-up</v-icon>
              도움됨 {{ review.helpful_count || 0 }}
            </v-btn>
            
            <div class="text-caption text-grey-darken-1">
              {{ formatDate(review.created_at) }}
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          @update:model-value="loadReviews"
        ></v-pagination>
      </div>
    </div>

    <!-- 리뷰 없음 -->
    <div v-else class="text-center py-8">
      <v-icon size="64" color="grey-lighten-1">mdi-comment-off</v-icon>
      <h3 class="text-h6 mt-4 mb-2">아직 리뷰가 없습니다</h3>
      <p class="text-body-2 text-grey-darken-1">
        첫 번째 리뷰를 작성해보세요!
      </p>
    </div>

    <!-- 이미지 갤러리 다이얼로그 -->
    <v-dialog
      v-model="showImageGallery"
      max-width="900"
      class="image-gallery-dialog"
    >
      <v-card v-if="selectedImages.length > 0">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>이미지 갤러리 ({{ selectedImageIndex + 1 }} / {{ selectedImages.length }})</span>
          <v-btn
            icon
            variant="text"
            @click="showImageGallery = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <div class="gallery-container">
            <!-- 메인 이미지 -->
            <div class="main-image-container">
              <v-img
                :src="`http://localhost:3000${selectedImages[selectedImageIndex].image_url}`"
                :alt="selectedImages[selectedImageIndex].description || '리뷰 이미지'"
                max-height="500"
                contain
                class="main-image"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </div>
                </template>
              </v-img>
              
              <!-- 네비게이션 버튼 -->
              <v-btn
                v-if="selectedImages.length > 1"
                icon
                size="large"
                color="white"
                class="nav-btn nav-btn-prev"
                @click="previousImage"
                :disabled="selectedImageIndex === 0"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              
              <v-btn
                v-if="selectedImages.length > 1"
                icon
                size="large"
                color="white"
                class="nav-btn nav-btn-next"
                @click="nextImage"
                :disabled="selectedImageIndex === selectedImages.length - 1"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
            
            <!-- 이미지 정보 -->
            <div class="image-info pa-4">
              <div class="d-flex align-center mb-2">
                <v-chip
                  :color="getImageTypeColor(selectedImages[selectedImageIndex].image_type)"
                  size="small"
                  class="mr-2"
                >
                  {{ getImageTypeLabel(selectedImages[selectedImageIndex].image_type) }}
                </v-chip>
                <span class="text-caption text-grey-darken-1">
                  {{ selectedImages[selectedImageIndex].display_order + 1 }}번째 이미지
                </span>
              </div>
              
              <p v-if="selectedImages[selectedImageIndex].description" class="text-body-2 mb-0">
                {{ selectedImages[selectedImageIndex].description }}
              </p>
            </div>
            
            <!-- 썸네일 목록 -->
            <div v-if="selectedImages.length > 1" class="thumbnails-container pa-2">
              <div class="thumbnails-list">
                <div
                  v-for="(image, index) in selectedImages"
                  :key="image.image_id"
                  class="thumbnail-item"
                  :class="{ 'thumbnail-active': index === selectedImageIndex }"
                  @click="selectedImageIndex = index"
                >
                  <v-img
                    :src="`http://localhost:3000${image.image_url}`"
                    :alt="`썸네일 ${index + 1}`"
                    height="60"
                    width="60"
                    cover
                    class="rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'
import { reviewAPI } from '@/api/review'

const props = defineProps({
  destinationId: {
    type: String,
    required: true
  }
})

// 필요한 경우 emit 추가 가능

const accessibilityStore = useAccessibilityStore()

// State
const reviews = ref([])
const statistics = ref(null)
const loading = ref(false)
const helpfulLoading = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalReviews = ref(0)
const sortOption = ref('created_at_desc')
const showImageGallery = ref(false)
const selectedImages = ref([])
const selectedImageIndex = ref(0)

// 정렬 옵션
const sortOptions = [
  { title: '최신순', value: 'created_at_desc' },
  { title: '평점 높은순', value: 'overall_rating_desc' },
  { title: '평점 낮은순', value: 'overall_rating_asc' },
  { title: '도움됨 많은순', value: 'helpful_count_desc' }
]

// Computed
const sortBy = computed(() => {
  // created_at_desc → created_at
  // overall_rating_desc → overall_rating
  // helpful_count_desc → helpful_count
  const parts = sortOption.value.split('_')
  if (parts[0] === 'created' && parts[1] === 'at') {
    return 'created_at'
  } else if (parts[0] === 'overall' && parts[1] === 'rating') {
    return 'overall_rating'
  } else if (parts[0] === 'helpful' && parts[1] === 'count') {
    return 'helpful_count'
  }
  return parts[0]
})

const sortOrder = computed(() => {
  const parts = sortOption.value.split('_')
  return parts[parts.length - 1].toUpperCase()
})

// Methods
const loadReviews = async () => {
  try {
    loading.value = true
    
    const response = await reviewAPI.getReviewsByDestination(props.destinationId, {
      page: currentPage.value,
      limit: 10,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    
    reviews.value = response.data?.reviews || []
    statistics.value = response.data?.statistics || null
    totalPages.value = response.data?.pagination?.totalPages || 1
    totalReviews.value = response.data?.pagination?.totalItems || 0
    
  } catch (error) {
    console.error('리뷰 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

const toggleHelpful = async (review) => {
  try {
    helpfulLoading.value = review.review_id
    
    const response = await reviewAPI.toggleHelpful(review.review_id)
    
    // 로컬 상태 업데이트
    review.helpful_count = response.helpful_count
    
  } catch (error) {
    console.error('도움됨 처리 실패:', error)
  } finally {
    helpfulLoading.value = null
  }
}

// viewDetail 메서드 제거됨 - 모든 내용을 바로 표시

const hasDetailedRatings = (review) => {
  return review.accessibility_rating || review.mobility_rating || 
         review.facility_rating || review.service_rating
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

// Label mapping functions
const getAccessibilityFeatureLabel = (value) => {
  const labels = {
    'wheelchair_access': '휠체어 접근',
    'braille_guide': '점자 안내',
    'audio_guide': '음성 안내',
    'sign_language': '수어 안내',
    'elevator': '엘리베이터',
    'ramp': '경사로',
    'disabled_parking': '장애인 주차장',
    'disabled_restroom': '장애인 화장실',
    'guide_assistant': '안내 도우미'
  }
  return labels[value] || value
}

const getAccessibilityIssueLabel = (value) => {
  const labels = {
    'steps': '단차',
    'narrow_path': '좁은 통로',
    'steep_slope': '가파른 경사',
    'poor_lighting': '부족한 조명',
    'noise': '소음',
    'complex_layout': '복잡한 구조',
    'lack_of_signs': '표지판 부족',
    'hard_to_get_help': '도움 요청 어려움'
  }
  return labels[value] || value
}

const getVisitPurposeLabel = (value) => {
  const labels = {
    'leisure': '여가/관광',
    'business': '업무',
    'medical': '의료',
    'education': '교육',
    'other': '기타'
  }
  return labels[value] || value
}

const getCompanionTypeLabel = (value) => {
  const labels = {
    'alone': '혼자',
    'family': '가족',
    'friend': '친구',
    'caregiver': '간병인/도우미',
    'group': '단체'
  }
  return labels[value] || value
}

// 이미지 관련 메서드
const openImageGallery = (images, startIndex = 0) => {
  selectedImages.value = images
  selectedImageIndex.value = startIndex
  showImageGallery.value = true
}

const getImageTypeLabel = (type) => {
  const labels = {
    'general': '일반',
    'accessibility': '접근성',
    'facility': '시설'
  }
  return labels[type] || '일반'
}

const getImageTypeColor = (type) => {
  const colors = {
    'general': 'blue',
    'accessibility': 'green',
    'facility': 'orange'
  }
  return colors[type] || 'blue'
}

const previousImage = () => {
  if (selectedImageIndex.value > 0) {
    selectedImageIndex.value--
  }
}

const nextImage = () => {
  if (selectedImageIndex.value < selectedImages.value.length - 1) {
    selectedImageIndex.value++
  }
}

// Lifecycle
onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.review-item {
  transition: all 0.3s ease;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rating-row {
  display: flex;
  align-items: center;
}

.rating-label {
  min-width: 80px;
  font-size: 0.875rem;
}

.rating-value {
  min-width: 32px;
  font-size: 0.875rem;
  font-weight: 500;
}

.detailed-ratings-compact .rating-chip {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 16px;
  padding: 4px 8px;
}

.review-content {
  line-height: 1.6;
}

.accessibility-info {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 12px;
}

.helpful-tips {
  border-left: 4px solid #2196f3;
}

.visit-info {
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

/* 고대비 모드 */
.high-contrast .review-item {
  border: 2px solid #333;
}

.high-contrast .accessibility-info {
  border: 1px solid #666;
}

/* 애니메이션 감소 모드 */
.reduce-motion .review-item {
  transition: none;
}

.reduce-motion .review-item:hover {
  transform: none;
}

/* 이미지 갤러리 스타일 */
.review-images {
  border-radius: 12px;
  overflow: hidden;
}

.image-gallery {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 200px 120px;
  gap: 4px;
  max-height: 320px;
}

.image-gallery .image-item:first-child {
  grid-row: 1 / 3;
  grid-column: 1;
}

.image-gallery .image-item:nth-child(2) {
  grid-row: 1;
  grid-column: 2;
}

.image-gallery .image-item:nth-child(3) {
  grid-row: 2;
  grid-column: 2;
}

.image-gallery .image-item:nth-child(4) {
  grid-row: 1 / 3;
  grid-column: 3;
}

.image-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-item:hover {
  transform: scale(1.02);
  z-index: 2;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

.image-type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
}

.cursor-pointer {
  cursor: pointer;
}

/* 갤러리 다이얼로그 스타일 */
.image-gallery-dialog {
  z-index: 2000;
}

.gallery-container {
  position: relative;
}

.main-image-container {
  position: relative;
  background-color: #f5f5f5;
}

.main-image {
  background-color: #fafafa;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-btn-prev {
  left: 16px;
}

.nav-btn-next {
  right: 16px;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 1) !important;
}

.image-info {
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.thumbnails-container {
  border-top: 1px solid #e0e0e0;
  background-color: #f5f5f5;
}

.thumbnails-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px;
}

.thumbnail-item {
  flex-shrink: 0;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-radius: 8px;
}

.thumbnail-item:hover {
  transform: scale(1.05);
}

.thumbnail-active {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .image-gallery {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 200px 120px;
    max-height: 320px;
  }
  
  .image-gallery .image-item:first-child {
    grid-row: 1;
    grid-column: 1 / 3;
  }
  
  .image-gallery .image-item:nth-child(2) {
    grid-row: 2;
    grid-column: 1;
  }
  
  .image-gallery .image-item:nth-child(3) {
    grid-row: 2;
    grid-column: 2;
  }
  
  .image-gallery .image-item:nth-child(4) {
    display: none;
  }
  
  .nav-btn {
    display: none;
  }
  
  .thumbnails-list {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .image-gallery {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 8px;
  }
  
  .image-gallery .image-item {
    grid-row: auto !important;
    grid-column: 1 !important;
  }
  
  .image-gallery .image-item:nth-child(n+3) {
    display: none;
  }
}
</style>