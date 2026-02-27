const { MatchingRequest, User, TravelPlan } = require('./models/sequelize');

async function createTestMatching() {
  try {
    console.log('테스트 매칭 요청 생성 시작...');
    
    // 사용자 찾기
    const traveler = await User.findOne({ where: { email: 'traveler@test.com' } });
    const companion = await User.findOne({ where: { email: 'companion@test.com' } });
    
    if (!traveler || !companion) {
      console.error('테스트 계정이 없습니다.');
      return;
    }
    
    console.log(`장애인 여행자: ${traveler.name} (${traveler.user_id})`);
    console.log(`동행인: ${companion.name} (${companion.user_id})`);
    
    // 간단한 여행 계획 생성
    const travelPlan = await TravelPlan.create({
      user_id: traveler.user_id,
      title: '제주도 여행 계획',
      description: '제주도 우도 방문',
      start_date: new Date('2025-09-01'),
      end_date: new Date('2025-09-03'),
      budget: 500000,
      is_public: true,
      status: 'draft'
    });
    
    console.log(`여행 계획 생성: ${travelPlan.title}`);
    
    // 매칭 요청 생성
    const matchingRequest = await MatchingRequest.create({
      requester_id: traveler.user_id,
      companion_id: companion.user_id,
      travel_plan_id: travelPlan.plan_id,
      request_message: '제주도 우도 여행 동행 부탁드립니다. 휠체어를 사용하여 접근성이 좋은 곳들을 방문하고 싶습니다.',
      travel_start_date: new Date('2025-09-01'),
      travel_end_date: new Date('2025-09-03'),
      travel_destination: '제주특별자치도 우도면',
      travelers_count: 1,
      required_services: ['mobility_assistance', 'navigation_help'],
      special_requirements: '휠체어 접근 가능한 시설 필요',
      status: 'pending'
    });
    
    console.log('✅ 매칭 요청 생성 완료');
    console.log(`   - 요청자: ${traveler.name}`);
    console.log(`   - 동행인: ${companion.name}`);
    console.log(`   - 여행지: ${matchingRequest.travel_destination}`);
    console.log(`   - 상태: ${matchingRequest.status}`);
    
    console.log('\n🎉 테스트 매칭 요청 생성 완료!');
    console.log('\n📋 테스트 방법:');
    console.log('1. companion@test.com으로 로그인');
    console.log('2. "내 매칭" 페이지에서 대기 중 탭 확인');
    console.log('3. 매칭 요청 승인');
    console.log('4. 활성 매칭 탭에서 메시지 기능 테스트');

  } catch (error) {
    console.error('❌ 테스트 매칭 요청 생성 실패:', error);
  }
}

// 데이터베이스 연결 후 실행
const { initializeDatabase } = require('./models/sequelize');

initializeDatabase().then(() => {
  createTestMatching().then(() => {
    process.exit(0);
  });
}).catch(error => {
  console.error('데이터베이스 초기화 실패:', error);
  process.exit(1);
});