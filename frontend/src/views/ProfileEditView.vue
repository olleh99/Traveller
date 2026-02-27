<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- 페이지 헤더 -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h3 font-weight-bold mb-2">
              <v-icon size="large" class="mr-3">mdi-account-edit</v-icon>
              프로필 수정
            </h1>
            <p class="text-h6 text-grey-darken-1">
              개인 정보를 수정하고 관리하세요
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

        <!-- 기본 프로필 수정 -->
        <v-card elevation="2" class="mb-6">
          <v-card-title class="text-h5 pa-4 bg-primary text-white">
            <v-icon class="me-2">mdi-account</v-icon>
            기본 정보
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- 프로필 이미지 섹션 -->
            <div class="text-center mb-6">
              <v-avatar size="120" class="mb-4">
                <v-img
                  v-if="formData.profile_image_url"
                  :src="getImageUrl(formData.profile_image_url)"
                  :alt="`${formData.name}님의 프로필 사진`"
                />
                <v-icon v-else size="60" color="grey-lighten-1">
                  mdi-account-circle
                </v-icon>
              </v-avatar>

              <div class="d-flex justify-center gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="$refs.fileInput.click()"
                  :loading="isUploadingImage"
                >
                  <v-icon start>mdi-camera</v-icon>
                  사진 선택
                </v-btn>
                <v-btn
                  v-if="formData.profile_image_url"
                  color="error"
                  variant="outlined"
                  @click="deleteImage"
                  :loading="isDeletingImage"
                >
                  <v-icon start>mdi-delete</v-icon>
                  삭제
                </v-btn>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="uploadImage"
              />
            </div>

            <!-- 기본 정보 폼 -->
            <v-form @submit.prevent="saveBasicProfile" ref="basicForm" v-model="isBasicFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="이름"
                    prepend-icon="mdi-account"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.nickname"
                    label="닉네임"
                    prepend-icon="mdi-at"
                    :rules="nicknameRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.phone_number"
                    label="전화번호"
                    prepend-icon="mdi-phone"
                    :rules="phoneRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.birth_date"
                    label="생년월일"
                    type="date"
                    prepend-icon="mdi-calendar"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.gender"
                    label="성별"
                    :items="genderOptions"
                    prepend-icon="mdi-gender-male-female"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.address"
                    label="주소"
                    prepend-icon="mdi-map-marker"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-card-actions class="px-0 pb-0">
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="isSavingBasic"
                  :disabled="!isBasicFormValid"
                >
                  <v-icon start>mdi-content-save</v-icon>
                  기본 정보 저장
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- 장애인 프로필 (장애인 사용자인 경우) -->
        <v-card v-if="userType === 'disabled_traveler'" elevation="2" class="mb-6">
          <v-card-title class="text-h5 pa-4 bg-info text-white">
            <v-icon class="me-2">mdi-wheelchair-accessibility</v-icon>
            장애인 정보
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="saveDisabilityProfile" ref="disabilityForm" v-model="isDisabilityFormValid">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="disabilityData.disability_type"
                    label="장애 유형"
                    :items="disabilityTypeOptions"
                    multiple
                    chips
                    prepend-icon="mdi-medical-bag"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="disabilityData.disability_level"
                    label="장애 등급"
                    :items="disabilityLevelOptions"
                    prepend-icon="mdi-format-list-numbered"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="disabilityData.mobility_aid"
                    label="보조기기"
                    :items="mobilityAidOptions"
                    multiple
                    chips
                    prepend-icon="mdi-cane"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="disabilityData.assistance_needs"
                    label="지원 필요사항"
                    rows="3"
                    prepend-icon="mdi-help-circle"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="disabilityData.emergency_contact"
                    label="응급 연락처"
                    prepend-icon="mdi-phone-alert"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="disabilityData.medical_conditions"
                    label="의료 상태 / 특이사항"
                    rows="3"
                    prepend-icon="mdi-medical-bag"
                  ></v-textarea>
                </v-col>
              </v-row>

              <v-card-actions class="px-0 pb-0">
                <v-spacer></v-spacer>
                <v-btn
                  color="info"
                  type="submit"
                  :loading="isSavingDisability"
                >
                  <v-icon start>mdi-content-save</v-icon>
                  장애인 정보 저장
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- 동행인 프로필 (동행인인 경우) -->
        <v-card v-if="userType === 'companion'" elevation="2" class="mb-6">
          <v-card-title class="text-h5 pa-4 bg-success text-white">
            <v-icon class="me-2">mdi-account-group</v-icon>
            동행인 정보
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="saveCompanionProfile" ref="companionForm" v-model="isCompanionFormValid">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="companionData.supported_disabilities"
                    label="지원 가능한 장애 유형"
                    :items="disabilityTypeOptions"
                    multiple
                    chips
                    prepend-icon="mdi-account-heart"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="companionData.experience_years"
                    label="경력 (년)"
                    type="number"
                    min="0"
                    prepend-icon="mdi-calendar-clock"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="companionData.rate_per_hour"
                    label="시간당 요금 (원)"
                    type="number"
                    min="0"
                    prepend-icon="mdi-currency-krw"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="companionData.certifications"
                    label="보유 자격증"
                    :items="certificationOptions"
                    multiple
                    chips
                    prepend-icon="mdi-certificate"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="companionData.specializations"
                    label="전문 분야 / 특기사항"
                    rows="3"
                    prepend-icon="mdi-star-circle"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="companionData.availability"
                    label="활동 가능 시간/지역"
                    rows="3"
                    prepend-icon="mdi-clock-time-eight"
                  ></v-textarea>
                </v-col>
              </v-row>

              <v-card-actions class="px-0 pb-0">
                <v-spacer></v-spacer>
                <v-btn
                  color="success"
                  type="submit"
                  :loading="isSavingCompanion"
                >
                  <v-icon start>mdi-content-save</v-icon>
                  동행인 정보 저장
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      top
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSnackbar = false">
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/api/user'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const formData = ref({
  name: '',
  nickname: '',
  phone_number: '',
  birth_date: '',
  gender: '',
  address: '',
  profile_image_url: ''
})

