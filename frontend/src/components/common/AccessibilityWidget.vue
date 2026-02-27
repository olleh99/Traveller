<template>
  <v-menu
    :close-on-content-click="false"
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        aria-label="접근성 설정"
      >
        <v-icon>mdi-human</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300">
      <v-card-title>
        <h3 class="text-h6">접근성 설정</h3>
      </v-card-title>
      
      <v-divider></v-divider>

      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-title>글자 크기</v-list-item-title>
            <v-list-item-subtitle>
              <v-btn-toggle
                :model-value="accessibilityStore.fontSize"
                @update:model-value="accessibilityStore.setFontSize"
                mandatory
                density="compact"
              >
                <v-btn value="small" size="small">
                  <span class="text-caption">가</span>
                </v-btn>
                <v-btn value="normal" size="small">
                  <span>가</span>
                </v-btn>
                <v-btn value="large" size="small">
                  <span class="text-h6">가</span>
                </v-btn>
                <v-btn value="x-large" size="small">
                  <span class="text-h5">가</span>
                </v-btn>
              </v-btn-toggle>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-switch
              :model-value="accessibilityStore.highContrast"
              @update:model-value="accessibilityStore.toggleHighContrast"
              label="고대비 모드"
              hide-details
              density="compact"
            ></v-switch>
          </v-list-item>

          <v-list-item>
            <v-switch
              :model-value="accessibilityStore.reduceMotion"
              @update:model-value="accessibilityStore.toggleReduceMotion"
              label="애니메이션 줄이기"
              hide-details
              density="compact"
            ></v-switch>
          </v-list-item>

          <v-list-item>
            <v-switch
              :model-value="accessibilityStore.screenReaderMode"
              @update:model-value="accessibilityStore.toggleScreenReaderMode"
              label="스크린리더 모드"
              hide-details
              density="compact"
            ></v-switch>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup>
import { useAccessibilityStore } from '@/stores/accessibility'

const accessibilityStore = useAccessibilityStore()
</script>