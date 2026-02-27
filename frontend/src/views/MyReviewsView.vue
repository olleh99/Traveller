<template>
  <div class="my-reviews-page">
    <v-container class="py-8">
      <!-- 페이지 헤더 -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">
            <v-icon size="large" class="mr-3">mdi-comment-text</v-icon>
            나의 리뷰
          </h1>
          <p class="text-h6 text-grey-darken-1">
            내가 작성한 리뷰를 관리하고 수정할 수 있습니다
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-arrow-left"
          @click="$router.go(-1)"
        >
          돌아가기
        </v-btn>
      </div>

      <!-- 통계 카드 -->
      <v-row v-if="statistics" class="mb-6">
        <v-col cols="12" md="4">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="blue-lighten-5" class="mb-3">
              <v-icon size="32" color="blue">mdi-comment-multiple</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-blue mb-1">
              {{ statistics.totalReviews }}
            </h3>
            <p class="text-body-1 font-weight-medium">작성한 리뷰</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="amber-lighten-5" class="mb-3">
              <v-icon size="32" color="amber">mdi-star</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-amber mb-1">
              {{ statistics.averageRating }}
            </h3>
            <p class="text-body-1 font-weight-medium">평균 평점</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="green-lighten-5" class="mb-3">
              <v-icon size="32" color="green">mdi-thumb-up</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-green mb-1">
              {{ statistics.totalHelpful }}
            </h3>
            <p class="text-body-1 font-weight-medium">받은 도움됨</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- 정렬 및 필터 -->
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h5">
          리뷰 목록 ({{ totalReviews }}개)
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
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="text-h6 mt-4">리뷰를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="mb-6"
      >
        <template v-slot:title>오류가 발생했습니다</template>
        {{ error }}
        <template v-slot:append>
          <v-btn variant="text" @click="loadReviews">다시 시도</v-btn>
        </template>
      </v-alert>

      <!-- 리뷰 없음 -->
      <div v-else-if="reviews.length === 0" class="text-center py-12">
        <v-icon size="120" color="grey-lighten-1">mdi-comment-off</v-icon>
        <h3 class="text-h4 mt-4 mb-2">작성한 리뷰가 없습니다</h3>
        <p class="text-body-1 mb-6 text-grey-darken-1">
          여행지를 방문하고 첫 번째 리뷰를 작성해보세요!
        </p>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-map-search"
          @click="$router.push('/destinations')"
        >
          여행지 둘러보기
        </v-btn>
      </div>

      <!-- 리뷰 목록 -->
      <div v-else>
        <v-card
          v-for="review in reviews"
          :key="review.review_id"
          class="review-item mb-4"
          elevation="2"
        >
          <v-card-text>
            <!-- 리뷰 헤더 -->
            <div class="d-flex justify-space-between align-start mb-3">
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-2">
                  <v-chip
                    color="primary"
                    variant="outlined"
                    size="small"
                    class="mr-2"
                    @click="goToDestination(review.destination)"
                  >
                    <v-icon start size="small">mdi-map-marker</v-icon>
                    {{ review.destination?.name || '여행지' }}
                  </v-chip>
                  <v-chip
                    color="grey"
                    variant="outlined"
                    size="small"
                  >
                    {{ getCategoryName(review.destination?.category) }}
                  </v-chip>
                </div>
                
                <h4 class="text-h6 mb-2">{{ review.title }}</h4>
                
                <div class="d-flex align-center mb-2">
                  <v-rating
                    :model-value="review.overall_rating"
                    readonly
                    color="amber"
                    size="small"
                    class="mr-2"
                  ></v-rating>
                  <span class="text-h6 font-weight-bold mr-3">{{ review.overall_rating }}점</span>
                  
                  <v-chip
                    v-if="review.would_recommend"
                    color="success"
                    size="small"
                  >
                    <v-icon start size="small">mdi-thumb-up</v-icon>
                    추천
                  </v-chip>
                </div>
              </div>
              
              <div class="text-right">
                <div class="text-caption text-grey-darken-1 mb-2">
                  {{ formatDate(review.created_at) }}
                </div>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item @click="editReview(review)">
                      <template v-slot:prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>수정</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="confirmDeleteReview(review)" class="text-error">
                      <template v-slot:prepend>
                        <v-icon>mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>삭제</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
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
              <p class="text-body-1">{{ review.content }}</p>
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
                  >
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                      </div>
                    </template>
                    
                    <div 
                      v-if="index === 3 && review.images.length > 4" 
                      class="image-overlay d-flex align-center justify-center"
                    >
                      <div class="text-white text-h5 font-weight-bold">
                        +{{ review.images.length - 4 }}
                      </div>
                    </div>
                    
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

            <!-- 하단 정보 -->
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center gap-2">
                <v-chip size="small" variant="outlined">
                  <v-icon start size="small">mdi-thumb-up</v-icon>
                  도움됨 {{ review.helpful_count || 0 }}
                </v-chip>
                <v-chip v-if="review.visit_date" size="small" variant="outlined">
                  <v-icon start size="small">mdi-calendar</v-icon>
                  {{ formatDate(review.visit_date) }}
                </v-chip>
              </div>
              <v-btn
                variant="text"
                size="small"
                color="primary"
                @click="goToDestination(review.destination)"
              >
                여행지 보기
                <v-icon end size="small">mdi-arrow-right</v-icon>
              </v-btn>
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
    </v-container>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>리뷰 삭제</v-card-title>
        <v-card-text>
          <p>정말로 "{{ deleteTarget?.title }}" 리뷰를 삭제하시겠습니까?</p>
          <p class="text-caption text-error mt-2">
            삭제된 리뷰는 복구할 수 없습니다.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">취소</v-btn>
          <v-btn
            color="error"
            variant="text"
            :loading="deleteLoading"
            @click="deleteReview"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 리뷰 수정 다이얼로그 -->
    <ReviewEditDialog
      v-model:dialog="showEditDialog"
      :review="editTarget"
      @review-updated="onReviewUpdated"
    />

    <!-- 이미지 갤러리 (ReviewList와 동일한 구조 재사용) -->
    <v-dialog
      v-model="showImageGallery"
      max-width="900"
      class="image-gallery-dialog"
    >
      <v-card v-if="selectedImages.length > 0">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>이미지 갤러리 ({{ selectedImageIndex + 1 }} / {{ selectedImages.length }})</span>
          <v-btn icon variant="text" @click="showImageGallery = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <div class="gallery-container">
            <div class="main-image-container">
              <v-img
                :src="`http://localhost:3000${selectedImages[selectedImageIndex].image_url}`"
                :alt="selectedImages[selectedImageIndex].description || '리뷰 이미지'"
                max-height="500"
                contain
                class="main-image"
              />
              
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
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { reviewAPI } from '@/api/review'
import ReviewEditDialog from '@/components/review/ReviewEditDialog.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const reviews = ref([])
const statistics = ref(null)
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalReviews = ref(0)
const sortOption = ref('created_at_desc')

