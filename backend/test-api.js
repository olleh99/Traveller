const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api';
let tokens = {
  traveler: '',
  companion: '',
  general: ''
};

const testAccounts = {
  traveler: { email: 'traveler@test.com', password: 'test1234' },
  companion: { email: 'companion@test.com', password: 'test1234' },
  general: { email: 'general@test.com', password: 'test1234' }
};

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✅`,
    error: `${colors.red}❌`,
    warning: `${colors.yellow}⚠️`,
    info: `${colors.blue}ℹ️`
  };
  
  console.log(`${prefix[type] || prefix.info} ${message}${colors.reset}`);
}

// 1. 인증 테스트
async function testAuth() {
  console.log('\n=== 인증 시스템 테스트 ===');
  
  try {
    // 각 계정 타입별 로그인
    for (const [type, account] of Object.entries(testAccounts)) {
      const loginRes = await axios.post(`${API_URL}/auth/login`, account);
      tokens[type] = loginRes.data.token;
      log(`${type} 계정 로그인 성공`, 'success');
      
      // 사용자 정보 조회
      const meRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tokens[type]}` }
      });
      log(`${type} 사용자 정보 조회: ${meRes.data.user.name}`, 'info');
    }
  } catch (error) {
    log(`인증 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 2. 여행지 테스트
async function testDestinations() {
  console.log('\n=== 여행지 시스템 테스트 ===');
  
  try {
    // 전체 목록 조회
    const listRes = await axios.get(`${API_URL}/destinations`);
    log(`여행지 ${listRes.data.destinations.length}개 조회 완료`, 'success');
    
    // 검색 테스트
    const searchRes = await axios.get(`${API_URL}/destinations?search=서울`);
    log(`"서울" 검색 결과: ${searchRes.data.destinations.length}개`, 'success');
    
    // 카테고리 필터
    const categoryRes = await axios.get(`${API_URL}/destinations?category=attraction`);
    log(`관광지 카테고리: ${categoryRes.data.destinations.length}개`, 'success');
    
    // 접근성 필터
    const accessRes = await axios.get(`${API_URL}/destinations?accessibility=A`);
    log(`A급 접근성: ${accessRes.data.destinations.length}개`, 'success');
    
    // 상세 조회
    if (listRes.data.destinations.length > 0) {
      const destId = listRes.data.destinations[0].id;
      const detailRes = await axios.get(`${API_URL}/destinations/${destId}`);
      log(`여행지 상세 조회: ${detailRes.data.destination.name}`, 'success');
    }
  } catch (error) {
    log(`여행지 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 3. 리뷰 테스트
async function testReviews() {
  console.log('\n=== 리뷰 시스템 테스트 ===');
  
  try {
    // 여행지 목록 조회하여 첫 번째 여행지 ID 가져오기
    const destRes = await axios.get(`${API_URL}/destinations`);
    if (destRes.data.destinations.length === 0) {
      log('테스트할 여행지가 없습니다', 'warning');
      return;
    }
    
    const destinationId = destRes.data.destinations[0].id;
    
    // 리뷰 작성
    const reviewData = {
      destinationId,
      rating: 5,
      accessibilityRating: 4,
      mobilityRating: 5,
      facilityRating: 4,
      serviceRating: 5,
      content: '자동화 테스트로 작성된 리뷰입니다. 매우 만족스러운 여행지였습니다!'
    };
    
    const createRes = await axios.post(`${API_URL}/reviews`, reviewData, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`리뷰 작성 완료 (ID: ${createRes.data.review.id})`, 'success');
    
    // 리뷰 목록 조회
    const listRes = await axios.get(`${API_URL}/reviews/destination/${destinationId}`);
    log(`여행지 리뷰 ${listRes.data.reviews.length}개 조회`, 'success');
    
    // 도움됨 처리
    if (listRes.data.reviews.length > 0) {
      const reviewId = listRes.data.reviews[0].id;
      await axios.post(`${API_URL}/reviews/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${tokens.companion}` }
      });
      log('리뷰 도움됨 처리 완료', 'success');
    }
    
    // 사용자별 리뷰 조회
    const userReviewsRes = await axios.get(`${API_URL}/reviews/user/me`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`내 리뷰 ${userReviewsRes.data.reviews.length}개 조회`, 'success');
    
  } catch (error) {
    log(`리뷰 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 4. 즐겨찾기 테스트
async function testFavorites() {
  console.log('\n=== 즐겨찾기 시스템 테스트 ===');
  
  try {
    // 여행지 목록에서 ID 가져오기
    const destRes = await axios.get(`${API_URL}/destinations`);
    if (destRes.data.destinations.length === 0) {
      log('테스트할 여행지가 없습니다', 'warning');
      return;
    }
    
    const destinationId = destRes.data.destinations[0].id;
    
    // 즐겨찾기 토글
    const toggleRes = await axios.post(`${API_URL}/favorites/toggle`, 
      { destinationId },
      { headers: { Authorization: `Bearer ${tokens.traveler}` }}
    );
    log(`즐겨찾기 ${toggleRes.data.isFavorite ? '추가' : '제거'} 완료`, 'success');
    
    // 즐겨찾기 목록 조회
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    const userId = meRes.data.user.id;
    
    const listRes = await axios.get(`${API_URL}/favorites/user/${userId}`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`즐겨찾기 ${listRes.data.favorites.length}개 조회`, 'success');
    
  } catch (error) {
    log(`즐겨찾기 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 5. 여행 계획 테스트
async function testTravelPlans() {
  console.log('\n=== 여행 계획 시스템 테스트 ===');
  
  try {
    // 여행 계획 생성
    const planData = {
      title: '자동화 테스트 여행 계획',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '테스트를 위한 여행 계획입니다'
    };
    
    const createRes = await axios.post(`${API_URL}/travel-plans`, planData, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`여행 계획 생성 완료 (ID: ${createRes.data.travelPlan.id})`, 'success');
    
    // 여행지 추가
    const destRes = await axios.get(`${API_URL}/destinations`);
    if (destRes.data.destinations.length > 0) {
      const dayData = {
        dayNumber: 1,
        destinations: [
          {
            destinationId: destRes.data.destinations[0].id,
            orderIndex: 1,
            notes: '첫 번째 여행지'
          }
        ]
      };
      
      await axios.put(
        `${API_URL}/travel-plans/${createRes.data.travelPlan.id}/days/1`,
        dayData,
        { headers: { Authorization: `Bearer ${tokens.traveler}` }}
      );
      log('여행지 일정 추가 완료', 'success');
    }
    
    // 계획 목록 조회
    const listRes = await axios.get(`${API_URL}/travel-plans`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`여행 계획 ${listRes.data.travelPlans.length}개 조회`, 'success');
    
  } catch (error) {
    log(`여행 계획 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 6. 매칭 시스템 테스트
async function testMatching() {
  console.log('\n=== 동행인 매칭 시스템 테스트 ===');
  
  try {
    // 동행인 검색 (장애인 계정으로)
    const searchRes = await axios.get(`${API_URL}/matching/companions/search`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`동행인 ${searchRes.data.companions.length}명 검색`, 'success');
    
    if (searchRes.data.companions.length > 0) {
      // 매칭 요청 보내기
      const companionId = searchRes.data.companions[0].id;
      const requestData = {
        companionId,
        message: '자동화 테스트 매칭 요청입니다',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      const requestRes = await axios.post(`${API_URL}/matching/requests`, requestData, {
        headers: { Authorization: `Bearer ${tokens.traveler}` }
      });
      log(`매칭 요청 전송 완료 (ID: ${requestRes.data.request.id})`, 'success');
      
      // 받은 요청 조회 (동행인 계정으로)
      const receivedRes = await axios.get(`${API_URL}/matching/requests/received`, {
        headers: { Authorization: `Bearer ${tokens.companion}` }
      });
      log(`받은 매칭 요청 ${receivedRes.data.requests.length}개`, 'success');
      
      // 매칭 승인
      if (receivedRes.data.requests.length > 0) {
        const requestId = receivedRes.data.requests[0].id;
        await axios.put(
          `${API_URL}/matching/requests/${requestId}/respond`,
          { action: 'accept' },
          { headers: { Authorization: `Bearer ${tokens.companion}` }}
        );
        log('매칭 요청 승인 완료', 'success');
      }
    }
    
    // 내 매칭 목록 조회
    const matchesRes = await axios.get(`${API_URL}/matching/matches`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`활성 매칭 ${matchesRes.data.matches.length}개`, 'success');
    
  } catch (error) {
    log(`매칭 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 7. 메시징 테스트
async function testMessaging() {
  console.log('\n=== 메시징 시스템 테스트 ===');
  
  try {
    // 활성 매칭 조회
    const matchesRes = await axios.get(`${API_URL}/matching/matches`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    
    if (matchesRes.data.matches.length === 0) {
      log('활성 매칭이 없어 메시징 테스트를 건너뜁니다', 'warning');
      return;
    }
    
    const matchId = matchesRes.data.matches[0].id;
    
    // 메시지 전송
    const messageData = {
      content: '안녕하세요! 자동화 테스트 메시지입니다.'
    };
    
    const sendRes = await axios.post(
      `${API_URL}/messages/match/${matchId}`,
      messageData,
      { headers: { Authorization: `Bearer ${tokens.traveler}` }}
    );
    log('메시지 전송 완료', 'success');
    
    // 메시지 목록 조회
    const listRes = await axios.get(`${API_URL}/messages/match/${matchId}`, {
      headers: { Authorization: `Bearer ${tokens.companion}` }
    });
    log(`메시지 ${listRes.data.messages.length}개 조회`, 'success');
    
    // 읽지 않은 메시지 수
    const unreadRes = await axios.get(`${API_URL}/messages/match/${matchId}/unread`, {
      headers: { Authorization: `Bearer ${tokens.companion}` }
    });
    log(`읽지 않은 메시지: ${unreadRes.data.unreadCount}개`, 'info');
    
  } catch (error) {
    log(`메시징 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 8. 통계 테스트
async function testStatistics() {
  console.log('\n=== 사용자 통계 테스트 ===');
  
  try {
    // 활동 통계 조회
    const statsRes = await axios.get(`${API_URL}/users/profile-statistics`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    
    log('활동 통계:', 'info');
    log(`- 총 리뷰: ${statsRes.data.statistics.totalReviews}개`, 'info');
    log(`- 총 즐겨찾기: ${statsRes.data.statistics.totalFavorites}개`, 'info');
    log(`- 총 여행 계획: ${statsRes.data.statistics.totalTravelPlans}개`, 'info');
    
    // 최근 활동 조회
    const activitiesRes = await axios.get(`${API_URL}/users/recent-activities`, {
      headers: { Authorization: `Bearer ${tokens.traveler}` }
    });
    log(`최근 활동 ${activitiesRes.data.activities.length}개 조회`, 'success');
    
  } catch (error) {
    log(`통계 테스트 실패: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 메인 테스트 실행
async function runAllTests() {
  console.log(`${colors.blue}════════════════════════════════════════`);
  console.log(`${colors.blue}   Traveller API 자동화 테스트 시작`);
  console.log(`${colors.blue}════════════════════════════════════════${colors.reset}`);
  
  try {
    // 서버 상태 확인
    const healthRes = await axios.get(`${API_URL}/health`);
    log('서버 상태: 정상', 'success');
    
    // 순차적으로 테스트 실행
    await testAuth();
    await testDestinations();
    await testReviews();
    await testFavorites();
    await testTravelPlans();
    await testMatching();
    await testMessaging();
    await testStatistics();
    
    console.log(`\n${colors.green}════════════════════════════════════════`);
    console.log(`${colors.green}   모든 테스트가 완료되었습니다!`);
    console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}════════════════════════════════════════`);
    console.log(`${colors.red}   테스트 중 오류가 발생했습니다`);
    console.log(`${colors.red}════════════════════════════════════════${colors.reset}`);
    log(error.message, 'error');
  }
}

// 테스트 실행
runAllTests();