const disabilityData = ref({
  disability_type: [],
  disability_level: '',
  mobility_aid: [],
  assistance_needs: '',
  emergency_contact: '',
  medical_conditions: ''
})

const companionData = ref({
  supported_disabilities: [],
  experience_years: 0,
  certifications: [],
  specializations: '',
  availability: '',
  rate_per_hour: 0
})

// Form validation
const isBasicFormValid = ref(false)
const isDisabilityFormValid = ref(false)
const isCompanionFormValid = ref(false)

// Loading states
const isSavingBasic = ref(false)
const isSavingDisability = ref(false)
const isSavingCompanion = ref(false)
const isUploadingImage = ref(false)
const isDeletingImage = ref(false)

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Computed
const userType = computed(() => authStore.user?.user_type || 'general')

// Form validation rules
const nameRules = [
  v => !!v || '이름은 필수입니다',
  v => v.length >= 2 || '이름은 최소 2글자 이상이어야 합니다'
]

const nicknameRules = [
  v => !!v || '닉네임은 필수입니다',
  v => v.length >= 2 || '닉네임은 최소 2글자 이상이어야 합니다'
]

const phoneRules = [
  v => !v || /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(v) || '올바른 전화번호 형식을 입력하세요'
]

// Options
const genderOptions = [
  { title: '남성', value: 'male' },
  { title: '여성', value: 'female' },
  { title: '기타', value: 'other' }
]

const disabilityTypeOptions = [
  { title: '시각장애', value: 'visual' },
  { title: '청각장애', value: 'hearing' },
  { title: '지체장애', value: 'physical' },
  { title: '뇌병변장애', value: 'brain' },
  { title: '발달장애', value: 'developmental' },
  { title: '정신장애', value: 'mental' },
  { title: '기타', value: 'other' }
]

const disabilityLevelOptions = [
  { title: '1급', value: '1' },
  { title: '2급', value: '2' },
  { title: '3급', value: '3' },
  { title: '4급', value: '4' },
  { title: '5급', value: '5' },
  { title: '6급', value: '6' }
]

const mobilityAidOptions = [
  { title: '휠체어', value: 'wheelchair' },
  { title: '지팡이', value: 'cane' },
  { title: '보행기', value: 'walker' },
  { title: '안내견', value: 'guide_dog' },
  { title: '보청기', value: 'hearing_aid' },
  { title: '기타', value: 'other' }
]

const certificationOptions = [
  { title: '사회복지사', value: 'social_worker' },
  { title: '간병사', value: 'caregiver' },
  { title: '수화통역사', value: 'sign_interpreter' },
  { title: '점역사', value: 'braille_translator' },
  { title: '여행인솔자', value: 'tour_conductor' },
  { title: '기타', value: 'other' }
]

// Methods
const loadProfile = async () => {
  try {
    const response = await userAPI.getProfile()
    const userData = response.data || response
    
    // 기본 정보 설정 (필드명 매핑)
    formData.value = {
      name: userData.name || '',
      nickname: userData.nickname || '',
      phone_number: userData.phone || '', // phone -> phone_number
      birth_date: userData.birth_date || '',
      gender: userData.gender || '',
      address: userData.region_city || '', // region_city -> address
      profile_image_url: userData.profile_image_url || ''
    }

    // 장애인 프로필 로드
    if (userType.value === 'disabled_traveler' && userData.disabilityProfile) {
      const dp = userData.disabilityProfile
      disabilityData.value = {
        disability_type: dp.disability_types || [],
        disability_level: dp.disability_level || '',
        mobility_aid: dp.assistive_devices || [],
        assistance_needs: dp.support_needs?.assistance || '',
        emergency_contact: dp.emergency_contacts?.[0]?.phone || '',
        medical_conditions: dp.support_needs?.medical || ''
      }
    }

    // 동행인 프로필 로드
    if (userType.value === 'companion' && userData.companionProfile) {
      const cp = userData.companionProfile
      companionData.value = {
        supported_disabilities: cp.supportable_disabilities || [],
        experience_years: cp.experience_years || 0,
        certifications: cp.certifications || [],
        specializations: cp.experience_description || '',
        availability: cp.availability || '',
        rate_per_hour: cp.rate_per_hour || 0
      }
    }
  } catch (error) {
    console.error('프로필 로드 실패:', error)
    showMessage('프로필 정보를 불러올 수 없습니다.', 'error')
  }
}

