<template>
  <div class="register-page">
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" lg="8" xl="6">
          <v-card
            class="register-card pa-8"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="4"
          >
            <div class="text-center mb-8">
              <h1 
                class="text-h3 font-weight-bold mb-4"
                :class="accessibilityStore.fontSizeClass"
              >
                회원가입
              </h1>
              <p 
                class="text-h6 text-grey-darken-1"
                :class="accessibilityStore.fontSizeClass"
              >
                {{ getUserTypeDescription() }}
              </p>
            </div>

            <v-form ref="form" v-model="valid" @submit.prevent="register">
              <!-- 회원 유형 선택 -->
              <v-card 
                variant="outlined" 
                class="mb-6 pa-4"
                :class="{ 'selected-type': true }"
              >
                <div class="d-flex align-center">
                  <v-icon :icon="getSelectedTypeIcon()" size="32" class="mr-3" color="primary"></v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-bold">{{ getSelectedTypeTitle() }}</h3>
                    <p class="text-body-2 mb-0">{{ getUserTypeDescription() }}</p>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                    variant="text"
                    size="small"
                    @click="showUserTypeDialog = true"
                  >
                    변경
                  </v-btn>
                </div>
              </v-card>

              <!-- 회원 유형 변경 다이얼로그 -->
              <v-dialog
                v-model="showUserTypeDialog"
                max-width="600"
                persistent
              >
                <v-card>
                  <v-card-title class="text-h5 font-weight-bold">
                    회원 유형 선택
                  </v-card-title>
                  
                  <v-card-text>
                    <p class="text-body-1 mb-6">
                      가입하실 회원 유형을 선택해주세요. 유형에 따라 제공되는 서비스가 다릅니다.
                    </p>
                    
                    <v-row>
                      <v-col
                        v-for="type in userTypes"
                        :key="type.id"
                        cols="12"
                      >
                        <v-card
                          :class="{ 
                            'user-type-option': true,
                            'selected': selectedUserType === type.type,
                            'high-contrast-option': accessibilityStore.highContrast
                          }"
                          variant="outlined"
                          @click="selectedUserType = type.type"
                          :ripple="!accessibilityStore.reduceMotion"
                          tabindex="0"
                          @keypress.enter="selectedUserType = type.type"
                          role="button"
                          :aria-label="`${type.title} 선택`"
                        >
                          <v-card-text class="pa-4">
                            <div class="d-flex align-center">
                              <v-radio
                                :model-value="selectedUserType"
                                :value="type.type"
                                color="primary"
                                hide-details
                                class="mr-3"
                              ></v-radio>
                              
                              <v-icon
                                :icon="type.icon"
                                size="48"
                                class="mr-4"
                                :color="selectedUserType === type.type ? 'primary' : 'grey'"
                              ></v-icon>
                              
                              <div class="flex-grow-1">
                                <h3 
                                  class="text-h6 font-weight-bold mb-2"
                                  :class="accessibilityStore.fontSizeClass"
                                >
                                  {{ type.title }}
                                </h3>
                                <p 
                                  class="text-body-2 mb-0"
                                  :class="accessibilityStore.fontSizeClass"
                                >
                                  {{ type.description }}
                                </p>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  
                  <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn
                      variant="text"
                      @click="cancelUserTypeChange"
                    >
                      취소
                    </v-btn>
                    <v-btn
                      color="primary"
                      @click="confirmUserTypeChange"
                      :disabled="!selectedUserType"
                    >
                      확인
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

              <!-- 기본 정보 -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.name"
                    label="이름"
                    :rules="nameRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.nickname"
                    label="닉네임"
                    :rules="nicknameRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-account-circle-outline"
                    @blur="checkNicknameAvailability"
                    :loading="nicknameChecking"
                    :success="nicknameValid === true"
                    :error="nicknameValid === false"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="formData.email"
                label="이메일"
                type="email"
                :rules="emailRules"
                required
                variant="outlined"
                prepend-inner-icon="mdi-email"
                @blur="checkEmailAvailability"
                :loading="emailChecking"
                :success="emailValid === true"
                :error="emailValid === false"
                class="mb-4"
              ></v-text-field>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.password"
                    label="비밀번호"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="passwordRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.confirmPassword"
                    label="비밀번호 확인"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    :rules="confirmPasswordRules"
                    required
                    variant="outlined"
                    prepend-inner-icon="mdi-lock-check"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="formData.phone"
                label="휴대전화번호"
                type="tel"
                :rules="phoneRules"
                required
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                placeholder="010-1234-5678"
              ></v-text-field>

              <!-- 장애인 여행자 추가 정보 -->
              <div v-if="userType === 'disabled'" class="mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">추가 정보</h3>
                
                <v-select
                  v-model="formData.disabilityType"
                  label="장애 유형"
                  :items="disabilityTypes"
                  :rules="[v => !!v || '장애 유형을 선택해주세요']"
                  variant="outlined"
                  prepend-inner-icon="mdi-wheelchair-accessibility"
                ></v-select>

                <v-checkbox
                  v-model="formData.useAssistiveDevice"
                  label="보조기구 사용"
                  hide-details
                ></v-checkbox>

                <v-select
                  v-model="formData.companionNeedLevel"
                  label="동행 필요 정도"
                  :items="companionNeedLevels"
                  :rules="[v => !!v || '동행 필요 정도를 선택해주세요']"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-group"
                ></v-select>
              </div>

              <!-- 동행 지원자 추가 정보 -->
              <div v-if="userType === 'companion'" class="mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">지원자 정보</h3>
                
                <v-textarea
                  v-model="formData.experience"
                  label="관련 경력 및 경험"
                  :rules="[v => !!v || '경력 및 경험을 입력해주세요']"
                  variant="outlined"
                  rows="3"
                  prepend-inner-icon="mdi-certificate"
                ></v-textarea>

                <v-textarea
                  v-model="formData.introduction"
                  label="자기소개"
                  :rules="[v => !!v || '자기소개를 입력해주세요']"
                  variant="outlined"
                  rows="3"
                  prepend-inner-icon="mdi-account-details"
                ></v-textarea>

                <v-file-input
                  v-model="formData.certificate"
                  label="자격증명서 (선택사항)"
                  accept="image/*,.pdf"
                  variant="outlined"
                  prepend-inner-icon="mdi-file-document"
                  show-size
                ></v-file-input>
              </div>

              <!-- 약관 동의 -->
              <div class="mb-6">
                <h3 class="text-h6 font-weight-bold mb-4">약관 동의</h3>
                
                <v-checkbox
                  v-model="agreements.terms"
                  :rules="[v => !!v || '이용약관에 동의해주세요']"
                  hide-details="auto"
                >
                  <template v-slot:label>
                    <div>
                      <span class="text-red">*</span> 이용약관에 동의합니다
                      <v-btn 
                        variant="text" 
                        size="small" 
                        to="/terms" 
                        target="_blank"
                        class="ml-2"
                      >
                        보기
                      </v-btn>
                    </div>
                  </template>
                </v-checkbox>

                <v-checkbox
                  v-model="agreements.privacy"
                  :rules="[v => !!v || '개인정보처리방침에 동의해주세요']"
                  hide-details="auto"
                >
                  <template v-slot:label>
                    <div>
                      <span class="text-red">*</span> 개인정보처리방침에 동의합니다
                      <v-btn 
                        variant="text" 
                        size="small" 
                        to="/privacy" 
                        target="_blank"
                        class="ml-2"
                      >
                        보기
                      </v-btn>
                    </div>
                  </template>
                </v-checkbox>

                <v-checkbox
                  v-model="agreements.marketing"
                  hide-details="auto"
                >
                  <template v-slot:label>
                    <div>
                      마케팅 정보 수신에 동의합니다 (선택)
                    </div>
                  </template>
                </v-checkbox>
              </div>

              <v-btn
                type="submit"
                color="primary"
                size="x-large"
                block
                :loading="loading"
                :disabled="!valid"
                class="mb-4"
              >
                회원가입
              </v-btn>

              <div class="text-center">
                <p class="text-body-2">
                  이미 계정이 있으신가요?
                  <router-link to="/login" class="text-decoration-none text-primary">
                    로그인하기
                  </router-link>
                </p>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccessibilityStore } from '@/stores/accessibility'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const accessibilityStore = useAccessibilityStore()
