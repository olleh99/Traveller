# Traveller 프로젝트 종합 기능 설명서

## 프로젝트 개요
Traveller는 Vue.js 3와 Node.js 기반의 여행 동행 매칭 및 계획 공유 플랫폼입니다. 장애인을 포함한 모든 사용자가 안전하고 편리하게 여행을 계획하고 동행자를 찾을 수 있도록 설계되었습니다.

### 핵심 기능
- 🌍 **여행지 추천 및 정보 제공**
- 👥 **동행자 매칭 시스템**
- 💬 **실시간 메시징**
- 📋 **여행 계획 관리**
- ⭐ **리뷰 및 평점 시스템**
- 🔔 **실시간 알림**
- ♿ **접근성 지원**

---

## Frontend 구조 및 기능

### 기술 스택
- **Framework**: Vue.js 3 (Composition API)
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite
- **Real-time**: Socket.io-client

### 디렉토리 구조

```
frontend/src/
├── api/                    # API 호출 관련
├── components/            # 재사용 가능한 컴포넌트
├── router/               # 라우팅 설정
├── services/             # 서비스 로직
├── stores/               # Pinia 상태 관리
├── views/                # 페이지 컴포넌트
├── plugins/              # 플러그인 설정
└── main.js              # 앱 진입점
```

### 주요 컴포넌트 및 기능

#### 1. API Layer (`/src/api/`)

**index.js** - API 기본 설정
```javascript
class ApiService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';
    this.setupInterceptors();
  }
}
```
- Axios 인터셉터로 토큰 자동 첨부
- 응답 데이터 자동 추출 (`response.data` 반환)
- 에러 핸들링 및 리다이렉트 처리

**주요 API 모듈들:**
- `auth.js`: 인증/회원가입 관련 API
- `user.js`: 사용자 프로필 관리 API
- `travelPlan.js`: 여행 계획 CRUD API
- `destination.js`: 여행지 정보 API
- `matching.js`: 동행 매칭 API
- `messages.js`: 메시징 API
- `review.js`: 리뷰 시스템 API
- `favorites.js`: 즐겨찾기 API

#### 2. State Management (`/src/stores/`)

**auth.js** - 인증 상태 관리
```javascript
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'));
  const user = ref(null);
  const isAuthenticated = computed(() => !!token.value);
  
  async function login(credentials) { /* 로그인 로직 */ }
  async function logout() { /* 로그아웃 로직 */ }
  
  return { token, user, isAuthenticated, login, logout };
});
```

**주요 스토어들:**
- `auth.js`: JWT 토큰, 사용자 정보, 로그인/로그아웃
- `notification.js`: 알림 목록, 읽지 않은 개수, 실시간 업데이트
- `profile.js`: 사용자 프로필, 장애 정보, 접근성 설정
- `travelPlan.js`: 여행 계획 목록, 생성/수정/삭제
- `accessibility.js`: 접근성 위젯 설정 (폰트 크기, 대비 등)

**notification.js 주요 기능:**
- 알림 목록 관리 및 페이지네이션
- 읽음/읽지 않음 상태 처리
- 실시간 알림 수신 및 로컬 상태 업데이트
- 알림 설정 관리

#### 3. Services (`/src/services/`)

**socket.js** - Socket.io 클라이언트
```javascript
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }
  
  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.socket.on('notification:new', this.handleNewNotification);
    this.socket.on('message:new', this.handleNewMessage);
  }
}
```
- JWT 토큰 기반 인증 연결
- 실시간 알림 및 메시지 수신
- 연결 상태 관리
- 알림 권한 요청

#### 4. Views (`/src/views/`)

**HomeView.vue** - 메인 페이지
- HeroSection: 메인 배너 및 CTA
- ServiceIntroduction: 서비스 소개
- RecommendedDestinations: 추천 여행지
- Statistics: 서비스 통계
- CTABanner: 행동 유도 배너

**LoginView.vue / SignUpView.vue** - 인증 페이지
- Form validation (Vuelidate)
- 소셜 로그인 준비
- 접근성 고려된 폼 디자인

**TravelPlansView.vue** - 여행 계획 목록
- 무한 스크롤 페이지네이션
- 필터링 (공개/비공개, 날짜)
- 계획 생성/수정/삭제

