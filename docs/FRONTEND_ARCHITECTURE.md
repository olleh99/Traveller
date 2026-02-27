# Frontend 아키텍처 상세 문서

## 개요
Traveller 프론트엔드는 Vue.js 3 Composition API와 Vuetify 3를 기반으로 한 SPA(Single Page Application)입니다. 모던 웹 개발 패턴을 적용하여 반응형 UI와 실시간 통신을 지원합니다.

## 기술 스택 상세

### Core Technologies
- **Vue.js 3.3+**: Composition API, Teleport, Fragments 지원
- **Vuetify 3.4+**: Material Design 3 기반 UI 컴포넌트 라이브러리
- **Vite 4.4+**: 고속 개발 서버 및 빌드 도구
- **Pinia 2.1+**: Vue 3 공식 상태 관리 라이브러리

### Supporting Libraries
- **Vue Router 4**: 클라이언트 사이드 라우팅
- **Axios 1.5+**: HTTP 클라이언트
- **Socket.io-client 4.7+**: 실시간 통신
- **Vuelidate 2**: 폼 검증
- **date-fns**: 날짜 처리 유틸리티

## 프로젝트 구조

```
frontend/src/
├── api/                 # API 통신 레이어
│   ├── index.js        # Axios 인스턴스 및 인터셉터
│   ├── auth.js         # 인증 API
│   ├── user.js         # 사용자 API
│   ├── travelPlan.js   # 여행 계획 API
│   ├── destination.js  # 여행지 API
│   ├── matching.js     # 매칭 API
│   ├── messages.js     # 메시징 API
│   ├── review.js       # 리뷰 API
│   └── favorites.js    # 즐겨찾기 API
├── components/         # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── home/          # 홈페이지 컴포넌트
│   ├── travel/        # 여행 관련 컴포넌트
│   ├── review/        # 리뷰 컴포넌트
│   ├── profile/       # 프로필 컴포넌트
│   ├── matching/      # 매칭 컴포넌트
│   ├── notification/  # 알림 컴포넌트
│   └── map/          # 지도 컴포넌트
├── router/            # 라우팅 설정
├── services/          # 비즈니스 로직 서비스
├── stores/            # Pinia 상태 관리
├── views/             # 페이지 컴포넌트
├── plugins/           # Vue 플러그인
├── assets/            # 정적 자원
├── styles/            # 글로벌 스타일
└── utils/             # 유틸리티 함수
```

## API 레이어 (`/src/api/`)

### 기본 설정 (index.js)

```javascript
class ApiService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';
    this.timeout = 10000;
    this.setupAxiosInstance();
    this.setupInterceptors();
  }

  setupAxiosInstance() {
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  setupInterceptors() {
    // 요청 인터셉터 - 토큰 자동 첨부
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - 자동 데이터 추출 및 에러 처리
    this.axios.interceptors.response.use(
      (response) => response.data, // response.data 자동 반환
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }
}
```

### API 모듈 예시 (auth.js)

```javascript
import api from './index';

export const authApi = {
  // 회원가입
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  // 로그인
  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  // 토큰 갱신
  async refreshToken() {
    return api.post('/auth/refresh');
  },

  // 로그아웃
  async logout() {
    return api.post('/auth/logout');
  },

  // 이메일 중복 확인
  async checkEmailDuplicate(email) {
    return api.post('/auth/check-email', { email });
  }
};
```

### 메시징 API (messages.js)

```javascript
export const messagesApi = {
  // 메시지 목록 조회
  async getMessages(matchId, params = {}) {
    return api.get(`/messages/${matchId}`, { params });
  },

  // 메시지 전송
  async sendMessage(matchId, messageData) {
    return api.post(`/messages/${matchId}`, messageData);
  },

  // 메시지 삭제
  async deleteMessage(messageId) {
    return api.delete(`/messages/${messageId}`);
  },

  // 읽지 않은 메시지 개수
  async getUnreadCount(matchId) {
    return api.get(`/messages/${matchId}/unread-count`);
  },

  // 모든 매칭의 읽지 않은 메시지 개수
  async getAllUnreadCounts() {
    return api.get('/messages/all/unread-counts');
  },

  // 메시지 검색
  async searchMessages(matchId, query, params = {}) {
    return api.get(`/messages/${matchId}/search`, { 
      params: { query, ...params } 
    });
  }
};
```

## 상태 관리 (`/src/stores/`)

