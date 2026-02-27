<template>
  <div class="image-uploader">
    <!-- 드래그 앤 드롭 영역 -->
    <div
      ref="dropZone"
      class="drop-zone"
      :class="{
        'drop-zone--active': isDragOver,
        'drop-zone--error': error
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <!-- 파일 입력 -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="file-input"
        @change="handleFileSelect"
      />

      <!-- 드롭 영역 내용 -->
      <div class="drop-zone__content">
        <v-icon size="48" color="primary" class="mb-4">
          mdi-cloud-upload
        </v-icon>
        <h3 class="text-h6 mb-2">이미지를 드래그하거나 클릭하여 업로드</h3>
        <p class="text-body-2 text-grey-darken-1 mb-2">
          JPG, PNG, GIF, WebP 파일 지원 (최대 10MB)
        </p>
        <p class="text-caption text-grey-darken-1">
          최대 {{ maxFiles }}개 파일까지 업로드 가능
        </p>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
      dismissible
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>

    <!-- 선택된 이미지 미리보기 -->
    <div v-if="selectedFiles.length > 0" class="preview-section mt-4">
      <h4 class="text-h6 mb-3">선택된 이미지 ({{ selectedFiles.length }}개)</h4>
      
      <v-row>
        <v-col
          v-for="(file, index) in selectedFiles"
          :key="index"
          cols="12" sm="6" md="4"
        >
          <v-card class="preview-card" elevation="2">
            <!-- 이미지 미리보기 -->
            <v-img
              :src="file.preview"
              :alt="`미리보기 ${index + 1}`"
              height="200"
              cover
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-row>
              </template>
            </v-img>

            <!-- 카드 내용 -->
            <v-card-text class="pa-3">
              <div class="d-flex align-center mb-2">
                <v-icon size="small" class="mr-1">mdi-file-image</v-icon>
                <span class="text-caption text-truncate">{{ file.name }}</span>
              </div>
              
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-grey-darken-1">
                  {{ formatFileSize(file.size) }}
                </span>
                <v-chip size="x-small" :color="getFileSizeColor(file.size)" variant="flat">
                  {{ file.size > 5 * 1024 * 1024 ? '큰 파일' : '적정 크기' }}
                </v-chip>
              </div>

              <!-- 이미지 타입 선택 -->
              <v-select
                v-model="file.imageType"
                :items="imageTypeOptions"
                label="이미지 유형"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-2"
              />

              <!-- 이미지 설명 -->
              <v-textarea
                v-model="file.description"
                label="이미지 설명 (선택사항)"
                variant="outlined"
                density="compact"
                rows="2"
                hide-details
                placeholder="이 이미지에 대한 간단한 설명을 입력하세요"
                class="mb-2"
              />
            </v-card-text>

            <!-- 카드 액션 -->
            <v-card-actions class="px-3 pb-3">
              <v-spacer></v-spacer>
              <v-btn
                size="small"
                color="error"
                variant="text"
                prepend-icon="mdi-delete"
                @click="removeFile(index)"
              >
                제거
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 업로드 버튼 -->
    <div v-if="selectedFiles.length > 0" class="upload-actions mt-4">
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-upload"
        :loading="uploading"
        :disabled="selectedFiles.length === 0"
        @click="uploadImages"
      >
        {{ uploading ? '업로드 중...' : `${selectedFiles.length}개 이미지 업로드` }}
      </v-btn>
      
      <v-btn
        variant="outlined"
        size="large"
        prepend-icon="mdi-delete-sweep"
        class="ml-2"
        @click="clearFiles"
        :disabled="uploading"
      >
        모두 제거
      </v-btn>
    </div>

    <!-- 업로드 진행률 -->
    <v-progress-linear
      v-if="uploading"
      :model-value="uploadProgress"
      color="primary"
      height="6"
      rounded
      class="mt-4"
    />
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'

const props = defineProps({
  maxFiles: {
    type: Number,
    default: 5
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  }
})