**TravelPlanDetailView.vue** - 여행 계획 상세
- 일정별 여행지 표시
- 카카오맵 연동
- 리뷰 작성 및 표시
- 동행 신청 버튼

**CompanionSearchView.vue** - 동행자 찾기
- 여행지/날짜별 검색
- 사용자 프로필 카드
- 매칭 요청 발송

**MyMatchesView.vue** - 내 매칭 현황
- 보낸/받은 요청 관리
- 상태별 필터링 (대기/수락/거절)
- 실시간 상태 업데이트

**MessagingView.vue** - 1:1 메시징
```javascript
const handleNewMessage = (message) => {
  if (message.match_id === matchId.value) {
    messages.value.push(message);
    nextTick(() => scrollToBottom());
  }
};

onMounted(() => {
  if (socketService.isConnected) {
    socketService.socket.on('message:new', handleNewMessage);
  }
});
```
- 실시간 메시지 송수신
- 메시지 읽음 처리
- 자동 스크롤
- 메시지 검색

**ProfileView.vue / ProfileEditView.vue** - 프로필 관리
- 기본 정보 수정
- 프로필 이미지 업로드
- 장애 정보 설정
- 접근성 설정

#### 5. Components (`/src/components/`)

**common/AccessibilityWidget.vue** - 접근성 위젯
- 폰트 크기 조절 (14px ~ 24px)
- 고대비 모드 토글
- 설정 로컬 스토리지 저장

**notification/NotificationBell.vue** - 알림 벨
- 실시간 읽지 않은 개수 표시
- 알림 목록 드롭다운
- 읽음 처리 및 삭제

**travel/TravelPlanCreateForm.vue** - 여행 계획 생성
- 단계별 폼 (기본정보 → 일정 → 확인)
- DestinationPicker 컴포넌트 사용
- DayItinerary 컴포넌트로 일정 관리

**review/ReviewForm.vue** - 리뷰 작성
- 별점 및 텍스트 리뷰
- 다중 이미지 업로드
- 실시간 미리보기

**matching/MatchingRequestForm.vue** - 매칭 요청
- 여행 정보 입력
- 메시지 작성
- 유효성 검증

**map/KakaoMap.vue** - 카카오맵 연동
- 여행지 마커 표시
- 클러스터링
- 정보창 표시

### 라우팅 구조 (`/src/router/index.js`)

```javascript
const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/register', component: SignUpView },
  { 
    path: '/travel-plans', 
    component: TravelPlansView,
    meta: { requiresAuth: true }
  },
  {
    path: '/travel-plans/:id',
    component: TravelPlanDetailView,
    props: true
  },
  {
    path: '/companion-search',
    component: CompanionSearchView,
    meta: { requiresAuth: true }
  },
  {
    path: '/messaging/:matchId',
    component: MessagingView,
    meta: { requiresAuth: true }
  }
];
```

**주요 기능:**
- 인증이 필요한 라우트 보호
- 동적 라우트 파라미터 전달
- 네비게이션 가드로 권한 체크

---

## Backend 구조 및 기능

### 기술 스택
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL + Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Upload**: Multer

### 디렉토리 구조

```
backend/
├── config/              # 설정 파일
├── controllers/         # 비즈니스 로직 컨트롤러
├── middleware/          # 미들웨어
├── models/             # 데이터베이스 모델
├── routes/             # API 라우트
├── utils/              # 유틸리티 함수
├── uploads/            # 업로드 파일
└── server.js           # 서버 진입점
```

#### 1. Configuration (`/config/`)

**sequelize.js** - 데이터베이스 설정
```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: '+09:00',
    logging: process.env.NODE_ENV === 'development'
  }
);
```

**socket.js** - Socket.io 서버
```javascript
class SocketManager {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId 매핑
  }
  
  initialize(server) {
    this.io = new Server(server, {
      cors: { origin: process.env.FRONTEND_URL }
    });
    this.setupAuthMiddleware();
    this.setupEventHandlers();
  }
  
  sendNotification(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification:new', notification);
  }
}
```

#### 2. Models (`/models/sequelize/`)

