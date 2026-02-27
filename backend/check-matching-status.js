const { MatchingRequest, User, CompanionMatch } = require('./models/sequelize');

async function checkMatchingStatus() {
  try {
    console.log('=== 매칭 요청 현황 확인 ===\n');
    
    // 모든 매칭 요청 조회
    const allRequests = await MatchingRequest.findAll({
      include: [
        { model: User, as: 'requester', attributes: ['name', 'email'] },
        { model: User, as: 'companion', attributes: ['name', 'email'] }
      ]
    });
    
    console.log(`총 ${allRequests.length}개의 매칭 요청\n`);
    
    allRequests.forEach(req => {
      console.log(`ID: ${req.request_id}`);
      console.log(`요청자: ${req.requester.name} (${req.requester.email})`);
      console.log(`동행인: ${req.companion.name} (${req.companion.email})`);
      console.log(`상태: ${req.status}`);
      console.log(`생성일: ${req.created_at}`);
      console.log('---');
    });
    
    // 활성 매칭 조회
    const activeMatches = await CompanionMatch.findAll({
      include: [
        { model: User, as: 'traveler', attributes: ['name', 'email'] },
        { model: User, as: 'companion', attributes: ['name', 'email'] }
      ]
    });
    
    console.log(`\n=== 활성 매칭 현황 ===`);
    console.log(`총 ${activeMatches.length}개의 활성 매칭\n`);
    
    activeMatches.forEach(match => {
      console.log(`매칭 ID: ${match.match_id}`);
      console.log(`여행자: ${match.traveler.name} (${match.traveler.email})`);
      console.log(`동행인: ${match.companion.name} (${match.companion.email})`);
      console.log(`상태: ${match.status}`);
      console.log('---');
    });
    
    // companion@test.com 사용자 찾기
    const companion = await User.findOne({ where: { email: 'companion@test.com' } });
    if (companion) {
      console.log(`\n=== companion@test.com의 받은 요청 ===`);
      const receivedRequests = await MatchingRequest.findAll({
        where: { 
          companion_id: companion.user_id,
          status: 'pending'
        },
        include: [
          { model: User, as: 'requester', attributes: ['name', 'email'] }
        ]
      });
      
      console.log(`받은 요청: ${receivedRequests.length}개`);
      receivedRequests.forEach(req => {
        console.log(`- ${req.requester.name}님으로부터 요청 (ID: ${req.request_id})`);
      });
    }
    
  } catch (error) {
    console.error('오류:', error);
  }
  
  process.exit(0);
}

// 데이터베이스 연결 후 실행
const { initializeDatabase } = require('./models/sequelize');

initializeDatabase().then(() => {
  checkMatchingStatus();
}).catch(error => {
  console.error('DB 초기화 실패:', error);
  process.exit(1);
});