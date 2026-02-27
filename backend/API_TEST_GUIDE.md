# API 테스트 가이드

## 사전 준비

1. **환경 설정**
   ```bash
   # .env 파일 생성 (.env.example 참고)
   cp .env.example .env
   
   # 필수 환경 변수 설정
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=traveller_db
   JWT_SECRET=your_secret_key
   ```

2. **데이터베이스 생성**
   ```bash
   # MySQL에 접속하여 스키마 실행
   mysql -u root -p < database/schema.sql
   ```

3. **서버 실행**
   ```bash
   npm run dev
   ```

## API 엔드포인트 테스트

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. 이메일 중복 확인
```bash
curl -X POST http://localhost:3000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. 닉네임 중복 확인
```bash
curl -X POST http://localhost:3000/api/auth/check-nickname \
  -H "Content-Type: application/json" \
  -d '{"nickname": "testuser"}'
```

### 4. 일반 사용자 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "user_type": "general",
    "name": "홍길동",
    "nickname": "testuser",
    "phone": "010-1234-5678",
    "marketing_consent": true
  }'
```

### 5. 장애인 여행자 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "disabled@example.com",
    "password": "SecurePass123!",
    "user_type": "disabled_traveler",
    "name": "김철수",
    "nickname": "traveler1",
    "disability_types": ["시각장애", "휠체어"],
    "support_needs": ["보조인", "휠체어 접근"],
    "assistive_devices": ["흰지팡이", "휠체어"],
    "emergency_contacts": [
      {
        "name": "김영희",
        "phone": "010-9876-5432",
        "relation": "가족"
      }
    ]
  }'
```

### 6. 동행 지원자 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "companion@example.com",
    "password": "SecurePass123!",
    "user_type": "companion",
    "name": "이영수",
    "nickname": "helper1",
    "supportable_disabilities": ["시각장애", "청각장애"],
    "experience_years": 3,
    "experience_description": "장애인 지원 봉사활동 3년 경험",
    "certifications": [
      {
        "name": "수어통역사 자격증",
        "issuer": "국립국어원"
      }
    ]
  }'
```

### 7. 로그인
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 8. 사용자 정보 조회 (인증 필요)
```bash
# 로그인에서 받은 access_token 사용
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9. 토큰 새로고침
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### 10. 로그아웃
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## 예상 응답

### 성공 응답
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "user": {
    "user_id": "uuid",
    "email": "test@example.com",
    "user_type": "general",
    "name": "홍길동",
    "nickname": "testuser",
    "account_status": "pending"
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지",
  "details": [
    {
      "field": "email",
      "message": "올바른 이메일 형식이 아닙니다."
    }
  ]
}
```

## 데이터베이스 확인

```sql
-- 생성된 사용자 확인
SELECT * FROM users;

-- 장애인 프로필 확인
SELECT * FROM disability_profiles;

-- 동행자 프로필 확인
SELECT * FROM companion_profiles;

-- 로그인 시도 기록 확인
SELECT * FROM login_attempts;
```

## 주의사항

1. **이메일 인증**: 현재 이메일 인증 시스템이 구현되지 않아 계정 상태가 'pending'으로 유지됩니다.
2. **비밀번호 정책**: 8자 이상, 대소문자, 숫자, 특수문자 포함 필수
3. **Rate Limiting**: API 호출은 15분당 100회로 제한됩니다.
4. **데이터베이스**: MySQL 8.0 이상 권장