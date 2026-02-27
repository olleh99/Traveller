const { sequelize } = require('./config/sequelize');
const { Notification } = require('./models/sequelize');

async function fixNotificationTable() {
  try {
    console.log('🔧 Notification 테이블 최종 수정 중...\n');
    
    // 테이블 재생성 (기존 데이터는 삭제됨)
    await Notification.sync({ force: true });
    
    console.log('✅ Notification 테이블이 올바르게 재생성되었습니다.');
    console.log('📋 필드 매핑:');
    console.log('   - 모델: userId');
    console.log('   - DB 컬럼: user_id');
    console.log('   - Helper 메서드: userId 사용');
    console.log('\n이제 매칭 승인이 정상적으로 작동할 것입니다!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

fixNotificationTable();