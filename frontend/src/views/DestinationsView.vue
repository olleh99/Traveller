<template>
  <div class="destinations-page">
    <v-container>
      <!-- Page Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <h1 class="text-h3 mb-2">모든 여행지</h1>
          <p class="text-body-1 text-grey-darken-1">
            접근성을 고려한 여행지를 찾아보세요
          </p>
        </v-col>
      </v-row>

      <!-- Search and Filter Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card elevation="2" class="pa-4">
            <v-row align="center">
              <!-- Search Input -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="여행지 검색"
                  placeholder="여행지 이름, 설명, 주소로 검색..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @keyup.enter="performSearch"
                  @input="onSearchInput"
                ></v-text-field>
              </v-col>

              <!-- Category Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedCategory"
                  :items="categoryOptions"
                  label="카테고리"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="performSearch"
                ></v-select>
              </v-col>

              <!-- Region Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedRegion"
                  :items="regionOptions"
                  label="지역"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="performSearch"
                ></v-select>
              </v-col>

              <!-- Search Button -->
              <v-col cols="12" md="2">
                <v-btn
                  color="primary"
                  block
                  size="large"
                  @click="performSearch"
                  :loading="loading"
                >
                  <v-icon start>mdi-magnify</v-icon>
                  검색
                </v-btn>
              </v-col>
            </v-row>

            <!-- Active Filters Display -->
            <v-row v-if="hasActiveFilters" class="mt-2">
              <v-col cols="12">
                <div class="d-flex flex-wrap align-center gap-2">
                  <span class="text-caption text-grey-darken-1">활성 필터:</span>
                  
                  <v-chip
                    v-if="searchQuery"
                    size="small"
                    closable
                    @click:close="clearSearchQuery"
                  >
                    검색: {{ searchQuery }}
                  </v-chip>
                  
                  <v-chip
                    v-if="selectedCategory"
                    size="small"
                    closable
                    @click:close="clearCategory"
                  >
                    카테고리: {{ getCategoryName(selectedCategory) }}
                  </v-chip>
                  
                  <v-chip
                    v-if="selectedRegion"
                    size="small"
                    closable
                    @click:close="clearRegion"
                  >
                    지역: {{ selectedRegion }}
                  </v-chip>

                  <v-btn
                    variant="text"
                    size="small"
                    color="error"
                    @click="clearAllFilters"
                  >
                    전체 초기화
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="loading" justify="center" class="py-8">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-h6">여행지를 불러오는 중...</p>
        </v-col>
      </v-row>

      <!-- Error State -->
      <v-row v-else-if="error" justify="center" class="py-8">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <h2 class="text-h5 mb-4">오류가 발생했습니다</h2>
          <p class="text-body-1 mb-4">{{ error }}</p>
          <v-btn color="primary" @click="loadDestinations">
            다시 시도
          </v-btn>
        </v-col>
      </v-row>

      <!-- Destinations Grid -->
      <v-row v-else>
        <v-col
          v-for="destination in destinations"
          :key="destination.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="destination-card"
            elevation="2"
            @click="goToDetail(destination.id)"
            style="cursor: pointer;"
          >
            <v-img
              :src="destination.image || '/images/destinations/default.jpg'"
              :alt="`${destination.name} 이미지`"
              height="200"
              cover
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-img>

            <v-card-title class="pb-2">
              <h3 class="text-h6">{{ destination.name }}</h3>
            </v-card-title>

            <v-card-subtitle class="pb-0">
              <v-chip
                :color="getAccessibilityColor(destination.accessibilityLevel)"
                size="small"
                class="mr-2"
              >
                접근성 {{ destination.accessibilityLevel || 'B' }}급
              </v-chip>
              <v-chip size="small" variant="outlined">
                {{ destination.region }}
              </v-chip>
            </v-card-subtitle>

            <v-card-text>
              <p class="text-body-2 text-truncate-2">
                {{ destination.description }}
              </p>
              
              <div class="d-flex align-center mt-2">
                <v-rating
                  :model-value="destination.rating || 4.0"
                  readonly
                  color="amber"
                  half-increments
                  size="small"
                  class="mr-2"
                ></v-rating>
                <span class="text-caption">({{ destination.reviewCount || 0 }})</span>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                color="primary"
                variant="text"
                block
                @click.stop="goToDetail(destination.id)"
              >
                상세보기
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-if="!loading && !error && destinations.length === 0" justify="center" class="py-8">
        <v-col cols="12" md="6" class="text-center">
          <v-icon size="64" color="grey" class="mb-4">mdi-map-search</v-icon>
          <h2 class="text-h5 mb-4">등록된 여행지가 없습니다</h2>
          <p class="text-body-1">곧 다양한 여행지가 추가될 예정입니다.</p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { destinationAPI } from '@/api/destination'

