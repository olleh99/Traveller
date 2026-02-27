import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

import '@mdi/font/css/materialdesignicons.css'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// 앱 마운트 후 인증 상태 초기화
app.mount('#app')

// 인증 상태 초기화 (토큰이 있으면 사용자 정보 가져오기)
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initAuth()