### Auth Store (auth.js)

```javascript
export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token'));
  const user = ref(null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || 'user');

  // Actions
  async function login(credentials) {
    try {
      isLoading.value = true;
      const response = await authApi.login(credentials);
      
      token.value = response.token;
      user.value = response.user;
      
      localStorage.setItem('token', response.token);
      
      // Socket 연결 초기화
      if (response.token) {
        const socketService = useSocketService();
        socketService.connect(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      
      // Socket 연결 해제
      const socketService = useSocketService();
      socketService.disconnect();
    }
  }

  async function refreshToken() {
    try {
      const response = await authApi.refreshToken();
      token.value = response.token;
      localStorage.setItem('token', response.token);
      return response.token;
    } catch (error) {
      await logout();
      throw error;
    }
  }

  async function fetchUser() {
    if (!token.value) return;
    
    try {
      const userData = await userApi.getProfile();
      user.value = userData;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      if (error.response?.status === 401) {
        await logout();
      }
    }
  }

  return {
    // State
    token,
    user,
    isLoading,
    
    // Getters
    isAuthenticated,
    userRole,
    
    // Actions
    login,
    logout,
    refreshToken,
    fetchUser
  };
});
```

### Notification Store (notification.js)

```javascript
export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const notificationSettings = ref({
    matching_request: true,
    matching_accepted: true,
    matching_rejected: true,
    new_message: true,
    review_like: true,
    plan_shared: true,
    destination_update: true,
    system: true
  });

  // Computed
  const hasUnread = computed(() => unreadCount.value > 0);
  
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  );
  
  const readNotifications = computed(() => 
    notifications.value.filter(n => n.isRead)
  );

  const groupedNotifications = computed(() => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    notifications.value.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      let groupKey;
      
      if (notifDate >= today) {
        groupKey = '오늘';
      } else if (notifDate >= yesterday) {
        groupKey = '어제';
      } else if (notifDate >= weekAgo) {
        groupKey = '이번 주';
      } else {
        groupKey = '이전';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  });

  // Actions
  async function fetchNotifications(page = 1, unreadOnly = false) {
    try {
      loading.value = true;
      const response = await notificationsApi.getNotifications({
        page,
        limit: 20,
        unreadOnly
      });
      
      if (response && response.success) {
        notifications.value = response.data.notifications;
        currentPage.value = response.data.currentPage;
        totalPages.value = response.data.totalPages;
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(notificationIds) {
    try {
      const idsArray = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const response = await notificationsApi.markAsRead(idsArray);
      
      if (response && response.success) {
        // 로컬 상태 업데이트
        notifications.value = notifications.value.map(n => {
          if (idsArray.includes(n.id)) {
            return { ...n, isRead: true, readAt: new Date() };
          }
          return n;
        });
        
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  // 실시간 알림 추가 (Socket에서 호출)
  function addNotification(notification) {
    notifications.value.unshift(notification);
    if (!notification.isRead) {
      unreadCount.value++;
    }
  }

  return {
    // State
    notifications,
    unreadCount,
    loading,
    currentPage,
    totalPages,
    notificationSettings,
    
    // Computed
    hasUnread,
    unreadNotifications,
    readNotifications,
    groupedNotifications,
    
    // Actions
    fetchNotifications,
    markAsRead,
    addNotification
  };
});
```

### Travel Plan Store (travelPlan.js)