const saveBasicProfile = async () => {
  if (!isBasicFormValid.value) return

  try {
    isSavingBasic.value = true
    // 모든 필드를 명시적으로 포함
    const profileData = {
      name: formData.value.name || '',
      nickname: formData.value.nickname || '',
      phone_number: formData.value.phone_number || '',
      birth_date: formData.value.birth_date || '',
      gender: formData.value.gender || '',
      address: formData.value.address || '',
      profile_image_url: formData.value.profile_image_url || ''
    }
    
    const response = await userAPI.updateProfile(profileData)
    
    await authStore.fetchUser() // 사용자 정보 새로고침
    showMessage('기본 정보가 성공적으로 저장되었습니다.', 'success')
    
    // 성공 메시지 표시 후 마이페이지로 이동
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error) {
    console.error('기본 정보 저장 실패:', error)
    const errorMessage = error.message || error.error?.message || '기본 정보 저장에 실패했습니다.'
    showMessage(errorMessage, 'error')
  } finally {
    isSavingBasic.value = false
  }
}

const saveDisabilityProfile = async () => {
  try {
    isSavingDisability.value = true
    
    const profileData = {
      disability_types: disabilityData.value.disability_type,
      disability_level: disabilityData.value.disability_level,
      assistive_devices: disabilityData.value.mobility_aid,
      support_needs: {
        assistance: disabilityData.value.assistance_needs,
        medical: disabilityData.value.medical_conditions
      },
      emergency_contacts: disabilityData.value.emergency_contact ? [{
        name: '응급연락처',
        phone: disabilityData.value.emergency_contact,
        relationship: 'emergency'
      }] : []
    }

    await userAPI.updateDisabilityProfile(profileData)
    showMessage('장애인 정보가 성공적으로 저장되었습니다.', 'success')
    
    // 성공 메시지 표시 후 마이페이지로 이동
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error) {
    console.error('장애인 정보 저장 실패:', error)
    showMessage('장애인 정보 저장에 실패했습니다.', 'error')
  } finally {
    isSavingDisability.value = false
  }
}

const saveCompanionProfile = async () => {
  try {
    isSavingCompanion.value = true
    
    const profileData = {
      supportable_disabilities: companionData.value.supported_disabilities,
      experience_years: companionData.value.experience_years,
      experience_description: companionData.value.specializations,
      certifications: companionData.value.certifications,
      availability: companionData.value.availability,
      rate_per_hour: companionData.value.rate_per_hour
    }

    await userAPI.updateCompanionProfile(profileData)
    showMessage('동행인 정보가 성공적으로 저장되었습니다.', 'success')
    
    // 성공 메시지 표시 후 마이페이지로 이동
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error) {
    console.error('동행인 정보 저장 실패:', error)
    showMessage('동행인 정보 저장에 실패했습니다.', 'error')
  } finally {
    isSavingCompanion.value = false
  }
}

const uploadImage = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    isUploadingImage.value = true
    const response = await userAPI.uploadProfileImage(file)
    formData.value.profile_image_url = response.data?.profile_image_url
    await authStore.fetchUser() // 사용자 정보 새로고침
    showMessage('프로필 이미지가 업로드되었습니다.', 'success')
  } catch (error) {
    console.error('이미지 업로드 실패:', error)
    showMessage('이미지 업로드에 실패했습니다.', 'error')
  } finally {
    isUploadingImage.value = false
  }
}

const deleteImage = async () => {
  try {
    isDeletingImage.value = true
    await userAPI.deleteProfileImage()
    formData.value.profile_image_url = ''
    await authStore.fetchUser() // 사용자 정보 새로고침
    showMessage('프로필 이미지가 삭제되었습니다.', 'success')
  } catch (error) {
    console.error('이미지 삭제 실패:', error)
    showMessage('이미지 삭제에 실패했습니다.', 'error')
  } finally {
    isDeletingImage.value = false
  }
}

const getImageUrl = (url) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `http://localhost:3000${url}`
}

const showMessage = (message, color = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-section {
  margin-bottom: 2rem;
}

.image-upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.image-upload-area:hover {
  border-color: #1976d2;
}

.form-section {
  margin-bottom: 1.5rem;
}
</style>