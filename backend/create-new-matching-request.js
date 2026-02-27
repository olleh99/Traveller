const { MatchingRequest, User, TravelPlan } = require('./models/sequelize');

async function createNewMatchingRequest() {
  try {
    console.log('🔄 새로운 매칭 요청 생성 중...\n');
    
    // 사용자 찾기
    const traveler = await User.findOne({ where: { email: 'traveler@test.com' } });
    const companion = await User.findOne({ where: { email: 'companion@test.com' } });
    
    if (!traveler || !companion) {
      console.error('❌ 테스트 계정이 없습니다. create-test-accounts.js를 먼저 실행하세요.');
      return;
    }
    
    // 기존 pending 요청 확인
    const existingPending = await MatchingRequest.findAll({
      where: {
        companion_id: companion.user_id,
        status: 'pending'
      }
    });
    
    console.log(`📋 현재 대기 중인 요청: ${existingPending.length}개`);
    
    // 새로운 여행 계획 생성
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + 7); // 일주일 후
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // 3일간
    
    const travelPlan = await TravelPlan.create({
      user_id: traveler.user_id,
      title: `서울 궁궐 투어 - ${now.toLocaleDateString()}`,
      description: '경복궁, 창덕궁 등 서울의 궁궐들을 방문하는 여행',
      start_date: startDate,
      end_date: endDate,
      budget: 200000,
      is_public: true,
      status: 'draft'
    });
    
    console.log(`✅ 새 여행 계획 생성: ${travelPlan.title}`);
    
    // 새로운 매칭 요청 생성
    const matchingRequest = await MatchingRequest.create({
      requester_id: traveler.user_id,
      companion_id: companion.user_id,
      travel_plan_id: travelPlan.plan_id,
      request_message: '서울 궁궐 투어를 함께 하실 동행인을 찾습니다. 휠체어 접근이 가능한 경로로 이동하고 싶습니다.',
      travel_start_date: startDate,
      travel_end_date: endDate,
      travel_destination: '서울특별시 종로구',
      travelers_count: 1,
      required_services: ['mobility_assistance', 'navigation_help'],
      special_requirements: '휠체어 접근 가능 경로, 경사로 확인 필요',
      status: 'pending'
    });
    
    console.log('\n✅ 새로운 매칭 요청 생성 완료!');
    console.log('================================');
    console.log(`📍 요청 ID: ${matchingRequest.request_id}`);
    console.log(`👤 요청자: ${traveler.name} (${traveler.email})`);
    console.log(`🤝 동행인: ${companion.name} (${companion.email})`);
    console.log(`📅 여행 기간: ${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`);
    console.log(`📍 여행지: ${matchingRequest.travel_destination}`);
    console.log(`📝 상태: ${matchingRequest.status} (대기 중)`);
    console.log('================================\n');
    
    console.log('📋 테스트 방법:');
    console.log('1. companion@test.com / test1234 로 로그인');
    console.log('2. "내 매칭" 페이지로 이동');
    console.log('3. "대기 중" 탭에서 매칭 요청 확인');
    console.log('4. "승인" 버튼 클릭하여 매칭 승인');
    console.log('5. "활성 매칭" 탭에서 메시지 기능 테스트');
    
  } catch (error) {
    console.error('❌ 매칭 요청 생성 실패:', error.message);
    if (error.errors) {
      error.errors.forEach(e => console.error('  -', e.message));
    }
  }
}

// 데이터베이스 연결 후 실행
const { initializeDatabase } = require('./models/sequelize');

initializeDatabase().then(() => {
  createNewMatchingRequest().then(() => {
    process.exit(0);
  });
}).catch(error => {
  console.error('데이터베이스 초기화 실패:', error);
  process.exit(1);
});