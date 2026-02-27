<template>
  <v-app :class="{ 'high-contrast': accessibilityStore.highContrast }">
    <v-app-bar 
      app 
      color="white" 
      elevation="1"
      role="banner"
    >
      <v-app-bar-title>
        <router-link 
          to="/" 
          class="text-decoration-none text-primary font-weight-bold"
          aria-label="Traveller 홈페이지로 이동"
        >
          Traveller
        </router-link>
      </v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <nav role="navigation" aria-label="메인 네비게이션">
        <v-btn 
          text 
          to="/"
          aria-label="홈페이지"
        >
          홈
        </v-btn>
        <v-btn 
          text 
          to="/destinations"
          aria-label="여행지 정보"
        >
          여행지
        </v-btn>
        <v-btn 
          text 
          to="/matching"
          aria-label="동행 매칭"
        >
          동행 매칭
        </v-btn>
        <v-btn 
          v-if="authStore.isLoggedIn"
          text 
          to="/my-matches"
          aria-label="내 매칭"
        >
          내 매칭
        </v-btn>
        <v-btn 
          text 
          to="/community"
          aria-label="커뮤니티"
        >
          커뮤니티
        </v-btn>
        <v-btn 
          text 
          to="/about"
          aria-label="서비스 소개"
        >
          소개
        </v-btn>
      </nav>
      
      <AccessibilityWidget />
      
      <!-- 알림 벨 -->
      <NotificationBell v-if="authStore.isLoggedIn" />
      
      <!-- 로그인/로그아웃 버튼 -->
      <template v-if="authStore.isLoggedIn">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn 
              v-bind="props"
              variant="outlined" 
              class="ml-2"
              :aria-label="`${authStore.userName}님 메뉴`"
            >
              <v-icon left>mdi-account</v-icon>
              {{ authStore.userName }}님
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile">
              <v-list-item-title>
                <v-icon start size="small">mdi-account</v-icon>
                마이페이지
              </v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="authStore.logout">
              <v-list-item-title>
                <v-icon start size="small">mdi-logout</v-icon>
                로그아웃
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <v-btn 
        v-else
        variant="outlined" 
        to="/login"
        class="ml-2"
        aria-label="로그인"
      >
        로그인
      </v-btn>
    </v-app-bar>

    <v-main role="main">
      <router-view />
    </v-main>
    
    <v-footer 
      app 
      color="grey-lighten-3" 
      class="pa-4"
      role="contentinfo"
    >
      <v-container>
        <v-row>
          <v-col cols="12" md="3">
            <h4 class="font-weight-bold mb-2">Traveller</h4>
            <p class="text-body-2">다른 이들을 위한 여행 플랫폼</p>
          </v-col>
          <v-col cols="12" md="3">
            <h5 class="font-weight-bold mb-2">서비스</h5>
            <v-list density="compact" class="bg-transparent">
              <v-list-item to="/destinations">여행지 정보</v-list-item>
              <v-list-item to="/matching">동행 매칭</v-list-item>
              <v-list-item to="/community">커뮤니티</v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="3">
            <h5 class="font-weight-bold mb-2">지원</h5>
            <v-list density="compact" class="bg-transparent">
              <v-list-item to="/help">도움말</v-list-item>
              <v-list-item to="/accessibility">접근성 정책</v-list-item>
              <v-list-item to="/contact">문의하기</v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="3">
            <h5 class="font-weight-bold mb-2">약관</h5>
            <v-list density="compact" class="bg-transparent">
              <v-list-item to="/terms">이용약관</v-list-item>
              <v-list-item to="/privacy">개인정보처리방침</v-list-item>
            </v-list>
          </v-col>
        </v-row>
        <v-divider class="my-4"></v-divider>
        <v-row>
          <v-col cols="12" class="text-center">
            <p class="text-body-2">© 2024 Traveller. All rights reserved.</p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'
import { useAuthStore } from '@/stores/auth'
import AccessibilityWidget from '@/components/common/AccessibilityWidget.vue'
import NotificationBell from '@/components/notification/NotificationBell.vue'

const accessibilityStore = useAccessibilityStore()
const authStore = useAuthStore()

onMounted(async () => {
  accessibilityStore.loadSettings()
  // 앱 시작 시 인증 상태 확인
  await authStore.initAuth()
})
</script>

<style>
.high-contrast {
  filter: contrast(150%) brightness(120%);
}

.high-contrast .v-app-bar {
  background-color: #000 !important;
  color: #fff !important;
}

.high-contrast .v-footer {
  background-color: #000 !important;
  color: #fff !important;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>