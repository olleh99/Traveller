<template>
  <section class="destinations-section py-12" aria-labelledby="destinations-title">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center mb-8">
          <h2 
            id="destinations-title"
            class="text-h3 font-weight-bold mb-4"
            :class="accessibilityStore.fontSizeClass"
          >
            이번 주 추천 배리어프리 여행지
          </h2>
          <p 
            class="text-h6 text-grey-darken-1"
            :class="accessibilityStore.fontSizeClass"
          >
            접근성이 검증된 인기 여행지를 소개합니다
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="destination in destinations"
          :key="destination.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="destination-card"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="2"
            :to="`/destination/${destination.id}`"
          >
            <v-img
              :src="destination.image"
              :alt="destination.imageAlt"
              height="200"
              cover
              :lazy-src="destination.thumbnail"
            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular
                    indeterminate
                    color="grey-lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>

            <v-card-title class="pb-2">
              <h3 class="text-h6" :class="accessibilityStore.fontSizeClass">
                {{ destination.name }}
              </h3>
            </v-card-title>

            <v-card-subtitle class="pb-0">
              <v-chip
                :color="getAccessibilityColor(destination.accessibilityLevel)"
                size="small"
                class="mr-2"
              >
                접근성 {{ destination.accessibilityLevel }}급
              </v-chip>
              <v-chip
                size="small"
                variant="outlined"
              >
                {{ destination.location }}
              </v-chip>
            </v-card-subtitle>

            <v-card-text>
              <p class="text-body-2 mb-3" :class="accessibilityStore.fontSizeClass">
                {{ destination.description }}
              </p>

              <div class="facilities-icons">
                <v-tooltip
                  v-for="facility in destination.facilities"
                  :key="facility.type"
                  :text="facility.name"
                  location="top"
                >
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      :icon="facility.icon"
                      size="small"
                      class="mr-2"
                      :aria-label="facility.name"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </div>

              <div class="mt-3">
                <v-rating
                  :model-value="destination.rating"
                  readonly
                  density="compact"
                  size="small"
                  color="amber"
                  :aria-label="`평점 ${destination.rating}점`"
                ></v-rating>
                <span class="text-caption ml-2">
                  ({{ destination.reviewCount }}개 리뷰)
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col cols="12" class="text-center">
          <v-btn
            color="primary"
            size="large"
            variant="outlined"
            to="/destinations"
            append-icon="mdi-arrow-right"
          >
            모든 여행지 보기
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'
import { destinationAPI } from '@/api/destination'

const accessibilityStore = useAccessibilityStore()

// 상태 관리
const destinations = ref([])
const loading = ref(false)
const error = ref(null)

