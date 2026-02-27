<template>
  <section class="statistics-section py-12" aria-labelledby="statistics-title">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center mb-8">
          <h2 
            id="statistics-title"
            class="text-h3 font-weight-bold mb-4"
            :class="accessibilityStore.fontSizeClass"
          >
            숫자로 보는 Traveller
          </h2>
          <p 
            class="text-h6 text-grey-darken-1"
            :class="accessibilityStore.fontSizeClass"
          >
            함께 만들어가는 배리어프리 여행 문화
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="stat in statistics"
          :key="stat.id"
          cols="6"
          md="3"
          class="text-center"
        >
          <v-card
            class="stat-card pa-6"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="0"
            variant="tonal"
            :color="stat.color"
          >
            <v-icon
              :icon="stat.icon"
              size="48"
              class="mb-3"
              :color="stat.color"
              :aria-hidden="true"
            ></v-icon>
            
            <div 
              class="text-h3 font-weight-bold mb-2"
              :class="[accessibilityStore.fontSizeClass, { 'counter-animation': !accessibilityStore.reduceMotion }]"
              :aria-label="`${stat.label}: ${stat.value}${stat.suffix}`"
            >
              <span v-if="isVisible && !accessibilityStore.reduceMotion">
                {{ animatedValue(stat) }}{{ stat.suffix }}
              </span>
              <span v-else>
                {{ stat.value }}{{ stat.suffix }}
              </span>
            </div>
            
            <p 
              class="text-body-1"
              :class="accessibilityStore.fontSizeClass"
            >
              {{ stat.label }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAccessibilityStore } from '@/stores/accessibility'

const accessibilityStore = useAccessibilityStore()

const statistics = ref([
  {
    id: 1,
    icon: 'mdi-map-marker-multiple',
    color: 'primary',
    value: 3847,
    suffix: '곳',
    label: '등록된 배리어프리 여행지',
    animatedValue: 0
  },
  {
    id: 2,
    icon: 'mdi-account-multiple',
    color: 'secondary',
    value: 1256,
    suffix: '명',
    label: '활동 중인 동행 지원자',
    animatedValue: 0
  },
  {
    id: 3,
    icon: 'mdi-handshake',
    color: 'success',
    value: 8923,
    suffix: '건',
    label: '성공적인 매칭',
    animatedValue: 0
  },
  {
    id: 4,
    icon: 'mdi-account-group',
    color: 'info',
    value: 15420,
    suffix: '명',
    label: '커뮤니티 회원',
    animatedValue: 0
  }
])

const isVisible = ref(false)
let observer = null

const animatedValue = (stat) => {
  return Math.floor(stat.animatedValue)
}

const animateNumbers = () => {
  statistics.value.forEach(stat => {
    const duration = 2000
    const increment = stat.value / (duration / 16)
    const interval = setInterval(() => {
      if (stat.animatedValue < stat.value) {
        stat.animatedValue = Math.min(stat.animatedValue + increment, stat.value)
      } else {
        clearInterval(interval)
      }
    }, 16)
  })
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isVisible.value) {
          isVisible.value = true
          if (!accessibilityStore.reduceMotion) {
            animateNumbers()
          }
        }
      })
    },
    { threshold: 0.5 }
  )

  const section = document.querySelector('.statistics-section')
  if (section) {
    observer.observe(section)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.statistics-section {
  background-color: #f5f5f5;
}

.stat-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: scale(1.05);
}

.reduce-motion .stat-card {
  transition: none;
}

.reduce-motion .stat-card:hover {
  transform: none;
}

.counter-animation {
  transition: all 0.3s ease;
}

.high-contrast-card {
  border: 2px solid currentColor;
}

.high-contrast .statistics-section {
  background-color: #000;
}

@media (max-width: 600px) {
  .stat-card {
    padding: 1rem !important;
    margin-bottom: 0.5rem;
  }
  
  .v-icon {
    font-size: 36px !important;
  }
}
</style>