const authStore = useAuthStore()

const form = ref(null)
const valid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const userType = ref('general')
const showUserTypeDialog = ref(false)
const selectedUserType = ref('')

// 중복 확인 상태
const emailChecking = ref(false)
const emailValid = ref(null)
const nicknameChecking = ref(false)
const nicknameValid = ref(null)

const formData = ref({
  name: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  disabilityType: '',
  useAssistiveDevice: false,
  companionNeedLevel: '',
  experience: '',
  introduction: '',
  certificate: null
})

const agreements = ref({
  terms: false,
  privacy: false,
  marketing: false
})

const disabilityTypes = [
  '지체장애',
  '시각장애',
  '청각장애',
  '지적장애',
  '뇌병변장애',
  '기타'
]

const companionNeedLevels = [
  { title: '높음 - 전반적인 도움 필요', value: 'high' },
  { title: '보통 - 부분적인 도움 필요', value: 'medium' },
  { title: '낮음 - 최소한의 도움 필요', value: 'low' }
]

const userTypes = ref([
  {
    id: 1,
    type: 'disabled',
    icon: 'mdi-wheelchair-accessibility',
    title: '장애인 여행자',
    description: '맞춤형 여행 정보와 동행 서비스를 이용하세요'
  },
  {
    id: 2,
    type: 'companion',
    icon: 'mdi-human-handsup',
    title: '동행 지원자',
    description: '여행 동행을 통해 의미있는 경험을 나누세요'
  },
  {
    id: 3,
    type: 'general',
    icon: 'mdi-account-circle',
    title: '일반 회원',
    description: '배리어프리 여행 정보를 공유하고 소통하세요'
  }
])

