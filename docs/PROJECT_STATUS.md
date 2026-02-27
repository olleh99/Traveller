# Traveller 프로젝트 현황

## 📊 프로젝트 진행률

### 전체 진행률: 25%

#### 세부 기능별 진행률
- ✅ **인증 시스템** (100%)
  - 회원가입 (장애인/동행인/일반 사용자 구분)
  - 로그인/로그아웃
  - JWT 토큰 기반 인증
  - 이메일/닉네임 중복 확인

- ✅ **기본 UI/UX** (80%)
  - 메인 페이지 디자인
  - 인증 관련 페이지들
  - 접근성 위젯 (글자 크기, 고대비 모드 등)
  - 반응형 디자인

- ✅ **데이터베이스 설계** (90%)
  - User, DisabilityProfile, CompanionProfile 모델 구현
  - Sequelize ORM 설정
  - MySQL 연동

- 🚧 **사용자 프로필 관리** (0%)
- 🚧 **여행지 검색/필터링** (0%)
- 🚧 **여행 계획 수립** (0%)
- 🚧 **동행인 매칭 시스템** (0%)
- 🚧 **예약 시스템** (0%)
- 🚧 **리뷰/평가 시스템** (0%)
- 🚧 **실시간 채팅** (0%)
- 🚧 **AI 추천 서비스** (0%)
- 🚧 **결제 시스템** (0%)
- 🚧 **알림 시스템** (0%)

## 🔗 현재 작동하는 URL들

### Frontend (포트 8080)
- `/` - 메인 홈페이지
- `/about` - 서비스 소개
- `/login` - 로그인
- `/register` - 회원가입 선택
- `/signup` - 회원가입 폼
- `/terms` - 이용약관
- `/privacy` - 개인정보처리방침

### Backend API (포트 3000)
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 새로고침
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/check-email` - 이메일 중복 확인
- `POST /api/auth/check-nickname` - 닉네임 중복 확인
- `GET /api/auth/me` - 현재 사용자 정보 조회
- `GET /api/health` - 서버 상태 확인

## 🛠 기술 스택

### Frontend
- **Framework**: Vue.js 3.3.11
- **UI Library**: Vuetify 3.4.7
- **State Management**: Pinia 2.1.7
- **Routing**: Vue Router 4.2.5
- **HTTP Client**: Axios 1.6.2
- **Build Tool**: Vite 5.0.8
- **Styling**: SASS 1.69.5
- **i18n**: Vue-i18n 9.8.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MySQL + Sequelize 6.37.7
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: Helmet 7.1.0, bcrypt 5.1.1
- **Real-time**: Socket.io 4.6.2
- **Caching**: Redis 4.6.11
- **Validation**: Joi 17.11.0
- **File Upload**: Multer 1.4.5
- **Image Processing**: Sharp 0.33.1
- **Email**: Nodemailer 6.9.7
- **Logging**: Winston 3.11.0

### AI/MCP Tools (계획됨)
- Claude API
- OpenAI GPT API
- Google Gemini API
- MCP Tools: context-7, sequential-thinking-tools

## 📁 파일 구조

```
Traveller/
├── backend/
│   ├── config/          # 설정 파일 (Redis, Sequelize)
│   ├── controllers/     # 컨트롤러 (authController.js)
│   ├── middleware/      # 미들웨어 (auth.js, validation.js)
│   ├── models/          # 데이터 모델
│   │   └── sequelize/   # User, DisabilityProfile, CompanionProfile
│   ├── routes/          # API 라우트 (auth.js)
│   ├── utils/           # 유틸리티 (jwt.js, validation.js)
│   └── server.js        # Express 서버 진입점
│
├── frontend/
│   ├── public/          # 정적 파일
│   │   └── images/      # 이미지 리소스
│   ├── src/
│   │   ├── api/         # API 클라이언트 (auth.js)
│   │   ├── assets/      # CSS 등 애셋
│   │   ├── components/  # Vue 컴포넌트
│   │   │   ├── common/  # AccessibilityWidget.vue
│   │   │   └── home/    # 홈페이지 섹션 컴포넌트들
│   │   ├── plugins/     # Vuetify 설정
│   │   ├── router/      # 라우팅 설정
│   │   ├── stores/      # Pinia 스토어 (auth.js, accessibility.js)
│   │   └── views/       # 페이지 컴포넌트
│   └── vite.config.js   # Vite 설정
│
├── docs/                # 프로젝트 문서
│   ├── Traveller_클로드학습자료.md
│   ├── 기술 스택.md
│   ├── 메인페이지_구현계획.md
│   ├── 백엔드_API_구현_가이드.md
│   └── MCP_기반_회원가입_기능_설계.md
│
└── README.md            # 프로젝트 소개
```

## 📝 다음 작업 우선순위

### 1. 높은 우선순위
1. **사용자 프로필 관리** 🔴
   - 프로필 조회/수정 API
   - 프로필 이미지 업로드
   - 장애 정보 관리
   - 동행인 정보 관리

2. **여행지 검색 및 필터링** 🔴
   - 여행지 데이터베이스 설계
   - 검색 API 구현
   - 장애 유형별 필터링
   - 접근성 정보 표시

### 2. 중간 우선순위
3. **여행 계획 수립** 🟡
   - 일정 관리 기능
   - 경로 최적화
   - 접근성 경로 안내

4. **리뷰 및 평가 시스템** 🟡
   - 여행지 리뷰
   - 접근성 평가
   - 사진 업로드

### 3. 낮은 우선순위
5. **동행인 매칭 시스템** 🟢
   - 매칭 알고리즘
   - 프로필 매칭
   - 채팅 시스템

6. **예약 시스템** 🟢
   - 숙박 예약
   - 교통 예약
   - 결제 연동

## 🚀 빠른 시작 가이드

### 1. 필수 요구사항
- Node.js 18.x 이상
- MySQL 8.x
- Redis (선택사항)

### 2. 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=traveller_db
# JWT_SECRET=your-secret-key
# JWT_REFRESH_SECRET=your-refresh-secret

# 데이터베이스 마이그레이션
npm run migrate

# 개발 서버 실행 (포트 3000)
npm run dev
```

### 3. 프론트엔드 설정
```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행 (포트 8080)
npm run dev
```

### 4. API 테스트
백엔드가 실행 중일 때:
- 서버 상태 확인: `GET http://localhost:3000/api/health`
- API 문서: `backend/API_TEST_GUIDE.md` 참조

### 5. 기본 계정
현재 시드 데이터나 기본 계정은 없으므로, 회원가입을 통해 새 계정을 생성해야 합니다.

## 📌 참고사항
- 모든 API는 `/api` 프리픽스를 사용합니다
- 인증이 필요한 API는 Authorization 헤더에 Bearer 토큰이 필요합니다
- 프로젝트는 WCAG 2.1 AA 접근성 기준을 준수합니다
- 장애인 사용자를 위한 다양한 접근성 기능이 포함되어 있습니다