**User.js** - 사용자 모델
```javascript
class User extends Model {
  static associate(models) {
    User.hasMany(models.TravelPlan, { foreignKey: 'user_id' });
    User.hasMany(models.Review, { foreignKey: 'user_id' });
    User.hasOne(models.DisabilityProfile, { foreignKey: 'user_id' });
  }
}

User.init({
  user_id: { type: DataTypes.UUID, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  nickname: { type: DataTypes.STRING },
  phone_number: { type: DataTypes.STRING },
  profile_image_url: { type: DataTypes.TEXT }
}, { sequelize });
```

**주요 모델들:**
- `User`: 사용자 기본 정보
- `DisabilityProfile`: 장애 정보 및 접근성 요구사항
- `TravelPlan`: 여행 계획
- `PlanDay`: 일별 일정
- `PlanDestination`: 일정의 여행지
- `Destination`: 여행지 정보
- `Review`: 리뷰 및 평점
- `ReviewImage`: 리뷰 이미지
- `Favorite`: 즐겨찾기
- `CompanionMatch`: 동행 매칭
- `MatchingRequest`: 매칭 요청
- `CompanionMessage`: 1:1 메시지
- `Notification`: 알림

**Notification.js** - 알림 모델 (주요 메서드)
```javascript
class Notification extends Model {
  static async createNewMessageNotification(userId, sender, matchId, messagePreview) {
    return this.create({
      userId,
      type: 'new_message',
      title: `${sender.nickname}님으로부터 새 메시지`,
      message: messagePreview.substring(0, 50),
      actionUrl: `/messaging/${matchId}`,
      relatedId: matchId
    });
  }
  
  static async getUnreadCount(userId) {
    return this.count({
      where: { userId, isRead: false }
    });
  }
}
```

#### 3. Controllers (`/controllers/`)

**authController.js** - 인증 컨트롤러
```javascript
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, nickname } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      user_id: uuidv4(),
      email, password: hashedPassword, name, nickname
    });
    
    const token = jwt.sign(
      { userId: user.user_id }, 
      process.env.JWT_SECRET
    );
    
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};
```

**messageController.js** - 메시지 컨트롤러
```javascript
async sendMessage(req, res, next) {
  try {
    const { matchId } = req.params;
    const senderId = req.user.user_id;
    const { content } = req.body;
    
    // 권한 확인 및 수신자 결정
    const match = await CompanionMatch.findOne({
      where: { match_id: matchId },
      // 매칭 참여자인지 확인
    });
    
    // 메시지 생성
    const message = await CompanionMessage.create({
      match_id: matchId,
      sender_id: senderId,
      receiver_id: receiverId,
      content
    });
    
    // 실시간 전송
    socketManager.sendMessage(receiverId, message);
    
    // 알림 생성
    const notification = await Notification.createNewMessageNotification(
      receiverId, senderUser, matchId, content
    );
    socketManager.sendNotification(receiverId, notification);
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
}
```

**주요 컨트롤러 기능:**
- `authController`: 회원가입, 로그인, 토큰 갱신
- `userController`: 프로필 조회/수정, 장애 정보 관리
- `travelPlanController`: 여행 계획 CRUD, 공개/비공개 설정
- `destinationController`: 여행지 조회, 검색, 좌표 정보
- `reviewController`: 리뷰 작성, 이미지 업로드, 좋아요
- `matchingController`: 동행 요청, 수락/거절, 매칭 관리
- `messageController`: 메시지 송수신, 읽음 처리, 검색
- `notificationController`: 알림 조회, 읽음 처리, 설정 관리
- `favoriteController`: 즐겨찾기 추가/삭제

#### 4. Routes (`/routes/`)

**messages.js** - 메시지 라우트
```javascript
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.use(authenticateToken); // 모든 라우트에 인증 필요

router.get('/:matchId', messageController.getMessages);
router.post('/:matchId', messageController.sendMessage);
router.delete('/:messageId', messageController.deleteMessage);
router.get('/:matchId/unread-count', messageController.getUnreadCount);
router.get('/all/unread-counts', messageController.getAllUnreadCounts);
```