const nameRules = [
  v => !!v || '이름을 입력해주세요',
  v => (v && v.length >= 2) || '이름은 2글자 이상 입력해주세요'
]

const nicknameRules = [
  v => !!v || '닉네임을 입력해주세요',
  v => (v && v.length >= 2) || '닉네임은 2글자 이상 입력해주세요',
  v => (v && v.length <= 20) || '닉네임은 20글자 이하로 입력해주세요',
  v => /^[가-힣a-zA-Z0-9_]+$/.test(v) || '닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다',
  () => nicknameValid.value !== false || '이미 사용 중인 닉네임입니다'
]

const emailRules = [
  v => !!v || '이메일을 입력해주세요',
  v => /.+@.+\..+/.test(v) || '유효한 이메일을 입력해주세요',
  () => emailValid.value !== false || '이미 사용 중인 이메일입니다'
]

const passwordRules = [
  v => !!v || '비밀번호를 입력해주세요',
  v => (v && v.length >= 8) || '비밀번호는 8자리 이상 입력해주세요',
  v => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || '영문 대소문자, 숫자를 포함해주세요'
]

const confirmPasswordRules = [
  v => !!v || '비밀번호 확인을 입력해주세요',
  v => v === formData.value.password || '비밀번호가 일치하지 않습니다'
]

const phoneRules = [
  v => !!v || '휴대전화번호를 입력해주세요',
  v => /^010-\d{4}-\d{4}$/.test(v) || '010-0000-0000 형식으로 입력해주세요'
]

const getUserTypeDescription = () => {
  const descriptions = {
    disabled: '맞춤형 여행 정보와 동행 서비스를 이용하세요',
    companion: '여행 동행을 통해 의미있는 경험을 나누세요',
    general: '배리어프리 여행 정보를 공유하고 소통하세요'
  }
  return descriptions[userType.value] || descriptions.general
}

const getSelectedTypeTitle = () => {
  const titles = {
    disabled: '장애인 여행자',
    companion: '동행 지원자',
    general: '일반 회원'
  }
  return titles[userType.value] || titles.general
}

const getSelectedTypeIcon = () => {
  const icons = {
    disabled: 'mdi-wheelchair-accessibility',
    companion: 'mdi-human-handsup',
    general: 'mdi-account-circle'
  }
  return icons[userType.value] || icons.general
}

const confirmUserTypeChange = () => {
  if (selectedUserType.value !== userType.value) {
    // 회원 유형이 변경된 경우 관련 필드 초기화
    resetTypeSpecificFields()
    userType.value = selectedUserType.value
    
    // URL 쿼리 파라미터도 업데이트
    router.replace({
      name: 'register',
      query: { type: userType.value }
    })
  }
  showUserTypeDialog.value = false
}