// 추천 여행지 로드
const loadRecommendedDestinations = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await destinationAPI.getRecommendedDestinations(6)
    
    // 안전한 데이터 파싱
    if (!response) {
      throw new Error('API 응답이 없습니다')
    }
    
    const destinationsArray = response.destinations || []
    
    if (!Array.isArray(destinationsArray)) {
      throw new Error('여행지 데이터가 배열이 아닙니다')
    }
    
    // API 응답 데이터를 컴포넌트에서 사용하는 형태로 변환
    destinations.value = destinationsArray.map(dest => ({
      id: dest.id,
      name: dest.name,
      location: dest.region,
      image: dest.image_url || `/images/destinations/${dest.id}.jpg`,
      thumbnail: dest.thumbnail_url || `/images/destinations/${dest.id}-thumb.jpg`,
      imageAlt: `${dest.name} 이미지`,
      description: dest.description,
      accessibilityLevel: dest.accessibility_level || 'B',
      rating: dest.rating || 4.0,
      reviewCount: dest.review_count || 0,
      facilities: parseFacilities(dest.amenities)
    }))
    
  } catch (err) {
    console.error('추천 여행지 로드 실패:', err)
    error.value = '여행지 정보를 불러오는데 실패했습니다.'
    
    // 오류 발생 시 더미 데이터 사용
    destinations.value = [
      {
        id: 'dummy-1',
        name: '제주 우도',
        location: '제주도',
        image: '/images/destinations/udo.jpg',
        thumbnail: '/images/destinations/udo-thumb.jpg',
        imageAlt: '제주 우도의 아름다운 해안 풍경',
        description: '완만한 경사로와 장애인 화장실이 잘 갖춰진 아름다운 섬',
        accessibilityLevel: 'A',
        rating: 4.8,
        reviewCount: 234,
        facilities: [
          { type: 'wheelchair', icon: 'mdi-wheelchair-accessibility', name: '휠체어 접근 가능' },
          { type: 'parking', icon: 'mdi-parking', name: '장애인 전용 주차장' },
          { type: 'toilet', icon: 'mdi-human-male-female', name: '장애인 화장실' },
          { type: 'elevator', icon: 'mdi-elevator', name: '엘리베이터' }
        ]
      },
      {
        id: 'dummy-2',
        name: '남산 N서울타워',
        location: '서울',
        image: '/images/destinations/namsan.jpg',
        thumbnail: '/images/destinations/namsan-thumb.jpg',
        imageAlt: '남산 N서울타워 야경',
        description: '케이블카와 엘리베이터로 편리하게 접근 가능한 서울의 랜드마크',
        accessibilityLevel: 'A',
        rating: 4.6,
        reviewCount: 567,
        facilities: [
          { type: 'wheelchair', icon: 'mdi-wheelchair-accessibility', name: '휠체어 접근 가능' },
          { type: 'elevator', icon: 'mdi-elevator', name: '엘리베이터' },
          { type: 'guide', icon: 'mdi-human-greeting', name: '안내 도우미' },
          { type: 'braille', icon: 'mdi-braille', name: '점자 안내' }
        ]
      },
      {
        id: 'dummy-3',
        name: '경주 불국사',
        location: '경주',
        image: '/images/destinations/bulguksa.jpg',
        thumbnail: '/images/destinations/bulguksa-thumb.jpg',
        imageAlt: '경주 불국사 대웅전',
        description: '일부 구역에 경사로 설치, 주요 문화재 접근 가능',
        accessibilityLevel: 'B',
        rating: 4.5,
        reviewCount: 189,
        facilities: [
          { type: 'wheelchair', icon: 'mdi-wheelchair-accessibility', name: '부분적 휠체어 접근' },
          { type: 'parking', icon: 'mdi-parking', name: '장애인 전용 주차장' },
          { type: 'toilet', icon: 'mdi-human-male-female', name: '장애인 화장실' }
        ]
      }
    ]
  } finally {
    loading.value = false
  }
}

// 편의시설 정보를 파싱하는 헬퍼 함수
const parseFacilities = (amenities) => {
  if (!amenities) return []
  
  const facilityMap = {
    'wheelchair': { type: 'wheelchair', icon: 'mdi-wheelchair-accessibility', name: '휠체어 접근 가능' },
    'parking': { type: 'parking', icon: 'mdi-parking', name: '장애인 전용 주차장' },
    'toilet': { type: 'toilet', icon: 'mdi-human-male-female', name: '장애인 화장실' },
    'elevator': { type: 'elevator', icon: 'mdi-elevator', name: '엘리베이터' },
    'guide': { type: 'guide', icon: 'mdi-human-greeting', name: '안내 도우미' },
    'braille': { type: 'braille', icon: 'mdi-braille', name: '점자 안내' },
    'beach_wheelchair': { type: 'beach_wheelchair', icon: 'mdi-wheelchair-accessibility', name: '해변 휠체어' }
  }
  
  // amenities가 이미 배열인 경우
  if (Array.isArray(amenities)) {
    return amenities.map(amenity => 
      facilityMap[amenity] || { type: amenity, icon: 'mdi-check', name: amenity }
    ).filter(Boolean)
  }
  
  // amenities가 문자열인 경우 (콤마로 구분)
  if (typeof amenities === 'string') {
    return amenities.split(',').map(amenity => 
      facilityMap[amenity.trim()] || { type: amenity.trim(), icon: 'mdi-check', name: amenity.trim() }
    ).filter(Boolean)
  }
  
  return []
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadRecommendedDestinations()
})

const getAccessibilityColor = (level) => {
  const colors = {
    'A': 'success',
    'B': 'info',
    'C': 'warning',
    'D': 'error'
  }
  return colors[level] || 'grey'
}
</script>

<style scoped>
.destination-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.reduce-motion .destination-card {
  transition: none;
}

.reduce-motion .destination-card:hover {
  transform: none;
}

.facilities-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.high-contrast-card {
  border: 2px solid currentColor;
}

@media (max-width: 600px) {
  .destination-card {
    margin-bottom: 1rem;
  }
}
</style>