```javascript
export const useTravelPlanStore = defineStore('travelPlan', () => {
  // State
  const plans = ref([]);
  const currentPlan = ref(null);
  const loading = ref(false);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  // Computed
  const publicPlans = computed(() => 
    plans.value.filter(plan => plan.is_public)
  );
  
  const privatePlans = computed(() => 
    plans.value.filter(plan => !plan.is_public)
  );

  const upcomingPlans = computed(() => {
    const now = new Date();
    return plans.value.filter(plan => 
      new Date(plan.start_date) > now
    ).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  });

  // Actions
  async function fetchPlans(params = {}) {
    try {
      loading.value = true;
      const response = await travelPlanApi.getPlans(params);
      
      if (response && response.success) {
        plans.value = response.data.plans;
        pagination.value = {
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          itemsPerPage: response.data.itemsPerPage
        };
      }
    } catch (error) {
      console.error('Failed to fetch travel plans:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createPlan(planData) {
    try {
      const response = await travelPlanApi.createPlan(planData);
      
      if (response && response.success) {
        plans.value.unshift(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create travel plan:', error);
      throw error;
    }
  }

  async function updatePlan(planId, updates) {
    try {
      const response = await travelPlanApi.updatePlan(planId, updates);
      
      if (response && response.success) {
        const index = plans.value.findIndex(p => p.plan_id === planId);
        if (index !== -1) {
          plans.value[index] = response.data;
        }
        
        if (currentPlan.value?.plan_id === planId) {
          currentPlan.value = response.data;
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Failed to update travel plan:', error);
      throw error;
    }
  }

  async function deletePlan(planId) {
    try {
      await travelPlanApi.deletePlan(planId);
      
      plans.value = plans.value.filter(p => p.plan_id !== planId);
      
      if (currentPlan.value?.plan_id === planId) {
        currentPlan.value = null;
      }
    } catch (error) {
      console.error('Failed to delete travel plan:', error);
      throw error;
    }
  }

  return {
    // State
    plans,
    currentPlan,
    loading,
    pagination,
    
    // Computed
    publicPlans,
    privatePlans,
    upcomingPlans,
    
    // Actions
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan
  };
});
```

## 서비스 레이어 (`/src/services/`)

### Socket Service (socket.js)

```javascript
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const SOCKET_URL = process.env.VUE_APP_SOCKET_URL || 'http://localhost:3000';
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    // 연결 성공
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    // 연결 해제
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // 서버에서 강제로 연결 해제한 경우
        console.log('Disconnected by server');
      } else {
        // 자동 재연결 시도
        this.handleReconnect();
      }
    });

    // 인증 에러
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      
      if (error.message === 'Authentication error') {
        console.log('Socket authentication failed');
        // 토큰 갱신 시도 또는 로그아웃
        this.handleAuthError();
      }
    });

    // 새로운 알림
    this.socket.on('notification:new', (notification) => {
      console.log('New notification received:', notification);
      const notificationStore = useNotificationStore();
      notificationStore.addNotification(notification);
      
      // 브라우저 알림 표시
      this.showBrowserNotification(notification);
    });

    // 새로운 메시지
    this.socket.on('message:new', (message) => {
      console.log('New message received:', message);
      // 메시지 스토어에 추가하거나 이벤트 버스 사용
      this.handleNewMessage(message);
    });

    // 알림 읽음 처리
    this.socket.on('notification:read:success', (notificationId) => {
      const notificationStore = useNotificationStore();
      notificationStore.markAsReadLocal(notificationId);
    });

    // 모든 알림 읽음 처리
    this.socket.on('notifications:readAll:success', () => {
      const notificationStore = useNotificationStore();
      notificationStore.markAllAsReadLocal();
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, delay);
    }
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  showBrowserNotification(notification) {
    if (Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });

      notif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          // 라우터 네비게이션
          const router = useRouter();
          router.push(notification.actionUrl);
        }
        notif.close();
      };

      // 5초 후 자동 닫기
      setTimeout(() => notif.close(), 5000);
    }
  }

  handleNewMessage(message) {
    // 현재 메시징 페이지에 있는 경우 메시지 추가
    const currentRoute = useRoute();
    if (currentRoute.name === 'messaging' && 
        currentRoute.params.matchId === message.match_id) {
      // 메시지 리스트에 추가 (컴포넌트에서 처리)
      window.dispatchEvent(new CustomEvent('newMessage', { 
        detail: message 
      }));
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 메시지 전송 (필요한 경우)
  sendMessage(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('Socket not connected');
    }
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();
export default socketService;

// Composable 함수로도 제공
export function useSocketService() {
  return socketService;
}
```

## 컴포넌트 구조

### 1. 공통 컴포넌트 (`/src/components/common/`)