const router = useRouter()

// State
const destinations = ref([])
const loading = ref(false)
const error = ref(null)

// Search and Filter State
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedRegion = ref('')
let searchTimeout = null

// Filter Options
const categoryOptions = ref([
  { title: '전체', value: '' },
  { title: '관광지', value: 'attraction' },
  { title: '음식점', value: 'restaurant' },
  { title: '숙박시설', value: 'accommodation' },
  { title: '쇼핑', value: 'shopping' },
  { title: '문화시설', value: 'cultural' },
  { title: '기타', value: 'other' }
])

const regionOptions = ref([
  { title: '전체', value: '' },
  { title: '서울', value: '서울' },
  { title: '부산', value: '부산' },
  { title: '제주도', value: '제주도' },
  { title: '경주', value: '경주' },
  { title: '전라북도', value: '전라북도' },
  { title: '전라남도', value: '전라남도' }
])

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedRegion.value
})

// Methods
const loadDestinations = async (searchParams = {}) => {
  try {
    loading.value = true
    error.value = null
    
    // 검색 파라미터 구성
    const params = {
      limit: 50,
      ...searchParams
    }
    
    // 빈 값 필터링
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await destinationAPI.getDestinations(params)
    
    // 안전한 데이터 파싱
    if (!response) {
      throw new Error('API 응답이 없습니다')
    }
    
    const destinationsArray = response.destinations || []
    
    if (!Array.isArray(destinationsArray)) {
      throw new Error('여행지 데이터가 배열이 아닙니다')
    }
    
    destinations.value = destinationsArray
  } catch (err) {
    console.error('여행지 목록 로드 실패:', err)
    error.value = '여행지 목록을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

// Search Methods
const performSearch = () => {
  const searchParams = {}
  
  if (searchQuery.value.trim()) {
    searchParams.search = searchQuery.value.trim()
  }
  
  if (selectedCategory.value) {
    searchParams.category = selectedCategory.value
  }
  
  if (selectedRegion.value) {
    searchParams.region = selectedRegion.value
  }
  
  loadDestinations(searchParams)
}

const onSearchInput = () => {
  // 디바운싱으로 성능 최적화
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 500) // 500ms 대기 후 검색
}

// Filter Clear Methods
const clearSearchQuery = () => {
  searchQuery.value = ''
  performSearch()
}

const clearCategory = () => {
  selectedCategory.value = ''
  performSearch()
}

const clearRegion = () => {
  selectedRegion.value = ''
  performSearch()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedRegion.value = ''
  loadDestinations() // 모든 필터 없이 로드
}

const goToDetail = (id) => {
  router.push(`/destination/${id}`)
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

// Lifecycle
onMounted(() => {
  loadDestinations()
  document.title = '모든 여행지 - Traveller'
})
</script>

<style scoped>
.destination-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.destination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: 2.8em;
}

.v-card-text {
  flex: 1;
}

/* 애니메이션 감소 모드 */
.reduce-motion .destination-card {
  transition: none;
}

.reduce-motion .destination-card:hover {
  transform: none;
}
</style>