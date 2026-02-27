const { sequelize } = require('./models/sequelize');
const { Destination } = require('./models/sequelize');

const migrateAccessibility = async () => {
  try {
    console.log('🔄 접근성 정보 관련 컬럼 추가 중...');
    
    // 테이블 구조 업데이트 (새 컬럼 추가)
    await sequelize.sync({ alter: true });
    
    console.log('✅ 테이블 구조 업데이트 완료!');
    console.log('📍 추가된 컬럼:');
    console.log('  - accessibilityLevel: 접근성 등급 (A/B/C/D)');
    console.log('  - amenities: 편의시설 목록 (JSON)');
    console.log('  - website: 웹사이트 URL');
    console.log('  - opening_hours: 영업시간 정보 (JSON)');
    console.log('  - admission_fee: 입장료 정보');
    
    // 기존 여행지들에 기본 접근성 정보 추가
    const destinations = await Destination.findAll();
    
    console.log('\n📋 기존 여행지에 샘플 데이터 추가 중...');
    
    for (const destination of destinations) {
      // 여행지별 샘플 데이터 설정
      let updateData = {
        accessibilityLevel: 'B', // 기본값
        amenities: []
      };
      
      // 각 여행지별 맞춤 데이터
      if (destination.name.includes('남산')) {
        updateData.accessibilityLevel = 'A';
        updateData.amenities = ['wheelchair', 'elevator', 'parking', 'toilet', 'guide'];
        updateData.opening_hours = {
          mon: '10:00-23:00',
          tue: '10:00-23:00',
          wed: '10:00-23:00',
          thu: '10:00-23:00',
          fri: '10:00-23:00',
          sat: '10:00-24:00',
          sun: '10:00-24:00'
        };
        updateData.admission_fee = '성인 16,000원, 어린이 13,000원';
        updateData.website = 'https://www.nseoultower.co.kr';
      } else if (destination.name.includes('여수')) {
        updateData.accessibilityLevel = 'A';
        updateData.amenities = ['wheelchair', 'parking', 'toilet', 'guide'];
        updateData.opening_hours = {
          always: '24시간 개방'
        };
        updateData.admission_fee = '무료';
      } else if (destination.name.includes('우도')) {
        updateData.accessibilityLevel = 'C';
        updateData.amenities = ['parking', 'toilet'];
        updateData.opening_hours = {
          summer: '08:00-18:00',
          winter: '09:00-17:00'
        };
        updateData.admission_fee = '무료 (페리 요금 별도)';
      } else if (destination.name.includes('불국사')) {
        updateData.accessibilityLevel = 'B';
        updateData.amenities = ['wheelchair', 'parking', 'toilet', 'guide', 'braille'];
        updateData.opening_hours = {
          mar_sep: '07:00-18:00',
          oct_feb: '07:30-17:30'
        };
        updateData.admission_fee = '성인 6,000원, 청소년 4,000원, 어린이 3,000원';
        updateData.website = 'http://www.bulguksa.or.kr';
      } else if (destination.name.includes('해운대')) {
        updateData.accessibilityLevel = 'A';
        updateData.amenities = ['wheelchair', 'parking', 'toilet', 'beach_wheelchair'];
        updateData.opening_hours = {
          always: '24시간 개방'
        };
        updateData.admission_fee = '무료';
      } else if (destination.name.includes('전주')) {
        updateData.accessibilityLevel = 'B';
        updateData.amenities = ['wheelchair', 'parking', 'toilet', 'guide'];
        updateData.opening_hours = {
          always: '24시간 개방'
        };
        updateData.admission_fee = '무료';
        updateData.website = 'https://hanok.jeonju.go.kr';
      }
      
      await destination.update(updateData);
      console.log(`✅ ${destination.name}: 접근성 정보 추가됨`);
    }
    
    console.log('\n🎉 접근성 정보 마이그레이션 완료!');
    
    // 업데이트된 데이터 확인
    const updatedDestinations = await Destination.findAll({
      attributes: ['name', 'accessibilityLevel', 'amenities']
    });
    
    console.log('\n📊 업데이트 결과:');
    updatedDestinations.forEach(dest => {
      console.log(`- ${dest.name}: ${dest.accessibilityLevel}급, 편의시설 ${dest.amenities.length}개`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
};

migrateAccessibility();