#### AccessibilityWidget.vue
```vue
<template>
  <v-card
    v-if="showWidget"
    class="accessibility-widget"
    elevation="8"
  >
    <v-card-title>
      <v-icon>mdi-universal-access</v-icon>
      접근성 설정
    </v-card-title>
    
    <v-card-text>
      <!-- 폰트 크기 조절 -->
      <div class="mb-4">
        <v-subheader>폰트 크기</v-subheader>
        <div class="d-flex align-center">
          <v-btn
            icon="mdi-minus"
            size="small"
            @click="decreaseFontSize"
            :disabled="fontSize <= 14"
          />
          <span class="mx-3">{{ fontSize }}px</span>
          <v-btn
            icon="mdi-plus"
            size="small"
            @click="increaseFontSize"
            :disabled="fontSize >= 24"
          />
        </div>
      </div>

      <!-- 고대비 모드 -->
      <div class="mb-4">
        <v-switch
          v-model="highContrast"
          label="고대비 모드"
          color="primary"
          @change="toggleHighContrast"
        />
      </div>

      <!-- 애니메이션 줄이기 -->
      <div class="mb-4">
        <v-switch
          v-model="reducedMotion"
          label="애니메이션 줄이기"
          color="primary"
          @change="toggleReducedMotion"
        />
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn
        text="설정 초기화"
        variant="text"
        @click="resetSettings"
      />
      <v-spacer />
      <v-btn
        text="닫기"
        variant="text"
        @click="hideWidget"
      />
    </v-card-actions>
  </v-card>

  <!-- 접근성 토글 버튼 -->
  <v-fab
    v-else
    icon="mdi-universal-access"
    size="small"
    class="accessibility-fab"
    color="primary"
    @click="showWidget = true"
    aria-label="접근성 설정 열기"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAccessibilityStore } from '@/stores/accessibility';

const accessibility = useAccessibilityStore();
const showWidget = ref(false);

// Reactive refs
const fontSize = ref(accessibility.fontSize);
const highContrast = ref(accessibility.highContrast);
const reducedMotion = ref(accessibility.reducedMotion);

// 폰트 크기 조절
function increaseFontSize() {
  if (fontSize.value < 24) {
    fontSize.value += 2;
    accessibility.setFontSize(fontSize.value);
    applyFontSize();
  }
}

function decreaseFontSize() {
  if (fontSize.value > 14) {
    fontSize.value -= 2;
    accessibility.setFontSize(fontSize.value);
    applyFontSize();
  }
}

function applyFontSize() {
  document.documentElement.style.fontSize = `${fontSize.value}px`;
}

// 고대비 모드
function toggleHighContrast() {
  accessibility.setHighContrast(highContrast.value);
  document.body.classList.toggle('high-contrast', highContrast.value);
}

// 애니메이션 줄이기
function toggleReducedMotion() {
  accessibility.setReducedMotion(reducedMotion.value);
  document.body.classList.toggle('reduced-motion', reducedMotion.value);
}

// 설정 초기화
function resetSettings() {
  fontSize.value = 16;
  highContrast.value = false;
  reducedMotion.value = false;
  
  accessibility.resetSettings();
  
  applyFontSize();
  document.body.classList.remove('high-contrast', 'reduced-motion');
}

function hideWidget() {
  showWidget.value = false;
}

// 컴포넌트 마운트 시 설정 적용
onMounted(() => {
  applyFontSize();
  
  if (accessibility.highContrast) {
    document.body.classList.add('high-contrast');
  }
  
  if (accessibility.reducedMotion) {
    document.body.classList.add('reduced-motion');
  }
});
</script>

<style scoped>
.accessibility-widget {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 280px;
  z-index: 1000;
}

.accessibility-fab {
  position: fixed !important;
  bottom: 20px;
  right: 20px;
  z-index: 999;
}
</style>
```

### 2. 메시징 컴포넌트 (`/src/views/MessagingView.vue`)

