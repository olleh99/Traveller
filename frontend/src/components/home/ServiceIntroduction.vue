<template>
  <section class="service-section py-12" aria-labelledby="service-title">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center mb-8">
          <h2 
            id="service-title" 
            class="text-h3 font-weight-bold mb-4"
            :class="accessibilityStore.fontSizeClass"
          >
            Traveller가 제공하는 서비스
          </h2>
          <p 
            class="text-h6 text-grey-darken-1"
            :class="accessibilityStore.fontSizeClass"
          >
            장애인 여행을 위한 모든 것을 한 곳에서
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col 
          v-for="service in services" 
          :key="service.id"
          cols="12" 
          md="4"
        >
          <v-card
            class="service-card h-100"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="2"
            :ripple="!accessibilityStore.reduceMotion"
          >
            <v-card-text class="text-center pa-8">
              <v-icon 
                :icon="service.icon" 
                size="64" 
                :color="service.color"
                class="mb-4"
                :aria-hidden="true"
              ></v-icon>
              
              <h3 
                class="text-h5 font-weight-bold mb-3"
                :class="accessibilityStore.fontSizeClass"
              >
                {{ service.title }}
              </h3>
              
              <p 
                class="text-body-1 mb-4"
                :class="accessibilityStore.fontSizeClass"
              >
                {{ service.description }}
              </p>
              
              <v-list density="compact" class="text-left">
                <v-list-item 
                  v-for="(feature, index) in service.features" 
                  :key="index"
                  :prepend-icon="'mdi-check-circle'"
                  :title="feature"
                  class="px-0"
                >
                </v-list-item>
              </v-list>

              <v-btn
                :color="service.color"
                variant="tonal"
                class="mt-4"
                :to="service.link"
                :aria-label="`${service.title} 자세히 보기`"
              >
                자세히 보기
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'

const accessibilityStore = useAccessibilityStore()

const services = ref([
  {
    id: 1,
    icon: 'mdi-wheelchair-accessibility',
    color: 'primary',
    title: '배리어프리 여행 정보',
    description: '검증된 접근성 정보와 실시간 업데이트로 안전한 여행을 계획하세요',
    features: [
      '휠체어 접근 가능 시설',
      '점자 안내 서비스',
      '장애인 전용 주차장',
      '접근성 등급 평가'
    ],
    link: '/barrier-free-info'
  },
  {
    id: 2,
    icon: 'mdi-account-group',
    color: 'secondary',
    title: 'AI 동행 매칭',
    description: '4단계 AI 매칭 시스템으로 나에게 맞는 동행을 찾아보세요',
    features: [
      '성향 기반 매칭',
      '안전 검증 시스템',
      '실시간 채팅',
      '평가 및 리뷰'
    ],
    link: '/companion-matching'
  },
  {
    id: 3,
    icon: 'mdi-forum',
    color: 'accent',
    title: '여행 커뮤니티',
    description: '다른 여행자들과 경험을 나누고 유용한 정보를 공유하세요',
    features: [
      '여행 후기 공유',
      '실시간 정보 교류',
      '전문가 상담',
      '지역별 모임'
    ],
    link: '/community'
  }
])
</script>

<style scoped>
.service-section {
  background-color: #f5f5f5;
}

.service-card {
  transition: all 0.3s ease;
  height: 100%;
}

.service-card:hover {
  transform: translateY(-5px);
}

.reduce-motion .service-card {
  transition: none;
}

.reduce-motion .service-card:hover {
  transform: none;
}

.high-contrast-card {
  border: 2px solid currentColor;
}

.high-contrast .service-section {
  background-color: #000;
}

@media (max-width: 960px) {
  .service-card {
    margin-bottom: 1rem;
  }
}
</style>