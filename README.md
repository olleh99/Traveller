# Traveller

장애인의 이동·접근성 문제를 고려해 여행 준비부터 동행 매칭, 소통까지 한 곳에서 지원하는 여행 플랫폼입니다.ㅋㅋㅋ

## 프로젝트 소개

Traveller는 장애 유형과 접근성 니즈를 반영한 여행 경험을 제공하는 것을 목표로 합니다.

- 여행 계획 수립 (일정/여행지 기반)
- 접근성 정보 기반의 여행지 탐색
- 사용자 간 동행 매칭 및 실시간 메시징
- 후기, 즐겨찾기, 알림 등 커뮤니티 기능

## 핵심 기능

### 1) 여행 계획

- 여행 일정 생성 및 일차(Plan Day) 단위 관리
- 여행지 추가/조회 기능 제공

### 2) 접근성 & 개인화

- 사용자/장애 프로필 기반 정보 관리
- 접근성 관련 메타데이터를 활용한 여행지 탐색

### 3) 동행 매칭 & 소통

- 매칭 요청 생성/조회/상태 관리
- 실시간 채팅(Socket.io) 및 알림

### 4) 커뮤니티

- 리뷰 작성 및 조회
- 즐겨찾기 기능으로 관심 여행지 관리

## 기술 스택

- Frontend: Vue 3, Vuetify 3, Vite
- Backend: Node.js, Express.js, MySQL(Sequelize)
- Authentication: JWT, bcrypt
- Realtime: Socket.io
- Cache/Infra: Redis (설정 기반)

## 프로젝트 구조

```text
Traveller/
├─ backend/                # API 서버, 비즈니스 로직, DB 모델
│  ├─ controllers/
│  ├─ models/sequelize/
│  ├─ routes/
│  └─ config/
├─ frontend/               # Vue 기반 사용자 웹 애플리케이션
│  └─ src/
├─ docs/                   # 아키텍처/구현 보고서/프로젝트 문서
└─ README.md
```

## 실행 방법

### 사전 준비

- Node.js LTS
- MySQL
- (선택) Redis

### 1) 백엔드 실행 (기본 포트: 3000)

```bash
cd backend
npm install
npm run dev
```

### 2) 프론트엔드 실행 (기본 포트: 8080)

```bash
cd frontend
npm install
npm run dev
```

## API/테스트 참고

- 백엔드 API 가이드: `backend/API_TEST_GUIDE.md`
- 테스트 가이드: `TEST_GUIDE.md`

## 문서

- 백엔드 아키텍처: `docs/BACKEND_ARCHITECTURE.md`
- 프론트엔드 아키텍처: `docs/FRONTEND_ARCHITECTURE.md`
- 기술 문서: `docs/TECHNICAL_DOCUMENTATION.md`
- 종합 문서: `docs/COMPREHENSIVE_DOCUMENTATION.md`

## 프로젝트 목표

모든 사용자가 접근성 제약 때문에 여행 기회를 포기하지 않도록,
정보 탐색 → 계획 수립 → 동행 연결 → 소통까지 이어지는 통합 경험을 제공합니다.
