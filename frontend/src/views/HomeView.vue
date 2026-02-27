<template>
  <div class="home-page">
    <!-- Skip to main content link for screen readers -->
    <a href="#main-content" class="sr-only">메인 콘텐츠로 건너뛰기</a>
    
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Main Content -->
    <main id="main-content">
      <!-- Service Introduction -->
      <ServiceIntroduction />
      
      <!-- Recommended Destinations -->
      <RecommendedDestinations />
      
      <!-- Statistics -->
      <Statistics />
      
      <!-- CTA Banner (로그인하지 않은 사용자에게만 표시) -->
      <CTABanner v-if="!authStore.isLoggedIn" />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'
import { useAuthStore } from '@/stores/auth'
import HeroSection from '@/components/home/HeroSection.vue'
import ServiceIntroduction from '@/components/home/ServiceIntroduction.vue'
import RecommendedDestinations from '@/components/home/RecommendedDestinations.vue'
import Statistics from '@/components/home/Statistics.vue'
import CTABanner from '@/components/home/CTABanner.vue'

const accessibilityStore = useAccessibilityStore()
const authStore = useAuthStore()

onMounted(() => {
  accessibilityStore.loadSettings()
})
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only:focus {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
  padding: 0.5rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
  background-color: #000;
  color: #fff;
  z-index: 9999;
}
</style>