<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon icon="mdi-map-marker-plus" class="mr-3" color="primary"></v-icon>
      여행지 추가
      <v-spacer></v-spacer>
      <span v-if="selectedDay" class="text-subtitle-2 text-grey-darken-1">
        {{ selectedDay.day_number }}일차 ({{ formatDate(selectedDay.date) }})
      </span>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <!-- Search -->
      <div class="mb-6">
        <v-text-field
          v-model="searchQuery"
          label="여행지 검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          placeholder="여행지명, 주소로 검색"
          @input="debouncedSearch"
        ></v-text-field>

        <!-- Filters -->
        <div class="d-flex flex-wrap gap-2 mt-3">
          <v-chip-group
            v-model="selectedCategory"
            filter
            color="primary"
          >
            <v-chip
              v-for="category in categories"
              :key="category.value"
              :value="category.value"
              size="small"
            >
              <v-icon start size="small">{{ category.icon }}</v-icon>
              {{ category.label }}
            </v-chip>
          </v-chip-group>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-6">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="text-body-2 mt-2">여행지를 검색하는 중...</p>
      </div>

      <!-- Destinations List -->
      <div v-else-if="destinations.length > 0" class="destinations-grid">
        <v-row>
          <v-col
            v-for="destination in destinations"
            :key="destination.id"
            cols="12"
            sm="6"
          >
            <v-card
              class="destination-option"
              :class="{ 'selected': selectedDestination?.id === destination.id }"
              elevation="2"
              @click="selectDestination(destination)"
            >
              <!-- Destination Image Placeholder -->
              <div class="destination-image">
                <v-img
                  :src="destination.image || '/images/destinations/default.jpg'"
                  :alt="destination.name"
                  height="120"
                  cover
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-icon icon="mdi-image" size="32" color="grey-lighten-1"></v-icon>
                    </div>
                  </template>
                </v-img>
                
                <!-- Selection Indicator -->
                <div v-if="selectedDestination?.id === destination.id" class="selection-indicator">
                  <v-icon icon="mdi-check-circle" color="white" size="32"></v-icon>
                </div>
              </div>

              <v-card-title class="pb-2">
                <h3 class="text-subtitle-1">{{ destination.name }}</h3>
              </v-card-title>

              <v-card-subtitle class="pb-2">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-map-marker" size="small" class="mr-1"></v-icon>
                  {{ destination.address }}
                </div>
              </v-card-subtitle>

              <v-card-text>
                <!-- Category -->
                <v-chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  class="mb-2"
                >
                  {{ getCategoryLabel(destination.category) }}
                </v-chip>

                <!-- Accessibility Level -->
                <div v-if="destination.accessibility_level" class="d-flex align-center">
                  <v-icon icon="mdi-wheelchair-accessibility" size="small" class="mr-1"></v-icon>
                  <v-chip
                    :color="getAccessibilityColor(destination.accessibility_level)"
                    size="small"
                    variant="flat"
                  >
                    {{ destination.accessibility_level }}급 접근성
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <v-icon icon="mdi-map-marker-off" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
        <h3 class="text-h6 mb-2">검색 결과가 없습니다</h3>
        <p class="text-body-2 text-grey-darken-1">
          다른 검색어나 필터를 시도해보세요
        </p>
      </div>

      <!-- Time and Additional Info Form -->
      <div v-if="selectedDestination" class="mt-6">
        <v-divider class="mb-4"></v-divider>
        <h3 class="text-h6 mb-4">일정 상세 정보</h3>
        
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="destinationData.start_time"
              label="시작 시간 (선택사항)"
              type="time"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="destinationData.end_time"
              label="종료 시간 (선택사항)"
              type="time"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-text-field
          v-model.number="destinationData.duration_minutes"
          label="예상 소요 시간 (분)"
          type="number"
          variant="outlined"
          density="compact"
          class="mb-3"
          placeholder="120"
        ></v-text-field>

        <v-select
          v-model="destinationData.transportation_mode"
          :items="transportationOptions"
          label="이동 수단"
          variant="outlined"
          density="compact"
          class="mb-3"
        ></v-select>

        <v-textarea
          v-model="destinationData.notes"
          label="메모 (선택사항)"
          variant="outlined"
          density="compact"
          rows="2"
          placeholder="특별한 주의사항이나 계획을 적어보세요"
        ></v-textarea>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-6">
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        @click="$emit('cancel')"
      >
        취소
      </v-btn>
      <v-btn
        color="primary"
        :disabled="!selectedDestination"
        @click="addDestination"
      >
        <v-icon start>mdi-plus</v-icon>
        여행지 추가
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { destinationAPI } from '@/api/destination'

let searchTimeout = null

const props = defineProps({
  selectedDay: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['destination-selected', 'cancel'])

// State
const searchQuery = ref('')
const selectedCategory = ref([])
const destinations = ref([])
const loading = ref(false)
const selectedDestination = ref(null)
const destinationData = ref({
  start_time: '',
  end_time: '',
  duration_minutes: null,
  transportation_mode: 'public',
  notes: ''
})

// Categories
const categories = [
  { label: '관광지', value: 'attraction', icon: 'mdi-camera' },
  { label: '음식점', value: 'restaurant', icon: 'mdi-silverware' },
  { label: '숙박시설', value: 'accommodation', icon: 'mdi-bed' },
  { label: '쇼핑', value: 'shopping', icon: 'mdi-shopping' },
  { label: '문화시설', value: 'culture', icon: 'mdi-theater' },
  { label: '기타', value: 'other', icon: 'mdi-dots-horizontal' }
]

const transportationOptions = [
  { title: '대중교통', value: 'public' },
  { title: '자동차', value: 'car' },
  { title: '택시', value: 'taxi' },
  { title: '도보', value: 'walk' },
  { title: '장애인 택시', value: 'wheelchair_taxi' },
  { title: '기타', value: 'other' }
]

// Methods
const searchDestinations = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    
    const params = {
      search: searchQuery.value,
      category: selectedCategory.value.length > 0 ? selectedCategory.value[0] : null,
      limit: 20
    }
    
    const response = await destinationAPI.getDestinations(params)
    destinations.value = response.data.destinations || []
  } catch (error) {
    destinations.value = []
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    searchDestinations()
  }, 300)
}

const selectDestination = (destination) => {
  selectedDestination.value = destination
}

const addDestination = () => {
  if (!selectedDestination.value) return
  
  const data = {
    destination_id: selectedDestination.value.id,
    ...destinationData.value
  }
  
  emit('destination-selected', data)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  })
}

const getCategoryLabel = (category) => {
  const categoryObj = categories.find(cat => cat.value === category)
  return categoryObj?.label || category
}

const getAccessibilityColor = (level) => {
  const colors = {
    'A': 'success',
    'B': 'info',
    'C': 'warning',
    'D': 'error'
  }
  return colors[level] || 'grey'
}

// Watchers
watch([selectedCategory], () => {
  searchDestinations()
}, { deep: true })

// Lifecycle
onMounted(() => {
  searchDestinations()
})
</script>

<style scoped>
.destinations-grid {
  max-height: 400px;
  overflow-y: auto;
}

.destination-option {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.destination-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.destination-option.selected {
  border: 2px solid var(--v-theme-primary);
  transform: translateY(-2px);
}

.destination-image {
  position: relative;
  overflow: hidden;
}

.selection-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: var(--v-theme-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 600px) {
  .destinations-grid {
    max-height: 300px;
  }
  
  .destination-option .v-card-title {
    padding-bottom: 0.5rem !important;
  }
}
</style>