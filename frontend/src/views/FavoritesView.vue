<template>
  <div class="favorites-view">
    <v-container class="py-8">
      <!-- 페이지 헤더 -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">
            <v-icon size="large" class="mr-3">mdi-heart</v-icon>
            나의 즐겨찾기
          </h1>
          <p class="text-h6 text-grey-darken-1">
            관심있는 여행지를 모아보고 관리하세요
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
            <v-avatar size="64" color="red-lighten-5" class="mb-3">
              <v-icon size="32" color="red">mdi-heart-multiple</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-red mb-1">
              {{ statistics.total || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium">총 즐겨찾기</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="blue-lighten-5" class="mb-3">
              <v-icon size="32" color="blue">mdi-map-marker</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-blue mb-1">
              {{ statistics.byCategory?.attraction || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium">관광지</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="2" class="text-center pa-4">
            <v-avatar size="64" color="green-lighten-5" class="mb-3">
              <v-icon size="32" color="green">mdi-calendar-plus</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold text-green mb-1">
              {{ statistics.recentlyAdded || 0 }}
            </h3>
            <p class="text-body-1 font-weight-medium">최근 추가</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- 정렬 및 필터 -->
      <div class="d-flex justify-space-between align-center mb-4">
        <h3 class="text-h5">
          즐겨찾기 목록 ({{ totalItems }}개)
        </h3>
        
        <v-select
          v-model="sortOption"
          :items="sortOptions"
          label="정렬"
          variant="outlined"
          density="compact"
          style="max-width: 200px;"
          @update:model-value="loadFavorites"
        ></v-select>
      </div>
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <v-row justify="center" class="pa-8">
            <v-col cols="12" class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="mt-4 text-h6">즐겨찾기 목록을 불러오는 중...</p>
            </v-col>
          </v-row>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <v-row justify="center" class="pa-8">
            <v-col cols="12" md="6" class="text-center">
              <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
              <h2 class="text-h4 mb-4">오류가 발생했습니다</h2>
              <p class="text-body-1 mb-4">{{ error }}</p>
              <v-btn color="primary" @click="loadFavorites">
                다시 시도
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Empty State -->
        <div v-else-if="favorites.length === 0 && !loading" class="empty-state">
          <v-row justify="center" class="pa-8">
            <v-col cols="12" md="6" class="text-center">
              <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-heart-outline</v-icon>
              <h2 class="text-h4 mb-4">즐겨찾기가 비어있습니다</h2>
              <p class="text-body-1 mb-4">관심있는 여행지를 즐겨찾기에 추가해보세요!</p>
              <v-btn color="primary" size="large" @click="$router.push('/destinations')">
                <v-icon start>mdi-compass</v-icon>
                여행지 둘러보기
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Favorites List -->
        <div v-else>
          <!-- Filter and Sort Controls -->
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="정렬 기준"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="loadFavorites"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-sort</v-icon>
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="6" class="text-md-right">
              <v-chip
                color="primary"
                variant="outlined"
                size="large"
              >
                <v-icon start>mdi-heart</v-icon>
                총 {{ totalItems }}개
              </v-chip>
            </v-col>
          </v-row>

          <!-- Favorites Grid -->
          <v-row>
            <v-col
              v-for="favorite in favorites"
              :key="favorite.favorite_id"
              cols="12" sm="6" md="4" lg="3"
            >
              <v-card
                class="favorite-card"
                elevation="2"
                @click="goToDestination(favorite.destination)"
              >
                <!-- Destination Image -->
                <v-img
                  :src="favorite.destination.image || '/images/destinations/default.jpg'"
                  :alt="`${favorite.destination.name} 이미지`"
                  height="200"
                  cover
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                  
                  <!-- Remove from favorites button -->
                  <div class="favorite-action">
                    <v-btn
                      icon
                      size="small"
                      color="red"
                      @click.stop="removeFavorite(favorite)"
                    >
                      <v-icon>mdi-heart</v-icon>
                    </v-btn>
                  </div>
                </v-img>

                <!-- Card Content -->
                <v-card-text class="pb-2">
                  <div class="d-flex align-center mb-2">
                    <v-chip
                      :color="getAccessibilityColor(favorite.destination.accessibilityLevel)"
                      size="small"
                      class="mr-2"
                    >
                      {{ favorite.destination.accessibilityLevel || 'B' }}급
                    </v-chip>
                    <v-chip
                      color="grey"
                      variant="outlined"
                      size="small"
                    >
                      {{ getCategoryName(favorite.destination.category) }}
                    </v-chip>
                  </div>
                  
                  <h3 class="text-h6 font-weight-bold mb-1" :class="accessibilityStore.fontSizeClass">
                    {{ favorite.destination.name }}
                  </h3>
                  
                  <div class="d-flex align-center text-grey-darken-1 mb-2">
                    <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                    <span class="text-body-2">{{ favorite.destination.region }}</span>
                  </div>
                  
                  <p class="text-body-2 text-grey-darken-2 mb-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    {{ favorite.destination.description }}
                  </p>
                  
                  <!-- Note if exists -->
                  <div v-if="favorite.note" class="note-section">
                    <v-divider class="my-2"></v-divider>
                    <div class="d-flex align-start">
                      <v-icon size="small" color="grey" class="mr-1 mt-1">mdi-note-text</v-icon>
                      <span class="text-caption text-grey-darken-1">{{ favorite.note }}</span>
                    </div>
                  </div>
                </v-card-text>

                <v-card-actions class="pt-0">
                  <small class="text-grey">
                    {{ formatDate(favorite.created_at) }}에 추가
                  </small>
                  <v-spacer></v-spacer>
                  <v-btn
                    size="small"
                    color="primary"
                    variant="text"
                    @click.stop="goToDestination(favorite.destination)"
                  >
                    자세히 보기
                    <v-icon end size="small">mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-container mt-6">
            <v-row justify="center">
              <v-col cols="auto">
                <v-pagination
                  v-model="currentPage"
                  :length="totalPages"
                  :total-visible="7"
                  @update:model-value="loadFavorites"
                ></v-pagination>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-container>

    <!-- Remove Confirmation Dialog -->
    <v-dialog
      v-model="showRemoveDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h6">
          즐겨찾기 해제
        </v-card-title>
        <v-card-text>
          <strong>{{ removeTarget?.destination?.name }}</strong>을(를) 즐겨찾기에서 제거하시겠습니까?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showRemoveDialog = false"
          >
            취소
          </v-btn>
          <v-btn
            color="red"
            variant="text"
            :loading="removeLoading"
            @click="confirmRemoveFavorite"
          >
            제거
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAccessibilityStore } from '@/stores/accessibility'
import { useAuthStore } from '@/stores/auth'
import favoritesAPI from '@/api/favorites'

const router = useRouter()
const accessibilityStore = useAccessibilityStore()
const authStore = useAuthStore()

// State
const favorites = ref([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const itemsPerPage = 12

// Statistics
const statistics = ref(null)

// Sort and Filter
const sortOption = ref('recent')
const sortOptions = [
  { title: '최근 추가순', value: 'recent' },
  { title: '이름순', value: 'name' },
  { title: '지역순', value: 'region' }
]

// Computed
const totalFavorites = computed(() => favorites.value.length)

// Remove dialog
const showRemoveDialog = ref(false)
const removeTarget = ref(null)
const removeLoading = ref(false)

// Get current user ID from auth store
const currentUserId = computed(() => authStore.user?.user_id || null)

// Methods
const loadFavorites = async () => {
  const userId = currentUserId.value
  if (!userId) {
    error.value = '로그인이 필요합니다.'
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    const response = await favoritesAPI.getFavoritesByUser(
      userId,
      currentPage.value,
      itemsPerPage
    )
    
    favorites.value = response.data.favorites
    totalPages.value = response.data.pagination.totalPages
    totalItems.value = response.data.pagination.totalItems
    
    // 통계 계산
    loadStatistics()
    
  } catch (err) {
    console.error('즐겨찾기 목록 로드 실패:', err)
    error.value = '즐겨찾기 목록을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

const loadStatistics = () => {
  const totalFavs = favorites.value.length
  
  // 카테고리별 통계
  const categoryStats = {}
  let recentCount = 0
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  favorites.value.forEach(fav => {
    const category = fav.destination?.category || 'other'
    categoryStats[category] = (categoryStats[category] || 0) + 1
    
    if (new Date(fav.created_at) > oneWeekAgo) {
      recentCount++
    }
  })
  
  statistics.value = {
    total: totalFavs,
    byCategory: categoryStats,
    recentlyAdded: recentCount
  }
}

const getAccessibilityColor = (level) => {
  const colors = {
    'A': 'success',
    'B': 'info', 
    'C': 'warning',
    'D': 'error'
  }
  return colors[level] || 'info'
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToDestination = (destination) => {
  router.push(`/destination/${destination.id}`)
}

const removeFavorite = (favorite) => {
  removeTarget.value = favorite
  showRemoveDialog.value = true
}

const confirmRemoveFavorite = async () => {
  if (!removeTarget.value) return
  
  try {
    removeLoading.value = true
    
    await favoritesAPI.removeFavorite(removeTarget.value.favorite_id)
    
    // Remove from local list
    favorites.value = favorites.value.filter(
      f => f.favorite_id !== removeTarget.value.favorite_id
    )
    
    // Update total count
    totalItems.value -= 1
    
    // 통계 재계산
    loadStatistics()
    
    // Close dialog
    showRemoveDialog.value = false
    removeTarget.value = null
    
    // TODO: Show success toast
    
  } catch (err) {
    console.error('즐겨찾기 제거 실패:', err)
    // TODO: Show error toast
  } finally {
    removeLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only:focus {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
  padding: 0.5rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
  background-color: #000;
  color: #fff;
  z-index: 9999;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.favorite-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.favorite-action {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  backdrop-filter: blur(4px);
}

.note-section {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
}

.loading-container,
.error-container,
.empty-state {
  min-height: 50vh;
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 2rem;
}

/* 고대비 모드 */
.high-contrast .favorite-card {
  border: 2px solid #333;
}

.high-contrast .favorite-action {
  background: rgba(255, 255, 255, 1);
  border: 1px solid #333;
}

/* 애니메이션 감소 모드 */
.reduce-motion .favorite-card {
  transition: none;
}

.reduce-motion .favorite-card:hover {
  transform: none;
}
</style>