const { initializeDatabase } = require('./models/sequelize');
const { Destination } = require('./models/sequelize');

// 주요 여행지들의 좌표 데이터 (위도, 경도)
const coordinatesData = {
  '남산 N서울타워': { latitude: 37.5512, longitude: 126.9882 },
  '여수 엑스포 해양공원': { latitude: 34.7604, longitude: 127.6622 },
  '제주 우도': { latitude: 33.5009, longitude: 126.9509 },
  '경주 불국사': { latitude: 35.7898, longitude: 129.3320 },
  '부산 해운대 해수욕장': { latitude: 35.1588, longitude: 129.1603 },
  '전주 한옥마을': { latitude: 35.8150, longitude: 127.1530 }
};

const addCoordinates = async () => {
  try {
    // DB 초기화
    await initializeDatabase();
    
    console.log('📍 여행지 좌표 데이터 추가 시작...');
    
    // 모든 여행지 조회
    const destinations = await Destination.findAll();
    
    for (const destination of destinations) {
      const coords = coordinatesData[destination.name];
      
      if (coords) {
        await destination.update({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        
        console.log(`✅ ${destination.name}: (${coords.latitude}, ${coords.longitude}) 추가됨`);
      } else {
        console.log(`⚠️  ${destination.name}: 좌표 데이터 없음`);
      }
    }
    
    console.log('\n📋 좌표 추가 완료! 결과 확인:');
    
    // 결과 확인
    const updatedDestinations = await Destination.findAll({
      attributes: ['name', 'latitude', 'longitude'],
      where: { is_active: true }
    });
    
    updatedDestinations.forEach(dest => {
      console.log(`- ${dest.name}: (${dest.latitude}, ${dest.longitude})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 좌표 추가 실패:', error);
    process.exit(1);
  }
};

addCoordinates();