// Delete dialog
const showDeleteDialog = ref(false)
const deleteTarget = ref(null)
const deleteLoading = ref(false)

// Edit dialog
const showEditDialog = ref(false)
const editTarget = ref(null)

// Image gallery
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
  if (!authStore.user?.user_id) {
    router.push('/login')
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const response = await reviewAPI.getReviewsByUser(authStore.user.user_id, {
      page: currentPage.value,
      limit: 10,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    
    if (response.data) {
      reviews.value = response.data.reviews || []
      statistics.value = response.data.statistics || null
      totalPages.value = response.data.pagination?.totalPages || 1
      totalReviews.value = response.data.pagination?.totalItems || 0
    }
    
  } catch (err) {
    console.error('리뷰 목록 로드 실패:', err)
    error.value = '리뷰 목록을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

const editReview = (review) => {
  editTarget.value = review
  showEditDialog.value = true
}

const onReviewUpdated = (updatedReview) => {
  // 로컬 상태에서 리뷰 업데이트
  const index = reviews.value.findIndex(
    review => review.review_id === updatedReview.review_id
  )
  
  if (index !== -1) {
    reviews.value[index] = updatedReview
  }
  
  // 통계 재계산을 위해 페이지 새로고침
  loadReviews()
}

const confirmDeleteReview = (review) => {
  deleteTarget.value = review
  showDeleteDialog.value = true
}

const deleteReview = async () => {
  if (!deleteTarget.value) return
  
  try {
    deleteLoading.value = true
    await reviewAPI.deleteReview(deleteTarget.value.review_id)
    
    // 로컬 상태에서 제거
    reviews.value = reviews.value.filter(
      review => review.review_id !== deleteTarget.value.review_id
    )
    
    // 통계 업데이트
    if (statistics.value) {
      statistics.value.totalReviews = Math.max(0, statistics.value.totalReviews - 1)
    }
    
    showDeleteDialog.value = false
    deleteTarget.value = null
    
    // 페이지 새로고침
    await loadReviews()
    
  } catch (error) {
    console.error('리뷰 삭제 실패:', error)
    alert('리뷰 삭제에 실패했습니다.')
  } finally {
    deleteLoading.value = false
  }
}

const goToDestination = (destination) => {
  if (destination?.id) {
    router.push(`/destination/${destination.id}`)
  }
}

// Image gallery methods
const openImageGallery = (images, startIndex = 0) => {
  selectedImages.value = images
  selectedImageIndex.value = startIndex
  showImageGallery.value = true
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

// Utility methods
const hasDetailedRatings = (review) => {
  return review.accessibility_rating || review.mobility_rating || 
         review.facility_rating || review.service_rating
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

const getCategoryName = (category) => {
  const categories = {
    'attraction': '관광지',
    'restaurant': '음식점',
    'accommodation': '숙박시설',
    'shopping': '쇼핑',
    'cultural': '문화시설',
    'other': '기타'
  }
  return categories[category] || category
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

// Lifecycle
onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.my-reviews-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.review-item {
  transition: all 0.3s ease;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

/* 이미지 갤러리 스타일 (ReviewList와 동일) */
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
</style>