**주요 라우트 구조:**
- `/api/auth`: 인증 관련 (회원가입, 로그인)
- `/api/user`: 사용자 프로필 관리
- `/api/travel-plans`: 여행 계획 CRUD
- `/api/destinations`: 여행지 정보
- `/api/reviews`: 리뷰 시스템
- `/api/matching`: 동행 매칭
- `/api/messages`: 1:1 메시징
- `/api/notifications`: 알림 시스템
- `/api/favorites`: 즐겨찾기

#### 5. Middleware (`/middleware/`)

**auth.js** - 인증 미들웨어
```javascript
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '액세스 토큰이 필요합니다.' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    
    req.user = decoded;
    next();
  });
};
```

**validation.js** - 입력 검증
```javascript
exports.validateTravelPlan = [
  body('title').notEmpty().withMessage('제목을 입력해주세요'),
  body('start_date').isISO8601().withMessage('유효한 시작일을 입력해주세요'),
  body('end_date').isISO8601().withMessage('유효한 종료일을 입력해주세요'),
  // ...추가 검증 규칙
];
```

#### 6. Utils (`/utils/`)

**errorHandler.js** - 에러 처리
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
};
```

### 서버 구조 (`server.js`)

```javascript
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// 보안 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 요청 제한
});
app.use('/api/', limiter);

// Socket.io 초기화
const socketManager = require('./config/socket');
socketManager.initialize(server);

// 라우트 등록
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/travel-plans', require('./routes/travelPlans'));
// ... 기타 라우트들

// 에러 핸들링
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
```

---

## 데이터베이스 스키마

### 주요 테이블 관계
```
Users (1:N) TravelPlans
Users (1:1) DisabilityProfiles  
Users (1:N) Reviews
TravelPlans (1:N) PlanDays
PlanDays (1:N) PlanDestinations
Users (M:N) CompanionMatches
CompanionMatches (1:N) CompanionMessages
Users (1:N) Notifications
Users (1:N) Favorites
```

### 핵심 필드 구조

**users 테이블**
- `user_id` (UUID, PK)
- `email`, `password`, `name`, `nickname`
- `phone_number`, `profile_image_url`
- `created_at`, `updated_at`

**travel_plans 테이블**
- `plan_id` (UUID, PK)
- `user_id` (FK to users)
- `title`, `description`
- `start_date`, `end_date`
- `is_public`, `budget`, `max_companions`

**companion_matches 테이블**
- `match_id` (UUID, PK)
- `traveler_id`, `companion_id` (FK to users)
- `status` (pending/active/completed/cancelled)
- `matched_at`

**companion_messages 테이블**
- `message_id` (UUID, PK)
- `match_id` (FK to companion_matches)
- `sender_id`, `receiver_id` (FK to users)
- `content`, `message_type`
- `is_read`, `read_at`

---

## 핵심 기능 구현 상세

### 1. 실시간 메시징 시스템

**Frontend (MessagingView.vue)**
```javascript
// Socket.io 연결 및 이벤트 리스너
onMounted(() => {
  if (socketService.isConnected) {
    socketService.socket.on('message:new', handleNewMessage);
    socketService.socket.on('disconnect', handleDisconnect);
  }
  loadMessages();
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  try {
    const response = await messagesApi.sendMessage(matchId.value, {
      content: newMessage.value,
      message_type: 'text'
    });
    
    newMessage.value = '';
    nextTick(() => scrollToBottom());
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  }
};
```

**Backend (messageController.js + socket.js)**
```javascript
// 메시지 전송 시 실시간 브로드캐스트
const message = await CompanionMessage.create({...});
socketManager.sendMessage(receiverId, message);

// Socket Manager에서 특정 사용자에게 전송
sendMessage(userId, message) {
  if (this.io) {
    this.io.to(`user-${userId}`).emit('message:new', message);
  }
}
```

### 2. 동행 매칭 시스템

**매칭 요청 흐름:**
1. 여행자가 동행자 검색 (CompanionSearchView.vue)
2. 매칭 요청 폼 작성 (MatchingRequestForm.vue)
3. 백엔드에서 MatchingRequest 생성
4. 대상자에게 실시간 알림 전송
5. 수락/거절 처리 시 CompanionMatch 생성

```javascript
// matchingController.js
exports.requestMatching = async (req, res, next) => {
  const request = await MatchingRequest.create({
    requester_id: req.user.user_id,
    target_user_id,
    travel_plan_id,
    message,
    status: 'pending'
  });
  
  // 알림 생성 및 전송
  const notification = await Notification.create({...});
  socketManager.sendNotification(target_user_id, notification);
};
```

### 3. 알림 시스템

**실시간 알림 처리:**
```javascript
// Frontend - notification store
function addNotification(notification) {
  notifications.value.unshift(notification);
  if (!notification.isRead) {
    unreadCount.value++;
  }
}

// Socket 이벤트에서 호출
socketService.socket.on('notification:new', (notification) => {
  notificationStore.addNotification(notification);
  // 브라우저 알림 표시
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico'
    });
  }
});
```

### 4. 접근성 지원

**AccessibilityWidget.vue**
```javascript
const accessibility = useAccessibilityStore();

