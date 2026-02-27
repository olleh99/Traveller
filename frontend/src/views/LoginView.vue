<template>
  <div class="login-page">
    <v-container class="py-12">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card
            class="login-card pa-8"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="4"
          >
            <div class="text-center mb-8">
              <v-icon 
                icon="mdi-account-circle" 
                size="64" 
                color="primary" 
                class="mb-4"
              ></v-icon>
              <h1 
                class="text-h3 font-weight-bold mb-4"
                :class="accessibilityStore.fontSizeClass"
              >
                로그인
              </h1>
              <p 
                class="text-h6 text-grey-darken-1"
                :class="accessibilityStore.fontSizeClass"
              >
                Traveller에 오신 것을 환영합니다
              </p>
            </div>

            <!-- 회원가입 완료 알림 -->
            <v-alert
              v-if="showRegisteredAlert"
              type="success"
              variant="tonal"
              class="mb-6"
              closable
              @click:close="showRegisteredAlert = false"
            >
              <template v-slot:title>회원가입이 완료되었습니다!</template>
              등록하신 이메일과 비밀번호로 로그인해주세요.
            </v-alert>

            <v-form ref="form" v-model="valid" @submit.prevent="login">
              <v-text-field
                v-model="formData.email"
                label="이메일"
                type="email"
                :rules="emailRules"
                required
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-4"
              ></v-text-field>

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
                class="mb-4"
              ></v-text-field>

              <div class="d-flex justify-space-between align-center mb-6">
                <v-checkbox
                  v-model="formData.rememberMe"
                  label="로그인 상태 유지"
                  hide-details
                  density="compact"
                ></v-checkbox>

                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
                  @click="forgotPassword"
                >
                  비밀번호 찾기
                </v-btn>
              </div>

              <v-btn
                type="submit"
                color="primary"
                size="x-large"
                block
                :loading="loading"
                :disabled="!valid"
                class="mb-6"
              >
                로그인
              </v-btn>

              <v-divider class="mb-6">
                <span class="text-caption text-grey px-4">또는</span>
              </v-divider>

              <!-- 소셜 로그인 (향후 구현) -->
              <div class="social-login mb-6">
                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  class="mb-3"
                  prepend-icon="mdi-google"
                  disabled
                >
                  Google로 로그인 (준비중)
                </v-btn>
                
                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  prepend-icon="mdi-chat"
                  disabled
                >
                  카카오로 로그인 (준비중)
                </v-btn>
              </div>

              <div class="text-center">
                <p class="text-body-2 mb-2">
                  아직 계정이 없으신가요?
                </p>
                <v-btn
                  variant="text"
                  color="primary"
                  to="/signup"
                  append-icon="mdi-arrow-right"
                >
                  회원가입하기
                </v-btn>
              </div>
            </v-form>
          </v-card>

          <!-- 접근성 안내 -->
          <v-card
            class="mt-6 pa-4"
            variant="outlined"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
          >
            <div class="d-flex align-center">
              <v-icon icon="mdi-wheelchair-accessibility" class="mr-3" color="primary"></v-icon>
              <div>
                <h3 class="text-h6 font-weight-bold">접근성 기능</h3>
                <p class="text-body-2 mb-0">
                  화면 상단의 접근성 위젯에서 폰트 크기, 고대비 모드 등을 설정할 수 있습니다.
                </p>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="errorSnackbar"
      :timeout="4000"
      color="error"
      top
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="errorSnackbar = false"
        >
          닫기
        </v-btn>
      </template>
    </v-snackbar>
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
const showRegisteredAlert = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')

const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const emailRules = [
  v => !!v || '이메일을 입력해주세요',
  v => /.+@.+\..+/.test(v) || '유효한 이메일을 입력해주세요'
]

const passwordRules = [
  v => !!v || '비밀번호를 입력해주세요'
]

const login = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  
  try {
    // 실제 로그인 API 호출
    const result = await authStore.login({
      email: formData.value.email,
      password: formData.value.password
    })
    
    if (result.success) {
      // 로그인 성공 후 리다이렉트 처리
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      // 에러 메시지 표시
      showError(result.error || '로그인에 실패했습니다.')
    }
  } catch (error) {
    showError('로그인 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const forgotPassword = () => {
  // TODO: 비밀번호 찾기 기능 구현
  // TODO: 비밀번호 찾기 기능 구현
}

const showError = (message) => {
  errorMessage.value = message
  errorSnackbar.value = true
}

onMounted(() => {
  // 회원가입 완료 후 리다이렉트된 경우
  if (route.query.registered === 'true') {
    showRegisteredAlert.value = true
  }
  
  // 인증이 필요한 페이지에서 리다이렉트된 경우
  if (route.query.redirect) {
    showError('로그인이 필요한 페이지입니다.')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
}

.login-card {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.social-login .v-btn {
  text-transform: none;
}

.high-contrast-card {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff;
}

.high-contrast .login-page {
  background: #000;
}

.high-contrast .login-card {
  background-color: #000 !important;
}

@media (max-width: 600px) {
  .login-card {
    padding: 1.5rem !important;
  }
  
  .login-page {
    padding: 1rem 0;
  }
}

@media (max-height: 700px) {
  .login-page {
    align-items: flex-start;
    padding: 2rem 0;
  }
}
</style>