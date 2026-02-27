<template>
  <section 
    class="hero-section" 
    :class="{ 'reduce-motion': accessibilityStore.reduceMotion }"
    aria-labelledby="hero-title"
  >
    <v-parallax
      :src="heroImage"
      height="600"
      cover
    >
      <div class="hero-overlay">
        <v-container>
          <v-row align="center" justify="center" class="fill-height">
            <v-col cols="12" md="8" class="text-center">
              <h1 
                id="hero-title" 
                class="text-h2 text-md-h1 font-weight-bold mb-4"
                :class="accessibilityStore.fontSizeClass"
              >
                모두를 위한 여행, 함께하는 여행
              </h1>
              <p 
                class="text-h6 text-md-h5 mb-6"
                :class="accessibilityStore.fontSizeClass"
              >
                장애인 맞춤형 여행 정보와 믿을 수 있는 동행 서비스
              </p>
              
              <div class="hero-buttons">
                <v-btn
                  color="primary"
                  size="x-large"
                  rounded="pill"
                  class="mr-4 mb-4"
                  @click="$router.push('/travel-search')"
                  prepend-icon="mdi-magnify"
                >
                  여행 시작하기
                </v-btn>
                <v-btn
                  color="secondary"
                  size="x-large"
                  rounded="pill"
                  variant="outlined"
                  class="mb-4"
                  @click="$router.push('/companion-matching')"
                  prepend-icon="mdi-account-group"
                >
                  동행 찾기
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-parallax>

    <a href="#main-content" class="skip-link">메인 콘텐츠로 건너뛰기</a>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'

const accessibilityStore = useAccessibilityStore()

const heroImage = ref('/images/hero-background.jpg')
</script>

<style scoped>
.hero-section {
  position: relative;
}

.hero-overlay {
  background-color: rgba(0, 0, 0, 0.4);
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}

.reduce-motion .v-parallax {
  position: relative !important;
}

.reduce-motion .v-parallax__image-container {
  position: relative !important;
  transform: none !important;
}

@media (max-width: 960px) {
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
}

.high-contrast .hero-overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.high-contrast .v-btn--variant-outlined {
  border-width: 2px;
}
</style>