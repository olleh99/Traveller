<template>
  <div class="destination-detail">
    <!-- Skip to main content link for screen readers -->
    <a href="#main-content" class="sr-only">메인 콘텐츠로 건너뛰기</a>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-container>
        <v-row justify="center" class="pa-8">
          <v-col cols="12" class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4 text-h6">여행지 정보를 불러오는 중...</p>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-container>
        <v-row justify="center" class="pa-8">
          <v-col cols="12" md="6" class="text-center">
            <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
            <h2 class="text-h4 mb-4">오류가 발생했습니다</h2>
            <p class="text-body-1 mb-4">{{ error }}</p>
            <v-btn color="primary" @click="loadDestination" class="mr-2">
              다시 시도
            </v-btn>
            <v-btn variant="outlined" @click="$router.go(-1)">
              이전 페이지로
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Main Content -->
    <main v-else-if="destination" id="main-content">
      <!-- Hero Section with Image -->
      <section class="hero-section">
        <v-img
          :src="destination.image || '/images/destinations/default.jpg'"
          :alt="`${destination.name} 대표 이미지`"
          height="400"
          cover
          class="destination-hero-image"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
            </v-row>
          </template>
          
          <!-- Overlay with basic info -->
          <div class="hero-overlay">
            <v-container>
              <v-row align="end" class="fill-height pb-6">
                <v-col cols="12">
                  <div class="hero-content">
                    <v-chip
                      :color="getAccessibilityColor(destination.accessibilityLevel)"
                      size="large"
                      class="mb-2"
                    >
                      <v-icon start>mdi-wheelchair-accessibility</v-icon>
                      접근성 {{ destination.accessibilityLevel || 'B' }}급
                    </v-chip>
                    
                    <h1 class="text-h3 text-white font-weight-bold mb-2" :class="accessibilityStore.fontSizeClass">
                      {{ destination.name }}
                    </h1>
                    
                    <div class="d-flex align-center text-white mb-2">
                      <v-icon class="mr-2">mdi-map-marker</v-icon>
                      <span class="text-h6">{{ destination.region }}</span>
                    </div>
                    
                    <div class="d-flex align-center text-white">
                      <v-rating
                        :model-value="destination.rating || 4.0"
                        readonly
                        color="amber"
                        half-increments
                        size="small"
                        class="mr-2"
                      ></v-rating>
                      <span>{{ destination.rating || '4.0' }} ({{ destination.reviewCount || 0 }}개 리뷰)</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </v-img>
      </section>

      <!-- Content Section -->
      <section class="content-section">
        <v-container>
          <v-row>
            <!-- Main Content -->
            <v-col cols="12" md="8">
              <!-- Description -->
              <v-card class="mb-6" elevation="2">
                <v-card-title class="pb-2">
                  <h2 class="text-h5" :class="accessibilityStore.fontSizeClass">여행지 소개</h2>
                </v-card-title>
                <v-card-text>
                  <p class="text-body-1" :class="accessibilityStore.fontSizeClass">
                    {{ destination.description }}
                  </p>
                </v-card-text>
              </v-card>

              <!-- Accessibility Information -->
              <v-card class="mb-6" elevation="2">
                <v-card-title class="pb-2">
                  <h2 class="text-h5" :class="accessibilityStore.fontSizeClass">
                    <v-icon class="mr-2">mdi-wheelchair-accessibility</v-icon>
                    접근성 정보
                  </h2>
                </v-card-title>
                <v-card-text>
                  <div class="mb-4">
                    <v-chip
                      :color="getAccessibilityColor(destination.accessibilityLevel)"
                      size="large"
                      class="mb-2"
                    >
                      접근성 {{ destination.accessibilityLevel || 'B' }}급
                    </v-chip>
                    <p class="text-body-2 mt-2">
                      {{ getAccessibilityDescription(destination.accessibilityLevel) }}
                    </p>
                  </div>

                  <!-- Facilities -->
                  <div v-if="facilities && facilities.length > 0">
                    <h3 class="text-h6 mb-3" :class="accessibilityStore.fontSizeClass">편의시설</h3>
                    <v-row>
                      <v-col
                        v-for="facility in facilities"
                        :key="facility.type"
                        cols="6" sm="4" md="3"
                        class="text-center"
                      >
                        <v-card variant="outlined" class="pa-3 facility-card">
                          <v-icon size="32" :color="facility.available ? 'success' : 'grey'">
                            {{ facility.icon }}
                          </v-icon>
                          <p class="mt-2 text-caption" :class="accessibilityStore.fontSizeClass">
                            {{ facility.name }}
                          </p>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Contact Information -->
              <v-card class="mb-6" elevation="2">
                <v-card-title class="pb-2">
                  <h2 class="text-h5" :class="accessibilityStore.fontSizeClass">
                    <v-icon class="mr-2">mdi-information</v-icon>
                    기본 정보
                  </h2>
                </v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title :class="accessibilityStore.fontSizeClass">주소</v-list-item-title>
                      <v-list-item-subtitle :class="accessibilityStore.fontSizeClass">
                        {{ destination.address }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="destination.phone">
                      <template v-slot:prepend>
                        <v-icon>mdi-phone</v-icon>
                      </template>
                      <v-list-item-title :class="accessibilityStore.fontSizeClass">전화번호</v-list-item-title>
                      <v-list-item-subtitle :class="accessibilityStore.fontSizeClass">
                        <a :href="`tel:${destination.phone}`" class="text-decoration-none">
                          {{ destination.phone }}
                        </a>
                      </v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-tag</v-icon>
                      </template>
                      <v-list-item-title :class="accessibilityStore.fontSizeClass">카테고리</v-list-item-title>
                      <v-list-item-subtitle :class="accessibilityStore.fontSizeClass">
                        {{ getCategoryName(destination.category) }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="destination.website">
                      <template v-slot:prepend>
                        <v-icon>mdi-web</v-icon>
                      </template>
                      <v-list-item-title :class="accessibilityStore.fontSizeClass">웹사이트</v-list-item-title>
                      <v-list-item-subtitle :class="accessibilityStore.fontSizeClass">
                        <a :href="destination.website" target="_blank" class="text-decoration-none">
                          {{ destination.website }}
                        </a>
                      </v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="destination.opening_hours">
                      <template v-slot:prepend>
                        <v-icon>mdi-clock</v-icon>
                      </template>
                      <v-list-item-title :class="accessibilityStore.fontSizeClass">영업시간</v-list-item-title>
                      <v-list-item-subtitle :class="accessibilityStore.fontSizeClass">
                        {{ formatOpeningHours(destination.opening_hours) }}
                      </v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item v-if="destination.admission_fee">
                      <template v-slot:prepend>
                        <v-icon>mdi-cash</v-icon>
                      </template>
                      <v-list-item-title :class="accessibilityStore.fontSizeClass">입장료</v-list-item-title>
                      <v-list-item-subtitle :class="accessibilityStore.fontSizeClass">
                        {{ destination.admission_fee }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Sidebar -->
            <v-col cols="12" md="4">
              <!-- Quick Actions -->
              <v-card class="mb-4" elevation="2">
                <v-card-title class="pb-2">
                  <h2 class="text-h6" :class="accessibilityStore.fontSizeClass">빠른 작업</h2>
                </v-card-title>
                <v-card-text>
                  <v-btn
                    block
                    color="primary"
                    size="large"
                    class="mb-2"
                    @click="shareDestination"
                  >
                    <v-icon start>mdi-share</v-icon>
                    공유하기
                  </v-btn>
                  
                  <v-btn
                    v-if="authStore.isLoggedIn"
                    block
                    :color="isFavorite ? 'red' : 'grey'"
                    :variant="isFavorite ? 'flat' : 'outlined'"
                    size="large"
                    :loading="favoriteLoading"
                    @click="toggleFavorite"
                  >
                    <v-icon start>{{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                    {{ isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
                  </v-btn>
                  <v-btn
                    v-else
                    block
                    variant="outlined"
                    size="large"
                    @click="goToLogin"
                  >
                    <v-icon start>mdi-heart-outline</v-icon>
                    로그인 후 즐겨찾기 추가
                  </v-btn>
                </v-card-text>
              </v-card>

              <!-- Map -->
              <v-card class="mb-4" elevation="2">
                <v-card-title class="pb-2">
                  <h2 class="text-h6" :class="accessibilityStore.fontSizeClass">위치</h2>
                </v-card-title>
                <v-card-text>
                  <KakaoMap
                    v-if="destination && destination.latitude && destination.longitude"
                    :center="{ 
                      latitude: parseFloat(destination.latitude), 
                      longitude: parseFloat(destination.longitude) 
                    }"
                    :markers="[{
                      latitude: parseFloat(destination.latitude),
                      longitude: parseFloat(destination.longitude),
                      title: destination.name,
                      content: `<strong>${destination.name}</strong><br>${destination.address}`
                    }]"
                    :zoom="15"
                    height="300px"
                    @marker-click="onMapMarkerClick"
                  />
                  
                  <!-- Fallback when no coordinates -->
                  <div v-else class="map-placeholder">
                    <v-icon size="48" color="grey">mdi-map-marker-question</v-icon>
                    <p class="mt-2 text-center text-body-2">위치 정보가 없습니다</p>
                  </div>
                  
                  <!-- Address Info -->
                  <div class="mt-3 pa-3 bg-grey-lighten-4 rounded">
                    <div class="d-flex align-center mb-2">
                      <v-icon class="mr-2" size="small">mdi-map-marker</v-icon>
                      <strong class="text-body-2">주소</strong>
                    </div>
                    <p class="text-body-2 mb-2">{{ destination?.address }}</p>
                    
                    <div class="d-flex gap-2">
                      <v-btn
                        size="small"
                        color="primary"
                        variant="outlined"
                        @click="openExternalMap"
                      >
                        <v-icon start size="small">mdi-map-search</v-icon>
                        지도 앱에서 보기
                      </v-btn>
                      
                      <v-btn
                        size="small"
                        color="secondary"
                        variant="outlined"
                        @click="copyAddress"
                      >
                        <v-icon start size="small">mdi-content-copy</v-icon>
                        주소 복사
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- 리뷰 섹션 -->
          <v-row class="mt-8">
            <v-col cols="12">
              <v-card elevation="2">
                <v-card-title class="d-flex justify-space-between align-center">
                  <h2 class="text-h5" :class="accessibilityStore.fontSizeClass">
                    <v-icon class="mr-2">mdi-comment-multiple</v-icon>
                    리뷰
                  </h2>
                  <v-btn
                    v-if="authStore.isLoggedIn"
                    color="primary"
                    @click="showReviewForm = true"
                  >
                    <v-icon start>mdi-pencil</v-icon>
                    리뷰 작성
                  </v-btn>
                  <v-btn
                    v-else
                    color="primary"
                    variant="outlined"
                    @click="goToLogin"
                  >
                    <v-icon start>mdi-pencil</v-icon>
                    로그인 후 리뷰 작성
                  </v-btn>
                </v-card-title>
                
                <v-card-text>
                  <!-- 리뷰 목록 -->
                  <ReviewList
                    v-if="destination"
                    :destination-id="destination.id"
                    @review-detail="viewReviewDetail"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>
      
      <!-- 리뷰 작성 다이얼로그 -->
      <v-dialog
        v-model="showReviewForm"
        max-width="800"
        persistent
      >
        <ReviewForm
          v-if="showReviewForm && destination"
          :destination-id="destination.id"
          :user-id="currentUserId"
          @success="onReviewSuccess"
          @cancel="showReviewForm = false"
        />
      </v-dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccessibilityStore } from '@/stores/accessibility'
import { useAuthStore } from '@/stores/auth'
import { destinationAPI } from '@/api/destination'
import favoritesAPI from '@/api/favorites'
import KakaoMap from '@/components/map/KakaoMap.vue'
import ReviewList from '@/components/review/ReviewList.vue'
import ReviewForm from '@/components/review/ReviewForm.vue'

const route = useRoute()
const router = useRouter()
const accessibilityStore = useAccessibilityStore()
const authStore = useAuthStore()

// State
const destination = ref(null)
const loading = ref(false)
const error = ref(null)
const showReviewForm = ref(false)
const currentUserId = computed(() => authStore.user?.user_id || null)

// 즐겨찾기 상태
const isFavorite = ref(false)
const favoriteId = ref(null)
const favoriteLoading = ref(false)

// Computed
const facilities = computed(() => {
  if (!destination.value?.amenities || !Array.isArray(destination.value.amenities)) return []
  
  const facilityMap = {
    'wheelchair': { type: 'wheelchair', icon: 'mdi-wheelchair-accessibility', name: '휠체어 접근', available: true },
    'parking': { type: 'parking', icon: 'mdi-parking', name: '장애인 주차장', available: true },
    'toilet': { type: 'toilet', icon: 'mdi-human-male-female', name: '장애인 화장실', available: true },
    'elevator': { type: 'elevator', icon: 'mdi-elevator', name: '엘리베이터', available: true },
    'guide': { type: 'guide', icon: 'mdi-human-greeting', name: '안내 도우미', available: true },
    'braille': { type: 'braille', icon: 'mdi-braille', name: '점자 안내', available: true },
    'beach_wheelchair': { type: 'beach_wheelchair', icon: 'mdi-wheelchair-accessibility', name: '해변 휠체어', available: true }
  }
  
  return destination.value.amenities.map(amenity => 
    facilityMap[amenity] || { type: amenity, icon: 'mdi-check', name: amenity, available: true }
  ).filter(Boolean)
})

// Methods
const loadDestination = async () => {
  try {
    loading.value = true
    error.value = null
    
    const id = route.params.id
    const response = await destinationAPI.getDestination(id)
    
    destination.value = response
    
    // 페이지 제목 설정
    document.title = `${destination.value.name} - Traveller`
    
    // 즐겨찾기 상태 확인
    await checkFavoriteStatus()
  } catch (err) {
    console.error('여행지 상세 정보 로드 실패:', err)
    error.value = '여행지 정보를 불러올 수 없습니다.'
  } finally {
    loading.value = false
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

const getAccessibilityDescription = (level) => {
  const descriptions = {
    'A': '완전한 접근성 - 모든 장애인이 이용하기에 매우 편리합니다.',
    'B': '양호한 접근성 - 대부분의 장애인이 이용 가능하나 일부 불편함이 있을 수 있습니다.',
    'C': '제한적 접근성 - 일부 장애인만 이용 가능하며 도움이 필요할 수 있습니다.',
    'D': '접근성 부족 - 장애인 이용에 어려움이 있습니다.'
  }
  return descriptions[level] || descriptions['B']
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

const shareDestination = () => {
  if (navigator.share) {
    navigator.share({
      title: destination.value.name,
      text: destination.value.description,
      url: window.location.href
    })
  } else {
    // 클립보드에 복사
    navigator.clipboard.writeText(window.location.href)
    // TODO: 토스트 메시지 표시
  }
}

// 즐겨찾기 상태 확인
const checkFavoriteStatus = async () => {
  const userId = currentUserId.value
  if (!destination.value?.id || !userId) return
  
  try {
    const response = await favoritesAPI.checkFavoriteStatus(userId, destination.value.id)
    isFavorite.value = response.data.isFavorite
    favoriteId.value = response.data.favoriteId
  } catch (err) {
    console.error('즐겨찾기 상태 확인 실패:', err)
  }
}

// 즐겨찾기 토글
const toggleFavorite = async () => {
  const userId = currentUserId.value
  console.log('Toggle favorite - userId:', userId, 'destinationId:', destination.value?.id)
  
  if (!destination.value?.id || !userId || favoriteLoading.value) {
    console.log('Toggle favorite blocked - missing data')
    return
  }
  
  try {
    favoriteLoading.value = true
    
    const response = await favoritesAPI.toggleFavorite(userId, destination.value.id)
    
    // 상태 업데이트
    isFavorite.value = response.data.isFavorite
    if (response.data.action === 'added') {
      favoriteId.value = response.data.favoriteId
    } else {
      favoriteId.value = null
    }
    
    // 성공 메시지 표시
    // TODO: 토스트 메시지로 대체
    
  } catch (err) {
    console.error('즐겨찾기 토글 실패:', err)
    // TODO: 에러 토스트 메시지 표시
  } finally {
    favoriteLoading.value = false
  }
}

const openExternalMap = () => {
  if (!destination.value?.address) return
  
  const address = encodeURIComponent(destination.value.address)
  
  // 모바일 환경 감지
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    // 모바일에서는 카카오맵 앱 우선 시도
    const kakaoMapUrl = `kakaomap://search?q=${address}`
    const webMapUrl = `https://map.kakao.com/link/search/${address}`
    
    // 앱 실행 시도 (에러 무시)
    try {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = kakaoMapUrl
      document.body.appendChild(iframe)
      
      // 짧은 시간 후 제거
      setTimeout(() => {
        document.body.removeChild(iframe)
        // 앱이 실행되지 않았을 경우 웹 버전 열기
        window.open(webMapUrl, '_blank')
      }, 500)
    } catch (err) {
      // 앱 실행 실패 시 바로 웹 버전
      window.open(webMapUrl, '_blank')
    }
  } else {
    // 데스크톱에서는 카카오맵 웹 페이지
    const webMapUrl = `https://map.kakao.com/link/search/${address}`
    window.open(webMapUrl, '_blank')
  }
}

const copyAddress = async () => {
  if (!destination.value?.address) return
  
  try {
    await navigator.clipboard.writeText(destination.value.address)
    // TODO: 성공 토스트 메시지 표시
    // TODO: 성공 토스트 메시지 표시
  } catch (err) {
    console.error('주소 복사 실패:', err)
    // TODO: 실패 토스트 메시지 표시
  }
}

const onMapMarkerClick = (markerData, index) => {
  // 마커 클릭 시 추가 동작이 필요하면 여기에 구현
  // 마커 클릭 시 추가 동작이 필요하면 여기에 구현
  // 예: 정보창 표시, 상세 정보 모달 등
}

const viewReviewDetail = (review) => {
  // TODO: 리뷰 상세 모달 또는 페이지로 이동
}

const onReviewSuccess = (response) => {
  showReviewForm.value = false
  
  // 리뷰 목록 새로고침을 위해 페이지 리로드
  // TODO: 더 나은 방법으로 리뷰 목록만 새로고침
  window.location.reload()
}

const goToLogin = () => {
  router.push({
    name: 'login',
    query: { redirect: route.fullPath }
  })
}

const formatOpeningHours = (hours) => {
  if (!hours || typeof hours !== 'object') return ''
  
  // 24시간 영업
  if (hours.always) return hours.always
  
  // 요일별 표시
  const dayNames = {
    mon: '월', tue: '화', wed: '수', thu: '목', 
    fri: '금', sat: '토', sun: '일'
  }
  
  const formattedHours = []
  for (const [key, value] of Object.entries(hours)) {
    if (dayNames[key]) {
      formattedHours.push(`${dayNames[key]}: ${value}`)
    } else if (key === 'summer') {
      formattedHours.push(`하계: ${value}`)
    } else if (key === 'winter') {
      formattedHours.push(`동계: ${value}`)
    } else if (key === 'mar_sep') {
      formattedHours.push(`3월-9월: ${value}`)
    } else if (key === 'oct_feb') {
      formattedHours.push(`10월-2월: ${value}`)
    }
  }
  
  return formattedHours.join(', ')
}

// Lifecycle
onMounted(() => {
  loadDestination()
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

.hero-section {
  position: relative;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.7));
  display: flex;
  align-items: flex-end;
}

.hero-content {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.content-section {
  padding: 2rem 0;
}

.facility-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.facility-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.loading-container,
.error-container {
  min-height: 50vh;
  display: flex;
  align-items: center;
}

/* 고대비 모드 */
.high-contrast .hero-overlay {
  background: linear-gradient(transparent 30%, rgba(0, 0, 0, 0.9));
}

.high-contrast .facility-card {
  border: 2px solid #333;
}

/* 애니메이션 감소 모드 */
.reduce-motion .facility-card {
  transition: none;
}

.reduce-motion .facility-card:hover {
  transform: none;
}
</style>