const emit = defineEmits(['files-selected', 'upload-complete', 'upload-error'])

// 반응형 상태
const dropZone = ref(null)
const fileInput = ref(null)
const selectedFiles = ref([])
const isDragOver = ref(false)
const error = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)

// 이미지 타입 옵션
const imageTypeOptions = [
  { title: '일반 사진', value: 'general' },
  { title: '접근성 정보', value: 'accessibility' },
  { title: '시설 정보', value: 'facility' }
]

// 드래그 이벤트 핸들러
const handleDragOver = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

// 파일 선택 핸들러
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  processFiles(files)
}

// 파일 처리
const processFiles = (files) => {
  error.value = null
  
  // 파일 개수 체크
  if (selectedFiles.value.length + files.length > props.maxFiles) {
    error.value = `최대 ${props.maxFiles}개의 파일만 업로드할 수 있습니다.`
    return
  }

  const validFiles = []
  
  for (const file of files) {
    // 파일 크기 체크
    if (file.size > props.maxFileSize) {
      error.value = `파일 크기는 ${formatFileSize(props.maxFileSize)}를 초과할 수 없습니다.`
      continue
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      error.value = '이미지 파일만 업로드할 수 있습니다.'
      continue
    }

    // 미리보기 URL 생성
    const preview = URL.createObjectURL(file)
    
    validFiles.push({
      file,
      name: file.name,
      size: file.size,
      preview,
      imageType: 'general',
      description: ''
    })
  }

  selectedFiles.value.push(...validFiles)
  emit('files-selected', selectedFiles.value)
}

// 파일 제거
const removeFile = (index) => {
  const removedFile = selectedFiles.value[index]
  URL.revokeObjectURL(removedFile.preview)
  selectedFiles.value.splice(index, 1)
  emit('files-selected', selectedFiles.value)
}

// 모든 파일 제거
const clearFiles = () => {
  selectedFiles.value.forEach(file => {
    URL.revokeObjectURL(file.preview)
  })
  selectedFiles.value = []
  emit('files-selected', [])
}

// 이미지 업로드
const uploadImages = () => {
  if (selectedFiles.value.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  const formData = new FormData()
  
  selectedFiles.value.forEach((fileData, index) => {
    formData.append('images', fileData.file)
    formData.append(`imageType_${index}`, fileData.imageType)
    formData.append(`description_${index}`, fileData.description)
  })

  // 진행률 시뮬레이션 (실제로는 axios의 onUploadProgress를 사용해야 함)
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += 10
    }
  }, 200)

  emit('upload-complete', {
    formData,
    files: selectedFiles.value,
    onSuccess: () => {
      clearInterval(progressInterval)
      uploadProgress.value = 100
      uploading.value = false
      clearFiles()
    },
    onError: (errorMessage) => {
      clearInterval(progressInterval)
      uploading.value = false
      uploadProgress.value = 0
      error.value = errorMessage
      emit('upload-error', errorMessage)
    }
  })
}

// 유틸리티 함수
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileSizeColor = (size) => {
  if (size > 5 * 1024 * 1024) return 'warning' // 5MB 이상
  if (size > 8 * 1024 * 1024) return 'error'   // 8MB 이상
  return 'success'
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.drop-zone:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.drop-zone--active {
  border-color: #1976d2;
  background-color: #e3f2fd;
  transform: scale(1.02);
}

.drop-zone--error {
  border-color: #d32f2f;
  background-color: #ffebee;
}

.file-input {
  display: none;
}

.drop-zone__content {
  pointer-events: none;
}

.preview-section {
  max-height: 600px;
  overflow-y: auto;
}

.preview-card {
  transition: all 0.3s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upload-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .drop-zone {
    padding: 1rem;
  }
  
  .upload-actions {
    flex-direction: column;
  }
  
  .upload-actions .v-btn {
    width: 100%;
  }
}
</style>