```vue
<template>
  <v-container fluid class="pa-0">
    <v-app-bar
      color="primary"
      dark
      dense
    >
      <v-btn
        icon="mdi-arrow-left"
        @click="$router.go(-1)"
      />
      <v-toolbar-title>{{ otherUser?.nickname || '메시지' }}</v-toolbar-title>
      <v-spacer />
      <v-btn
        icon="mdi-dots-vertical"
        @click="showMenu = !showMenu"
      />
    </v-app-bar>

    <!-- 메시지 목록 -->
    <div
      ref="messageContainer"
      class="message-container"
      @scroll="handleScroll"
    >
      <div
        v-if="loading"
        class="d-flex justify-center pa-4"
      >
        <v-progress-circular indeterminate />
      </div>

      <div
        v-for="message in messages"
        :key="message.message_id"
        class="message-wrapper"
        :class="{ 'own-message': message.sender_id === currentUserId }"
      >
        <div class="message-bubble">
          <div class="message-content">{{ message.content }}</div>
          <div class="message-meta">
            <span class="message-time">
              {{ formatTime(message.created_at) }}
            </span>
            <v-icon
              v-if="message.sender_id === currentUserId"
              :icon="message.is_read ? 'mdi-check-all' : 'mdi-check'"
              size="small"
              :color="message.is_read ? 'blue' : 'grey'"
            />
          </div>
        </div>
      </div>

      <!-- 스크롤 다운 버튼 -->
      <v-fab
        v-if="showScrollButton"
        icon="mdi-chevron-down"
        size="small"
        class="scroll-fab"
        @click="scrollToBottom"
      />
    </div>

    <!-- 메시지 입력 -->
    <div class="message-input-container">
      <v-text-field
        v-model="newMessage"
        placeholder="메시지를 입력하세요..."
        variant="outlined"
        density="compact"
        hide-details
        @keyup.enter="sendMessage"
        :disabled="sending"
      >
        <template #append-inner>
          <v-btn
            icon="mdi-send"
            size="small"
            color="primary"
            @click="sendMessage"
            :disabled="!newMessage.trim() || sending"
            :loading="sending"
          />
        </template>
      </v-text-field>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { messagesApi } from '@/api/messages';
import { useSocketService } from '@/services/socket';
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const socketService = useSocketService();

// Reactive state
const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const sending = ref(false);
const showScrollButton = ref(false);
const showMenu = ref(false);
const messageContainer = ref(null);
const otherUser = ref(null);

// Computed
const matchId = computed(() => route.params.matchId);
const currentUserId = computed(() => authStore.user?.user_id);

// 메시지 로딩
async function loadMessages() {
  try {
    loading.value = true;
    const response = await messagesApi.getMessages(matchId.value, {
      page: 1,
      limit: 50
    });

    if (response?.success) {
      messages.value = response.data.messages;
      
      // 상대방 정보 설정 (첫 번째 메시지에서 추출)
      if (messages.value.length > 0) {
        const otherMessage = messages.value.find(
          m => m.sender_id !== currentUserId.value
        );
        if (otherMessage) {
          otherUser.value = otherMessage.sender;
        }
      }

      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  } finally {
    loading.value = false;
  }
}

// 메시지 전송
async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return;

  const messageContent = newMessage.value.trim();
  newMessage.value = '';

  try {
    sending.value = true;
    
    const response = await messagesApi.sendMessage(matchId.value, {
      content: messageContent,
      message_type: 'text'
    });

    if (response?.success) {
      // API 응답으로 받은 메시지를 리스트에 추가
      messages.value.push(response.data);
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    // 실패 시 메시지 복원
    newMessage.value = messageContent;
  } finally {
    sending.value = false;
  }
}

// 실시간 메시지 수신
function handleNewMessage(message) {
  if (message.match_id === matchId.value) {
    messages.value.push(message);
    nextTick(() => {
      scrollToBottom();
    });
  }
}

// 스크롤 처리
function handleScroll() {
  if (!messageContainer.value) return;
  
  const container = messageContainer.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  
  // 하단에서 100px 이상 떨어진 경우 스크롤 버튼 표시
  showScrollButton.value = (scrollHeight - scrollTop - clientHeight) > 100;
}

function scrollToBottom() {
  if (!messageContainer.value) return;
  
  const container = messageContainer.value;
  container.scrollTop = container.scrollHeight;
  showScrollButton.value = false;
}

// 시간 포맷팅
function formatTime(timestamp) {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: ko });
  } else if (isYesterday(date)) {
    return `어제 ${format(date, 'HH:mm', { locale: ko })}`;
  } else {
    return format(date, 'MM/dd HH:mm', { locale: ko });
  }
}

// Socket 이벤트 리스너 설정
onMounted(() => {
  loadMessages();
  
  // Socket.io 실시간 메시지 수신
  if (socketService.isConnected) {
    socketService.socket.on('message:new', handleNewMessage);
  }

  // 브라우저 이벤트로도 수신 (Socket Service에서 발송)
  window.addEventListener('newMessage', (event) => {
    handleNewMessage(event.detail);
  });
});

onUnmounted(() => {
  // 이벤트 리스너 정리
  if (socketService.isConnected && socketService.socket) {
    socketService.socket.off('message:new', handleNewMessage);
  }
  
  window.removeEventListener('newMessage', handleNewMessage);
});

// 매칭 ID 변경 시 메시지 다시 로드
watch(() => matchId.value, () => {
  if (matchId.value) {
    messages.value = [];
    loadMessages();
  }
});
</script>

<style scoped>
.message-container {
  height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;
}

.message-wrapper.own-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  background-color: white;
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.own-message .message-bubble {
  background-color: #1976d2;
  color: white;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.4;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-input-container {
  padding: 16px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.scroll-fab {
  position: absolute !important;
  bottom: 80px;
  right: 20px;
}

/* 고대비 모드 지원 */
body.high-contrast .message-container {
  background-color: #000000;
}

body.high-contrast .message-bubble {
  background-color: #333333;
  color: #ffffff;
}

body.high-contrast .own-message .message-bubble {
  background-color: #ffffff;
  color: #000000;
}

/* 애니메이션 줄이기 지원 */
body.reduced-motion * {
  animation: none !important;
  transition: none !important;
}
</style>
```

