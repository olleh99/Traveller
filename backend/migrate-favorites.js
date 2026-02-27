const { sequelize } = require('./models/sequelize');

const migrateFavorites = async () => {
  try {
    console.log('🔄 즐겨찾기 테이블 생성 중...');
    
    // 테이블 구조 업데이트 (새 테이블 추가)
    await sequelize.sync({ alter: true });
    
    console.log('✅ 즐겨찾기 테이블 생성 완료!');
    console.log('📋 생성된 테이블:');
    console.log('  - favorites: 사용자별 즐겨찾기 데이터');
    
    // 테이블 구조 확인
    console.log('\n📊 favorites 테이블 구조:');
    const favoritesTableInfo = await sequelize.query("DESCRIBE favorites");
    console.table(favoritesTableInfo[0]);
    
    console.log('\n🎉 즐겨찾기 시스템 준비 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 즐겨찾기 테이블 생성 실패:', error);
    process.exit(1);
  }
};

migrateFavorites();