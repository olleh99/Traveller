<template>
  <section class="cta-section py-12" aria-labelledby="cta-title">
    <v-container>
      <v-card
        class="cta-card"
        :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
        color="primary"
        dark
        elevation="8"
      >
        <v-card-text class="pa-8 text-center">
          <h2 
            id="cta-title"
            class="text-h3 font-weight-bold mb-4"
            :class="accessibilityStore.fontSizeClass"
          >
            지금 가입하고 첫 여행을 계획해보세요
          </h2>
          
          <p 
            class="text-h6 mb-8"
            :class="accessibilityStore.fontSizeClass"
          >
            나에게 맞는 회원 유형을 선택하고 Traveller와 함께하세요
          </p>

          <v-row justify="center">
            <v-col
              v-for="userType in userTypes"
              :key="userType.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                class="user-type-card"
                :class="{ 'high-contrast-inner-card': accessibilityStore.highContrast }"
                elevation="0"
                @click="selectUserType(userType)"
                :ripple="!accessibilityStore.reduceMotion"
                tabindex="0"
                @keypress.enter="selectUserType(userType)"
                :aria-label="`${userType.title}로 가입하기`"
                role="button"
              >
                <v-card-text class="pa-6 text-center">
                  <v-icon
                    :icon="userType.icon"
                    size="64"
                    class="mb-4"
                    :aria-hidden="true"
                  ></v-icon>
                  
                  <h3 
                    class="text-h5 font-weight-bold mb-2"
                    :class="accessibilityStore.fontSizeClass"
                  >
                    {{ userType.title }}
                  </h3>
                  
                  <p 
                    class="text-body-1"
                    :class="accessibilityStore.fontSizeClass"
                  >
                    {{ userType.description }}
                  </p>
                  
                  <v-btn
                    class="mt-4"
                    color="white"
                    variant="outlined"
                    size="large"
                    block
                    :aria-label="`${userType.title}로 가입하기`"
                  >
                    {{ userType.buttonText }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-8" color="white" opacity="0.3"></v-divider>

          <p class="text-body-1 mb-0" :class="accessibilityStore.fontSizeClass">
            이미 회원이신가요? 
            <v-btn
              variant="text"
              color="white"
              to="/login"
              class="text-decoration-underline"
            >
              로그인하기
            </v-btn>
          </p>
        </v-card-text>
      </v-card>
    </v-container>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccessibilityStore } from '@/stores/accessibility'

const router = useRouter()
const accessibilityStore = useAccessibilityStore()

const userTypes = ref([
  {
    id: 1,
    type: 'disabled',
    icon: 'mdi-wheelchair-accessibility',
    title: '장애인 여행자',
    description: '맞춤형 여행 정보와 동행 서비스를 이용하세요',
    buttonText: '여행자로 가입'
  },
  {
    id: 2,
    type: 'companion',
    icon: 'mdi-human-handsup',
    title: '동행 지원자',
    description: '여행 동행을 통해 의미있는 경험을 나누세요',
    buttonText: '지원자로 가입'
  },
  {
    id: 3,
    type: 'general',
    icon: 'mdi-account-circle',
    title: '일반 회원',
    description: '배리어프리 여행 정보를 공유하고 소통하세요',
    buttonText: '일반회원 가입'
  }
])

const selectUserType = (userType) => {
  router.push({
    name: 'register',
    query: { type: userType.type }
  })
}
</script>

<style scoped>
.cta-section {
  background-color: #f5f5f5;
}

.cta-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
}

.user-type-card {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-type-card:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.user-type-card:focus {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.reduce-motion .user-type-card {
  transition: none;
}

.reduce-motion .user-type-card:hover {
  transform: none;
}

.high-contrast-card {
  background: #000 !important;
  border: 2px solid #fff;
}

.high-contrast-inner-card {
  background-color: #222 !important;
  border: 2px solid #fff;
}

@media (max-width: 960px) {
  .cta-card {
    padding: 2rem !important;
  }
  
  .user-type-card {
    margin-bottom: 1rem;
  }
}
</style>