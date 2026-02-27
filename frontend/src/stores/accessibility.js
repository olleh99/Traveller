import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAccessibilityStore = defineStore('accessibility', () => {
  const fontSize = ref('normal')
  const highContrast = ref(false)
  const reduceMotion = ref(false)
  const screenReaderMode = ref(false)

  const fontSizeClass = computed(() => {
    const sizes = {
      'small': 'text-sm',
      'normal': 'text-base',
      'large': 'text-lg',
      'x-large': 'text-xl'
    }
    return sizes[fontSize.value] || 'text-base'
  })

  function setFontSize(size) {
    fontSize.value = size
    localStorage.setItem('a11y-font-size', size)
  }

  function toggleHighContrast() {
    highContrast.value = !highContrast.value
    localStorage.setItem('a11y-high-contrast', highContrast.value)
    document.body.classList.toggle('high-contrast', highContrast.value)
  }

  function toggleReduceMotion() {
    reduceMotion.value = !reduceMotion.value
    localStorage.setItem('a11y-reduce-motion', reduceMotion.value)
  }

  function toggleScreenReaderMode() {
    screenReaderMode.value = !screenReaderMode.value
    localStorage.setItem('a11y-screen-reader', screenReaderMode.value)
  }

  function loadSettings() {
    fontSize.value = localStorage.getItem('a11y-font-size') || 'normal'
    highContrast.value = localStorage.getItem('a11y-high-contrast') === 'true'
    reduceMotion.value = localStorage.getItem('a11y-reduce-motion') === 'true'
    screenReaderMode.value = localStorage.getItem('a11y-screen-reader') === 'true'
    
    if (highContrast.value) {
      document.body.classList.add('high-contrast')
    }
  }

  return {
    fontSize,
    highContrast,
    reduceMotion,
    screenReaderMode,
    fontSizeClass,
    setFontSize,
    toggleHighContrast,
    toggleReduceMotion,
    toggleScreenReaderMode,
    loadSettings
  }
})