## 라우터 설정 (`/src/router/index.js`)

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '홈 - Traveller'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '로그인 - Traveller',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/SignUpView.vue'),
    meta: {
      title: '회원가입 - Traveller',
      requiresGuest: true
    }
  },
  {
    path: '/travel-plans',
    name: 'travel-plans',
    component: () => import('@/views/TravelPlansView.vue'),
    meta: {
      title: '여행 계획 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/travel-plans/create',
    name: 'travel-plan-create',
    component: () => import('@/views/TravelPlanCreateView.vue'),
    meta: {
      title: '여행 계획 작성 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/travel-plans/:id',
    name: 'travel-plan-detail',
    component: () => import('@/views/TravelPlanDetailView.vue'),
    props: true,
    meta: {
      title: '여행 계획 상세 - Traveller'
    }
  },
  {
    path: '/companion-search',
    name: 'companion-search',
    component: () => import('@/views/CompanionSearchView.vue'),
    meta: {
      title: '동행 찾기 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/my-matches',
    name: 'my-matches',
    component: () => import('@/views/MyMatchesView.vue'),
    meta: {
      title: '내 매칭 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/messaging/:matchId',
    name: 'messaging',
    component: () => import('@/views/MessagingView.vue'),
    props: true,
    meta: {
      title: '메시지 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: '프로필 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/profile/edit',
    name: 'profile-edit',
    component: () => import('@/views/ProfileEditView.vue'),
    meta: {
      title: '프로필 수정 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/destinations',
    name: 'destinations',
    component: () => import('@/views/DestinationsView.vue'),
    meta: {
      title: '여행지 - Traveller'
    }
  },
  {
    path: '/destinations/:id',
    name: 'destination-detail',
    component: () => import('@/views/DestinationDetailView.vue'),
    props: true,
    meta: {
      title: '여행지 상세 - Traveller'
    }
  },
  {
    path: '/reviews',
    name: 'my-reviews',
    component: () => import('@/views/MyReviewsView.vue'),
    meta: {
      title: '내 리뷰 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: {
      title: '즐겨찾기 - Traveller',
      requiresAuth: true
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/TermsView.vue'),
    meta: {
      title: '이용약관 - Traveller'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyView.vue'),
    meta: {
      title: '개인정보처리방침 - Traveller'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '페이지를 찾을 수 없습니다 - Traveller'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // 페이지 타이틀 설정
  document.title = to.meta.title || 'Traveller';
  
  // 인증이 필요한 페이지
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 게스트 전용 페이지 (로그인된 사용자 접근 불가)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }
  
  // 사용자 정보가 없는 경우 fetch
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // 사용자 정보 로드 실패 시 로그아웃
      await authStore.logout();
      if (to.meta.requiresAuth) {
        next({ name: 'login', query: { redirect: to.fullPath } });
        return;
      }
    }
  }
  
  next();
});

export default router;
```

## 메인 애플리케이션 설정 (`/src/main.js`)

```javascript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import router from './router';

// Vuetify theme
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      variant: 'elevated',
      color: 'primary'
    },
    VCard: {
      variant: 'elevated'
    }
  }
});

const app = createApp(App);
const pinia = createPinia();

// 글로벌 에러 핸들러
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error);
  console.error('Component:', instance);
  console.error('Info:', info);
};

// 플러그인 등록
app.use(pinia);
app.use(router);
app.use(vuetify);

// 앱 마운트
app.mount('#app');

// 서비스 워커 등록 (PWA)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

---

*본 문서는 Traveller 프론트엔드의 상세한 아키텍처와 구현 사항을 기술한 개발자 가이드입니다.*