<template>
  <div class="signup-page">
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="text-center mb-8">
            <h1 
              class="text-h2 font-weight-bold mb-4"
              :class="accessibilityStore.fontSizeClass"
            >
              Traveller와 함께하세요
            </h1>
            <p 
              class="text-h5 text-grey-darken-1"
              :class="accessibilityStore.fontSizeClass"
            >
              회원 유형을 선택하고 여행을 시작해보세요
            </p>
          </div>

          <v-row>
            <v-col
              v-for="userType in userTypes"
              :key="userType.id"
              cols="12"
              md="4"
            >
              <v-card
                class="user-type-card h-100"
                :class="{ 
                  'high-contrast-card': accessibilityStore.highContrast,
                  'selected': hoveredCard === userType.id 
                }"
                elevation="2"
                @click="selectUserType(userType)"
                @mouseenter="hoveredCard = userType.id"
                @mouseleave="hoveredCard = null"
                @focus="hoveredCard = userType.id"
                @blur="hoveredCard = null"
                :ripple="!accessibilityStore.reduceMotion"
                tabindex="0"
                @keypress.enter="selectUserType(userType)"
                :aria-label="`${userType.title}로 가입하기`"
                role="button"
              >
                <v-card-text class="pa-8 text-center">
                  <v-avatar
                    size="120"
                    :color="userType.color"
                    class="mb-6"
                  >
                    <v-icon
                      :icon="userType.icon"
                      size="64"
                      color="white"
                    ></v-icon>
                  </v-avatar>
                  
                  <h2 
                    class="text-h4 font-weight-bold mb-4"
                    :class="accessibilityStore.fontSizeClass"
                  >
                    {{ userType.title }}
                  </h2>
                  
                  <p 
                    class="text-body-1 mb-6"
                    :class="accessibilityStore.fontSizeClass"
                  >
                    {{ userType.description }}
                  </p>

                  <v-divider class="mb-6"></v-divider>

                  <h3 class="text-h6 font-weight-bold mb-4">주요 혜택</h3>
                  <v-list density="compact" class="transparent">
                    <v-list-item
                      v-for="(benefit, index) in userType.benefits"
                      :key="index"
                      class="px-0"
                    >
                      <template v-slot:prepend>
                        <v-icon icon="mdi-check-circle" color="success" size="20"></v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">
                        {{ benefit }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                  
                  <v-btn
                    :color="userType.color"
                    size="large"
                    variant="flat"
                    block
                    class="mt-6"
                    :aria-label="`${userType.title}로 가입하기`"
                  >
                    {{ userType.buttonText }}
                    <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-12"></v-divider>

          <div class="text-center">
            <h2 class="text-h5 font-weight-bold mb-6">
              왜 Traveller인가요?
            </h2>
            <v-row>
              <v-col
                v-for="feature in features"
                :key="feature.id"
                cols="12"
                sm="6"
                md="3"
              >
                <div class="feature-item">
                  <v-icon
                    :icon="feature.icon"
                    size="48"
                    color="primary"
                    class="mb-3"
                  ></v-icon>
                  <h3 class="text-h6 font-weight-bold mb-2">
                    {{ feature.title }}
                  </h3>
                  <p class="text-body-2 text-grey-darken-1">
                    {{ feature.description }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-8"></v-divider>

          <div class="text-center">
            <p class="text-body-1 mb-0">
              이미 회원이신가요? 
              <v-btn
                variant="text"
                color="primary"
                to="/login"
                class="text-decoration-underline"
              >
                로그인하기
              </v-btn>
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccessibilityStore } from '@/stores/accessibility'

const router = useRouter()
const accessibilityStore = useAccessibilityStore()

const hoveredCard = ref(null)

const userTypes = ref([
  {
    id: 1,
    type: 'disabled',
    icon: 'mdi-wheelchair-accessibility',
    color: 'primary',
    title: '장애인 여행자',
    description: '맞춤형 여행 정보와 동행 서비스를 이용하세요',
    buttonText: '여행자로 가입',
    benefits: [
      '접근성 검증된 여행지 정보',
      'AI 기반 맞춤 여행 추천',
      '신뢰할 수 있는 동행 매칭',
      '24시간 긴급 지원 서비스'
    ]
  },
  {
    id: 2,
    type: 'companion',
    icon: 'mdi-human-handsup',
    color: 'secondary',
    title: '동행 지원자',
    description: '여행 동행을 통해 의미있는 경험을 나누세요',
    buttonText: '지원자로 가입',
    benefits: [
      '전문 동행 교육 프로그램',
      '활동 수당 지급',
      '봉사시간 인증',
      '커리어 개발 지원'
    ]
  },
  {
    id: 3,
    type: 'general',
    icon: 'mdi-account-circle',
    color: 'accent',
    title: '일반 회원',
    description: '배리어프리 여행 정보를 공유하고 소통하세요',
    buttonText: '일반회원 가입',
    benefits: [
      '배리어프리 여행 정보 공유',
      '커뮤니티 활동 참여',
      '여행 팁과 노하우 공유',
      '이벤트 및 혜택 제공'
    ]
  }
])

const features = ref([
  {
    id: 1,
    icon: 'mdi-shield-check',
    title: '안전한 매칭',
    description: '검증된 동행자와 안전한 여행'
  },
  {
    id: 2,
    icon: 'mdi-map-search',
    title: '접근성 정보',
    description: '실시간 업데이트되는 배리어프리 정보'
  },
  {
    id: 3,
    icon: 'mdi-account-group',
    title: '커뮤니티',
    description: '함께 만들어가는 여행 문화'
  },
  {
    id: 4,
    icon: 'mdi-headset',
    title: '24시간 지원',
    description: '언제든 도움받을 수 있는 고객센터'
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
.signup-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-type-card {
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  border: 2px solid transparent;
}

.user-type-card:hover,
.user-type-card.selected {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border-color: var(--v-primary-base);
}

.user-type-card:focus {
  outline: 3px solid var(--v-primary-base);
  outline-offset: 2px;
}

.reduce-motion .user-type-card {
  transition: none;
}

.reduce-motion .user-type-card:hover,
.reduce-motion .user-type-card.selected {
  transform: none;
}

.feature-item {
  padding: 1.5rem;
}

.high-contrast-card {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff;
}

.high-contrast-card:hover,
.high-contrast-card.selected {
  border-color: #ff0 !important;
  box-shadow: 0 0 0 3px #ff0;
}

.high-contrast .signup-page {
  background-color: #000;
}

.v-avatar {
  transition: transform 0.3s ease;
}

.user-type-card:hover .v-avatar {
  transform: scale(1.1);
}

.reduce-motion .v-avatar {
  transition: none;
}

.reduce-motion .user-type-card:hover .v-avatar {
  transform: none;
}

@media (max-width: 960px) {
  .user-type-card {
    margin-bottom: 1.5rem;
  }
  
  .user-type-card:hover {
    transform: translateY(-5px);
  }
}

@media (max-width: 600px) {
  .user-type-card .v-card-text {
    padding: 2rem !important;
  }
  
  .v-avatar {
    width: 80px !important;
    height: 80px !important;
  }
  
  .v-avatar .v-icon {
    font-size: 48px !important;
  }
}
</style>