const { sequelize, Review, ReviewImage } = require('./models/sequelize');

const migrateReviews = async () => {
  try {
    console.log('🔄 리뷰 관련 테이블 생성 중...');
    
    // 테이블 구조 업데이트 (새 테이블 추가)
    await sequelize.sync({ alter: true });
    
    console.log('✅ 리뷰 테이블 생성 완료!');
    console.log('📋 생성된 테이블:');
    console.log('  - reviews: 리뷰 데이터');
    console.log('  - review_images: 리뷰 이미지');
    
    // 테이블 구조 확인
    console.log('\n📊 reviews 테이블 구조:');
    const reviewTableInfo = await sequelize.query("DESCRIBE reviews");
    console.table(reviewTableInfo[0]);
    
    console.log('\n📊 review_images 테이블 구조:');
    const reviewImageTableInfo = await sequelize.query("DESCRIBE review_images");
    console.table(reviewImageTableInfo[0]);
    
    console.log('\n🎉 리뷰 시스템 준비 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 리뷰 테이블 생성 실패:', error);
    process.exit(1);
  }
};

migrateReviews();