// 폰트 크기 조절
const changeFontSize = (delta) => {
  const newSize = Math.max(14, Math.min(24, accessibility.fontSize + delta));
  accessibility.setFontSize(newSize);
  document.documentElement.style.fontSize = `${newSize}px`;
};

// 고대비 모드
const toggleHighContrast = () => {
  accessibility.toggleHighContrast();
  document.body.classList.toggle('high-contrast', accessibility.highContrast);
};
```

**CSS 고대비 스타일**
```css
body.high-contrast {
  --v-theme-background: #000000;
  --v-theme-surface: #1a1a1a;
  --v-theme-primary: #ffffff;
  --v-theme-on-primary: #000000;
}
```

---

## 보안 및 성능 최적화

### 1. 보안 조치
- **JWT 토큰 인증**: 모든 보호된 라우트에 토큰 검증
- **비밀번호 해싱**: bcrypt를 사용한 안전한 해싱
- **CORS 설정**: 특정 도메인만 허용
- **Helmet.js**: 보안 헤더 설정
- **Rate Limiting**: API 요청 제한
- **입력 검증**: express-validator로 데이터 검증
- **SQL Injection 방지**: Sequelize ORM 사용

### 2. 성능 최적화
- **페이지네이션**: 대용량 데이터 처리
- **이미지 압축**: Multer로 업로드 시 최적화
- **인덱싱**: 데이터베이스 검색 최적화
- **캐싱**: Redis 준비 (현재는 메모리 캐시)
- **번들 최적화**: Vite를 통한 코드 스플리팅

### 3. 에러 처리
- **글로벌 에러 핸들러**: 통일된 에러 응답 형식
- **로깅 시스템**: Winston으로 에러 로깅
- **프론트엔드 에러 바운더리**: Vue 에러 핸들링

---

## 향후 개발 계획

### 단기 목표 (1-2개월)
- [ ] 그룹 채팅 기능
- [ ] 파일 첨부 기능
- [ ] 푸시 알림 (PWA)
- [ ] 모바일 앱 (React Native/Flutter)

### 중기 목표 (3-6개월)
- [ ] AI 기반 여행지 추천
- [ ] 다국어 지원 (i18n)
- [ ] 결제 시스템 연동
- [ ] 소셜 로그인 (카카오, 구글)

### 장기 목표 (6개월 이상)
- [ ] 마이크로서비스 아키텍처 전환
- [ ] 쿠버네티스 배포
- [ ] 글로벌 서비스 확장
- [ ] VR/AR 여행 체험 기능

---

## 개발 환경 설정

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Redis (선택사항)
- Git

### 설치 및 실행
```bash
# Backend
cd backend
npm install
cp .env.example .env  # 환경변수 설정
npm run dev

# Frontend  
cd frontend
npm install
cp .env.example .env  # 환경변수 설정
npm run dev
```

### 환경 변수 설정
**Backend (.env)**
```
DB_HOST=localhost
DB_NAME=traveller
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:8080
```

**Frontend (.env)**
```
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_KAKAO_MAP_API_KEY=your_kakao_key
```

---

*본 문서는 Traveller 프로젝트의 전체 구조와 기능을 상세히 설명한 종합 가이드입니다.*