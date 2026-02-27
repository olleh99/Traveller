<template>
  <div class="day-itinerary">
    <!-- Day Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <v-btn
          v-if="!isEditingDay"
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="startEditDay"
        ></v-btn>
        <v-btn
          v-else
          icon="mdi-check"
          size="small"
          variant="text"
          color="success"
          @click="saveDay"
        ></v-btn>
        <v-btn
          v-if="isEditingDay"
          icon="mdi-close"
          size="small"
          variant="text"
          color="error"
          @click="cancelEditDay"
        ></v-btn>
      </div>
      <v-btn
        color="primary"
        size="small"
        variant="outlined"
        prepend-icon="mdi-plus"
        @click="$emit('add-destination', day)"
      >
        여행지 추가
      </v-btn>
    </div>

    <!-- Day Title and Notes Editing -->
    <div v-if="isEditingDay" class="mb-4">
      <v-text-field
        v-model="editData.title"
        label="일차 제목"
        variant="outlined"
        density="compact"
        class="mb-3"
      ></v-text-field>
      <v-textarea
        v-model="editData.notes"
        label="일차 메모"
        variant="outlined"
        density="compact"
        rows="2"
      ></v-textarea>
    </div>

    <!-- Day Notes Display -->
    <div v-else-if="day.notes" class="mb-4">
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
      >
        {{ day.notes }}
      </v-alert>
    </div>

    <!-- Destinations List -->
    <div v-if="day.destinations && day.destinations.length > 0">
      <draggable
        v-model="destinationsList"
        item-key="plan_destination_id"
        @end="onDragEnd"
        class="destinations-list"
      >
        <template #item="{ element: destination, index }">
          <v-card
            class="destination-card mb-3"
            elevation="1"
            :class="{ 'destination-editing': destination.plan_destination_id === editingDestinationId }"
          >
            <!-- Destination Header -->
            <v-card-title class="py-3">
              <div class="d-flex align-center w-100">
                <!-- Drag Handle -->
                <v-icon
                  icon="mdi-drag"
                  size="small"
                  class="drag-handle mr-3 text-grey"
                ></v-icon>

                <!-- Order Number -->
                <v-avatar
                  size="24"
                  color="primary"
                  class="mr-3"
                >
                  <span class="text-caption">{{ index + 1 }}</span>
                </v-avatar>

                <!-- Destination Info -->
                <div class="flex-grow-1">
                  <h4 class="text-subtitle-1">{{ destination.destination?.name || '여행지' }}</h4>
                  <p v-if="destination.destination?.address" class="text-caption text-grey-darken-1 mb-0">
                    {{ destination.destination.address }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="startEditDestination(destination)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="openDeleteDialog(destination)"
                  ></v-btn>
                </div>
              </div>
            </v-card-title>

            <!-- Destination Details -->
            <v-card-text v-if="destination.start_time || destination.notes || destination.plan_destination_id === editingDestinationId">
              <!-- Editing Mode -->
              <div v-if="destination.plan_destination_id === editingDestinationId" class="destination-edit-form">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editDestinationData.start_time"
                      label="시작 시간"
                      type="time"
                      variant="outlined"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editDestinationData.end_time"
                      label="종료 시간"
                      type="time"
                      variant="outlined"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-text-field
                  v-model.number="editDestinationData.duration_minutes"
                  label="예상 소요 시간 (분)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                ></v-text-field>

                <v-select
                  v-model="editDestinationData.transportation_mode"
                  :items="transportationOptions"
                  label="이동 수단"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                ></v-select>

                <v-textarea
                  v-model="editDestinationData.notes"
                  label="메모"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  class="mb-3"
                ></v-textarea>

                <div class="d-flex justify-end gap-2">
                  <v-btn
                    size="small"
                    variant="text"
                    @click="cancelEditDestination"
                  >
                    취소
                  </v-btn>
                  <v-btn
                    size="small"
                    color="primary"
                    @click="saveDestination"
                  >
                    저장
                  </v-btn>
                </div>
              </div>

              <!-- Display Mode -->
              <div v-else class="destination-details">
                <div v-if="destination.start_time" class="d-flex align-center mb-2">
                  <v-icon icon="mdi-clock-outline" size="small" class="mr-2"></v-icon>
                  <span class="text-body-2">
                    {{ formatTime(destination.start_time) }}
                    <span v-if="destination.end_time">
                      - {{ formatTime(destination.end_time) }}
                    </span>
                    <span v-if="destination.duration_minutes" class="text-grey-darken-1">
                      ({{ destination.duration_minutes }}분)
                    </span>
                  </span>
                </div>

                <div v-if="destination.transportation_mode" class="d-flex align-center mb-2">
                  <v-icon :icon="getTransportationIcon(destination.transportation_mode)" size="small" class="mr-2"></v-icon>
                  <span class="text-body-2">{{ getTransportationLabel(destination.transportation_mode) }}</span>
                </div>

                <div v-if="destination.notes" class="destination-notes">
                  <v-icon icon="mdi-note-text" size="small" class="mr-2"></v-icon>
                  <span class="text-body-2">{{ destination.notes }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </template>
      </draggable>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-6">
      <v-icon icon="mdi-map-marker-off" size="48" color="grey-lighten-1" class="mb-3"></v-icon>
      <p class="text-body-2 text-grey-darken-1 mb-4">
        이 날에는 아직 계획된 장소가 없습니다
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-plus"
        @click="$emit('add-destination', day)"
      >
        여행지 추가하기
      </v-btn>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog.show"
      max-width="400"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-alert" color="warning" class="mr-3"></v-icon>
          여행지 제거 확인
        </v-card-title>
        
        <v-card-text>
          <p class="mb-2">
            <strong>{{ deleteDialog.destination?.destination?.name || '여행지' }}</strong>를 
            일정에서 제거하시겠습니까?
          </p>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeDeleteDialog"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmRemoveDestination"
          >
            제거
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  day: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'add-destination',
  'remove-destination', 
  'update-destination',
  'reorder-destinations',
  'update-day'
])

