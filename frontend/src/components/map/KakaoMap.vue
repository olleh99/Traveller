<template>
  <div class="kakao-map-container">
    <!-- Map Container -->
    <div 
      ref="mapContainer" 
      class="kakao-map"
      :style="{ width: width, height: height }"
    ></div>
    
    <!-- API Key Missing Warning -->
    <div v-if="!isApiKeyAvailable" class="api-key-warning">
      <v-card class="pa-4 text-center">
        <v-icon size="48" color="warning" class="mb-2">mdi-map-marker-alert</v-icon>
        <h3 class="text-h6 mb-2">지도 API 키가 필요합니다</h3>
        <p class="text-body-2 text-grey-darken-1 mb-4">
          카카오맵을 표시하려면 API 키를 설정해야 합니다.
        </p>
        <v-btn 
          color="primary" 
          variant="outlined"
          @click="showApiKeyGuide = true"
        >
          API 키 설정 방법 보기
        </v-btn>
      </v-card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="map-loading">
      <v-progress-circular 
        indeterminate 
        color="primary" 
        size="48"
      ></v-progress-circular>
      <p class="mt-2">지도를 불러오는 중...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="map-error">
      <v-card class="pa-4 text-center">
        <v-icon size="48" color="error" class="mb-2">mdi-map-marker-off</v-icon>
        <h3 class="text-h6 mb-2">지도 로딩 실패</h3>
        <p class="text-body-2 mb-4">{{ error }}</p>
        <v-btn color="primary" @click="initializeMap">
          다시 시도
        </v-btn>
      </v-card>
    </div>

    <!-- API Key Guide Dialog -->
    <v-dialog v-model="showApiKeyGuide" max-width="600">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon class="mr-2">mdi-key</v-icon>
          카카오맵 API 키 설정 방법
        </v-card-title>
        
        <v-card-text>
          <div class="api-key-guide">
            <h4 class="text-h6 mb-3">1. 카카오 개발자센터 가입</h4>
            <p class="mb-3">
              <a href="https://developers.kakao.com/" target="_blank" class="text-primary">
                https://developers.kakao.com/
              </a>에서 계정을 만들어주세요.
            </p>

            <h4 class="text-h6 mb-3">2. 애플리케이션 등록</h4>
            <ul class="mb-3">
              <li>내 애플리케이션 → 애플리케이션 추가하기</li>
              <li>앱 이름: "Traveller"</li>
              <li>회사명: 개인 프로젝트면 본인 이름</li>
            </ul>

            <h4 class="text-h6 mb-3">3. 웹 플랫폼 등록</h4>
            <ul class="mb-3">
              <li>플랫폼 설정 → Web 플랫폼 등록</li>
              <li>사이트 도메인: <code>http://localhost:8080</code></li>
            </ul>

            <h4 class="text-h6 mb-3">4. JavaScript 키 복사</h4>
            <p class="mb-3">앱 설정 → 앱 키에서 JavaScript 키를 복사하세요.</p>

            <h4 class="text-h6 mb-3">5. 환경변수 설정</h4>
            <p>프론트엔드 루트 디렉토리에 <code>.env</code> 파일을 만들고:</p>
            <v-code class="mb-3">
              VITE_KAKAO_MAP_API_KEY=여기에_발급받은_키_입력
            </v-code>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showApiKeyGuide = false">
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

// Props
const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  },
  center: {
    type: Object,
    default: () => ({ latitude: 37.5665, longitude: 126.9780 }) // 서울 시청
  },
  zoom: {
    type: Number,
    default: 10
  },
  markers: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['map-ready', 'marker-click'])

// State
const mapContainer = ref(null)
const map = ref(null)
const kakaoMarkers = ref([])
const loading = ref(false)
const error = ref(null)
const showApiKeyGuide = ref(false)

// Computed
const isApiKeyAvailable = ref(!!import.meta.env.VITE_KAKAO_MAP_API_KEY)

// Methods
const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      resolve()
      return
    }

    // API 키가 없는 경우
    if (!import.meta.env.VITE_KAKAO_MAP_API_KEY) {
      reject(new Error('Kakao Map API key is not provided'))
      return
    }

    // 스크립트 로드
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve()
      })
    }
    script.onerror = () => {
      reject(new Error('Failed to load Kakao Map script'))
    }
    document.head.appendChild(script)
  })
}

const initializeMap = async () => {
  try {
    loading.value = true
    error.value = null

    // API 키 확인
    if (!import.meta.env.VITE_KAKAO_MAP_API_KEY) {
      isApiKeyAvailable.value = false
      return
    }

    // 카카오맵 스크립트 로드
    await loadKakaoMapScript()

    // DOM이 준비될 때까지 대기
    await nextTick()

    if (!mapContainer.value) {
      throw new Error('Map container not found')
    }

    // 지도 초기화
    const mapOptions = {
      center: new window.kakao.maps.LatLng(props.center.latitude, props.center.longitude),
      level: props.zoom
    }

    map.value = new window.kakao.maps.Map(mapContainer.value, mapOptions)

    // 마커 추가
    if (props.markers.length > 0) {
      addMarkers(props.markers)
    }

    emit('map-ready', map.value)

  } catch (err) {
    error.value = err.message || '지도를 불러올 수 없습니다.'
    
    if (err.message.includes('API key')) {
      isApiKeyAvailable.value = false
    }
  } finally {
    loading.value = false
  }
}

const addMarkers = (markers) => {
  if (!map.value || !window.kakao) return

  // 기존 마커 제거
  clearMarkers()

  markers.forEach((markerData, index) => {
    const position = new window.kakao.maps.LatLng(markerData.latitude, markerData.longitude)
    
    const marker = new window.kakao.maps.Marker({
      position: position,
      title: markerData.title || `마커 ${index + 1}`
    })

    marker.setMap(map.value)
    kakaoMarkers.value.push(marker)

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, 'click', () => {
      emit('marker-click', markerData, index)
    })

    // 정보창 (선택사항)
    if (markerData.content) {
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;">${markerData.content}</div>`
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(map.value, marker)
      })
    }
  })

  // 모든 마커가 보이도록 지도 범위 조정
  if (markers.length > 1) {
    const bounds = new window.kakao.maps.LatLngBounds()
    markers.forEach(marker => {
      bounds.extend(new window.kakao.maps.LatLng(marker.latitude, marker.longitude))
    })
    map.value.setBounds(bounds)
  }
}

const clearMarkers = () => {
  kakaoMarkers.value.forEach(marker => {
    marker.setMap(null)
  })
  kakaoMarkers.value = []
}

const centerMap = (latitude, longitude) => {
  if (!map.value) return
  
  const moveLatLon = new window.kakao.maps.LatLng(latitude, longitude)
  map.value.setCenter(moveLatLon)
}

// Watchers
watch(() => props.markers, (newMarkers) => {
  if (map.value) {
    addMarkers(newMarkers)
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  clearMarkers()
})

// Expose methods for parent components
defineExpose({
  centerMap,
  addMarkers,
  clearMarkers,
  map: map.value
})
</script>

<style scoped>
.kakao-map-container {
  position: relative;
  width: 100%;
}

.kakao-map {
  border-radius: 8px;
  overflow: hidden;
}

.api-key-warning,
.map-loading,
.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}

.api-key-guide {
  line-height: 1.6;
}

.api-key-guide ul {
  padding-left: 1.2rem;
  margin-bottom: 1rem;
}

.api-key-guide li {
  margin-bottom: 0.5rem;
}

.api-key-guide code {
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.v-code {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  border: 1px solid #e9ecef;
}
</style>