# Traveller 프로젝트 테스트 가이드

## 1. 테스트 환경 설정

### 1.1 백엔드 서버 실행
```bash
cd backend
npm install  # 의존성 설치 (처음 한번만)
npm start    # 서버 실행 (포트 3000)
```

### 1.2 프론트엔드 서버 실행
새로운 터미널에서:
```bash
cd frontend
npm install  # 의존성 설치 (처음 한번만)
npm run dev  # 개발 서버 실행 (포트 8080)
```

### 1.3 데이터베이스 초기화
백엔드 서버가 시작되면 자동으로 테이블이 생성됩니다.
테스트 데이터를 추가하려면:
```bash
cd backend
node create-test-accounts.js    # 테스트 계정 생성
node migrate-coordinates.js     # 여행지 좌표 데이터
node migrate-accessibility.js   # 접근성 정보
```

## 2. 테스트 계정 정보

### 장애인 여행자
- 이메일: traveler@test.com
- 비밀번호: test1234

### 동행인
- 이메일: companion@test.com
- 비밀번호: test1234

### 일반 사용자
- 이메일: general@test.com
- 비밀번호: test1234

## 3. 기능별 테스트 체크리스트

### 3.1 인증 시스템 테스트
- [ ] 회원가입 페이지 접속 (http://localhost:8080/register)
  - [ ] 장애인 여행자로 회원가입
  - [ ] 동행인으로 회원가입
  - [ ] 일반 사용자로 회원가입
- [ ] 로그인 테스트 (http://localhost:8080/login)
  - [ ] 각 계정 타입별 로그인
  - [ ] 잘못된 비밀번호 에러 확인
- [ ] 로그아웃 테스트
- [ ] 인증 상태 유지 확인 (페이지 새로고침)

### 3.2 여행지 시스템 테스트
- [ ] 여행지 목록 페이지 (http://localhost:8080/destinations)
  - [ ] 6개 샘플 여행지 표시 확인
  - [ ] 검색 기능 (예: "서울", "제주")
  - [ ] 카테고리 필터 (관광지, 음식점, 숙박)
  - [ ] 지역 필터 (서울, 부산, 제주도 등)
  - [ ] 접근성 등급 필터 (A, B, C, D)
- [ ] 여행지 상세 페이지
  - [ ] 접근성 정보 표시
  - [ ] 편의시설 아이콘 표시
  - [ ] 카카오맵 표시 (API 키 필요)
  - [ ] 외부 지도 앱 연동 버튼

### 3.3 리뷰 시스템 테스트
- [ ] 리뷰 작성 (로그인 필요)
  - [ ] 5점 척도 평점 입력
  - [ ] 리뷰 내용 작성
  - [ ] 이미지 업로드 (최대 5장)
- [ ] 리뷰 목록 확인
  - [ ] 정렬 기능 (최신순, 평점순, 도움됨순)
  - [ ] 페이지네이션
- [ ] 리뷰 수정/삭제 (본인 리뷰만)
- [ ] 도움됨 버튼 클릭
- [ ] 나의 리뷰 관리 (http://localhost:8080/my-reviews)

### 3.4 즐겨찾기 시스템 테스트
- [ ] 여행지 상세에서 하트 아이콘 클릭
- [ ] 즐겨찾기 목록 페이지 (http://localhost:8080/favorites)
  - [ ] 추가한 여행지 표시
  - [ ] 즐겨찾기 제거
  - [ ] 페이지네이션 (12개씩)

### 3.5 여행 계획 테스트
- [ ] 여행 계획 페이지 (http://localhost:8080/travel-plans)
- [ ] 새 계획 만들기
  - [ ] 제목, 시작일, 종료일 입력
  - [ ] 일차별 여행지 추가
  - [ ] 드래그앤드롭으로 순서 변경
- [ ] 계획 상세 보기
- [ ] 계획 수정/삭제

### 3.6 동행인 매칭 테스트
- [ ] 동행인 검색 (http://localhost:8080/matching)
  - [ ] 장애인 계정: 동행인 목록만 표시
  - [ ] 동행인 계정: 장애인 목록만 표시
  - [ ] 일반 사용자: 다른 일반 사용자만 표시
- [ ] 매칭 요청 보내기
- [ ] 내 매칭 관리 (http://localhost:8080/my-matches)
  - [ ] 받은 요청 승인/거절
  - [ ] 보낸 요청 취소
  - [ ] 활성 매칭 종료

### 3.7 메시징 시스템 테스트
- [ ] 매칭 완료 후 메시지 버튼 활성화 확인
- [ ] 실시간 채팅 (http://localhost:8080/messages/:matchId)
  - [ ] 메시지 전송/수신
  - [ ] 읽음 상태 표시
  - [ ] 메시지 검색
  - [ ] 메시지 삭제

### 3.8 프로필 관리 테스트
- [ ] 프로필 페이지 (http://localhost:8080/profile)
  - [ ] 활동 통계 표시
  - [ ] 최근 활동 타임라인
- [ ] 프로필 수정 (http://localhost:8080/profile/edit)

### 3.9 접근성 기능 테스트
- [ ] 우측 하단 접근성 위젯
  - [ ] 글자 크기 조절 (3단계)
  - [ ] 고대비 모드 토글
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 호환성 (선택사항)

## 4. API 직접 테스트

### Postman 또는 curl을 사용한 API 테스트:

```bash
# 서버 상태 확인
curl http://localhost:3000/api/health

# 여행지 목록
curl http://localhost:3000/api/destinations

# 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@test.com","password":"test1234"}'

# 토큰을 받아서 인증이 필요한 API 호출
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 5. 자동화 테스트 스크립트

테스트를 자동화하려면 `test-api.js` 파일을 생성:

```javascript
// backend/test-api.js
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';

async function testAuth() {
  console.log('=== 인증 테스트 ===');
  
  // 로그인
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: 'traveler@test.com',
    password: 'test1234'
  });
  
  authToken = loginRes.data.token;
  console.log('✅ 로그인 성공');
  
  // 사용자 정보 조회
  const meRes = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  console.log('✅ 사용자 정보:', meRes.data.user.name);
}

async function testDestinations() {
  console.log('\n=== 여행지 테스트 ===');
  
  // 목록 조회
  const listRes = await axios.get(`${API_URL}/destinations`);
  console.log(`✅ 여행지 ${listRes.data.destinations.length}개 조회`);
  
  // 검색
  const searchRes = await axios.get(`${API_URL}/destinations?search=서울`);
  console.log(`✅ "서울" 검색 결과: ${searchRes.data.destinations.length}개`);
}

async function runTests() {
  try {
    await testAuth();
    await testDestinations();
    // 추가 테스트...
    
    console.log('\n✅ 모든 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실패:', error.response?.data || error.message);
  }
}

runTests();
```

실행: `node test-api.js`

## 6. 브라우저 자동화 테스트 (선택사항)

Playwright를 사용한 E2E 테스트:

```bash
npm install -D @playwright/test
```

```javascript
// tests/e2e.spec.js
const { test, expect } = require('@playwright/test');

test('홈페이지 로드', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page).toHaveTitle(/Traveller/);
});

test('로그인 플로우', async ({ page }) => {
  await page.goto('http://localhost:8080/login');
  await page.fill('input[type="email"]', 'traveler@test.com');
  await page.fill('input[type="password"]', 'test1234');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:8080/');
});
```

## 7. 성능 테스트

- 브라우저 개발자 도구의 Network 탭에서 로딩 시간 확인
- Lighthouse를 사용한 성능 분석
- 많은 데이터가 있을 때 페이지네이션 동작 확인

## 8. 알려진 이슈 확인

- 카카오맵 API 키가 없으면 지도가 표시되지 않음
- 프로필 이미지 업로드 기능 미구현
- 실시간 알림 기능 미구현

이 가이드를 따라 모든 기능을 체계적으로 테스트할 수 있습니다!