// State
const isEditingDay = ref(false)
const editingDestinationId = ref(null)
const editData = ref({
  title: '',
  notes: ''
})
const editDestinationData = ref({})
const deleteDialog = ref({
  show: false,
  destination: null
})

// Computed
const destinationsList = computed({
  get: () => props.day.destinations || [],
  set: (value) => {
    // 드래그 앤 드롭으로 순서가 변경될 때 호출
    const reorderedDestinations = value.map((dest, index) => ({
      plan_destination_id: dest.plan_destination_id,
      order_index: index
    }))
    emit('reorder-destinations', props.day.day_id, reorderedDestinations)
  }
})

const transportationOptions = [
  { title: '대중교통', value: 'public' },
  { title: '자동차', value: 'car' },
  { title: '택시', value: 'taxi' },
  { title: '도보', value: 'walk' },
  { title: '장애인 택시', value: 'wheelchair_taxi' },
  { title: '기타', value: 'other' }
]

// Methods
const startEditDay = () => {
  isEditingDay.value = true
  editData.value = {
    title: props.day.title || `${props.day.day_number}일차`,
    notes: props.day.notes || ''
  }
}

const saveDay = () => {
  emit('update-day', props.day.day_id, editData.value)
  isEditingDay.value = false
}

const cancelEditDay = () => {
  isEditingDay.value = false
  editData.value = { title: '', notes: '' }
}

const startEditDestination = (destination) => {
  editingDestinationId.value = destination.plan_destination_id
  editDestinationData.value = { ...destination }
}

const saveDestination = () => {
  emit('update-destination', editingDestinationId.value, editDestinationData.value)
  editingDestinationId.value = null
  editDestinationData.value = {}
}

const cancelEditDestination = () => {
  editingDestinationId.value = null
  editDestinationData.value = {}
}

const openDeleteDialog = (destination) => {
  deleteDialog.value = {
    show: true,
    destination: destination
  }
}

const closeDeleteDialog = () => {
  deleteDialog.value = {
    show: false,
    destination: null
  }
}

const confirmRemoveDestination = () => {
  if (deleteDialog.value.destination) {
    emit('remove-destination', deleteDialog.value.destination.plan_destination_id)
  }
  closeDeleteDialog()
}

const onDragEnd = () => {
  // 드래그 완료 후 자동으로 순서 업데이트 (computed setter에서 처리)
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  return timeString.substring(0, 5) // HH:MM 형식으로 자르기
}

const getTransportationIcon = (mode) => {
  const icons = {
    public: 'mdi-bus',
    car: 'mdi-car',
    taxi: 'mdi-taxi',
    walk: 'mdi-walk',
    wheelchair_taxi: 'mdi-wheelchair-accessibility',
    other: 'mdi-dots-horizontal'
  }
  return icons[mode] || 'mdi-help'
}

const getTransportationLabel = (mode) => {
  const labels = {
    public: '대중교통',
    car: '자동차',
    taxi: '택시', 
    walk: '도보',
    wheelchair_taxi: '장애인 택시',
    other: '기타'
  }
  return labels[mode] || mode
}
</script>

<style scoped>
.day-itinerary {
  padding: 1rem 0;
}

.destinations-list {
  min-height: 50px;
}

.destination-card {
  transition: all 0.2s ease;
  cursor: move;
}

.destination-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.destination-editing {
  border: 2px solid var(--v-theme-primary);
}

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.destination-details {
  background-color: #f9f9f9;
  padding: 0.75rem;
  border-radius: 8px;
}

.destination-notes {
  background-color: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid var(--v-theme-primary);
  margin-top: 0.5rem;
}

.destination-edit-form {
  background-color: #f0f8ff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--v-theme-primary);
}

@media (max-width: 600px) {
  .destination-card .v-card-title {
    padding: 0.75rem !important;
  }
  
  .destination-details {
    padding: 0.5rem;
  }
}
</style>