const cancelUserTypeChange = () => {
  // 선택을 취소하고 현재 유형으로 되돌림
  selectedUserType.value = userType.value
  showUserTypeDialog.value = false
}

const resetTypeSpecificFields = () => {
  // 회원 유형별 특화 필드들을 초기화
  formData.value.disabilityType = ''
  formData.value.useAssistiveDevice = false
  formData.value.companionNeedLevel = ''
  formData.value.experience = ''
  formData.value.introduction = ''
  formData.value.certificate = null
  
  // 중복 확인 상태도 초기화
  emailValid.value = null
  nicknameValid.value = null
}

// 이메일 중복 확인
const checkEmailAvailability = async () => {
  const email = formData.value.email
  if (!email || !/.+@.+\..+/.test(email)) {
    emailValid.value = null
    return
  }

  emailChecking.value = true
  try {
    const isAvailable = await authStore.checkEmail(email)
    emailValid.value = isAvailable
  } catch (error) {
    console.error('이메일 중복 확인 오류:', error)
    emailValid.value = null
  } finally {
    emailChecking.value = false
  }
}

// 닉네임 중복 확인
const checkNicknameAvailability = async () => {
  const nickname = formData.value.nickname
  if (!nickname || nickname.length < 2 || nickname.length > 20 || !/^[가-힣a-zA-Z0-9_]+$/.test(nickname)) {
    nicknameValid.value = null
    return
  }

  nicknameChecking.value = true
  try {
    const isAvailable = await authStore.checkNickname(nickname)
    nicknameValid.value = isAvailable
  } catch (error) {
    console.error('닉네임 중복 확인 오류:', error)
    nicknameValid.value = null
  } finally {
    nicknameChecking.value = false
  }
}

const register = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  
  try {
    // 회원가입 데이터 준비
    const userData = {
      email: formData.value.email,
      password: formData.value.password,
      user_type: userType.value === 'disabled' ? 'disabled_traveler' : userType.value,
      name: formData.value.name,
      nickname: formData.value.nickname,
      phone: formData.value.phone,
      marketing_consent: agreements.value.marketing
    }

    // 장애인 여행자 추가 정보
    if (userType.value === 'disabled') {
      userData.disability_types = [formData.value.disabilityType]
      userData.support_needs = [formData.value.companionNeedLevel]
      userData.assistive_devices = formData.value.useAssistiveDevice ? ['기타'] : []
      userData.emergency_contacts = []
    }

    // 동행 지원자 추가 정보
    if (userType.value === 'companion') {
      userData.supportable_disabilities = ['전체']
      userData.experience_description = formData.value.experience
      userData.certifications = formData.value.certificate ? ['파일업로드'] : []
      userData.experience_years = 0
    }

    // 회원가입 API 호출
    const result = await authStore.signup(userData)
    
    if (result.success) {
      // 성공 시 로그인 페이지로 이동
      router.push('/login?registered=true')
    } else {
      // 에러 메시지 표시
      console.error('회원가입 실패:', result.error)
      alert(result.error || '회원가입에 실패했습니다.')
    }
  } catch (error) {
    console.error('회원가입 오류:', error)
    alert('회원가입 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  userType.value = route.query.type || 'general'
  selectedUserType.value = userType.value
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-card {
  background-color: #fff;
}

.selected-type {
  background-color: #f8f9ff;
  border-color: #1976D2;
}

.user-type-option {
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-type-option:hover {
  background-color: #f5f5f5;
}

.user-type-option.selected {
  background-color: #e3f2fd;
  border-color: #1976D2;
  border-width: 2px;
}

.reduce-motion .user-type-option {
  transition: none;
}

.reduce-motion .user-type-option:hover {
  background-color: transparent;
}

.high-contrast-card {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff;
}

.high-contrast .register-page {
  background-color: #000;
}

.high-contrast .selected-type {
  background-color: #333 !important;
  border-color: #fff;
}

.high-contrast-option {
  background-color: #222 !important;
  color: #fff !important;
  border-color: #555;
}

.high-contrast-option:hover {
  background-color: #333 !important;
}

.high-contrast-option.selected {
  background-color: #444 !important;
  border-color: #fff !important;
}

@media (max-width: 960px) {
  .register-card {
    padding: 1.5rem !important;
  }
}
</style>