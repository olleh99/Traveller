const { User, DisabilityProfile, CompanionProfile } = require('./models/sequelize');
const bcrypt = require('bcrypt');

async function createTestAccounts() {
  try {
    console.log('테스트 계정 생성 시작...');
    
    // 1. 장애인 여행자 계정
    const travelerPassword = await bcrypt.hash('test1234', 10);
    const traveler = await User.create({
      email: 'traveler@test.com',
      password_hash: travelerPassword,
      user_type: 'disabled_traveler',
      name: '김여행',
      nickname: '여행러버',
      phone: '010-1111-2222',
      birth_date: '1990-05-15',
      gender: 'F',
      region_city: '서울특별시',
      region_district: '강남구',
      email_verified: true,
      account_status: 'active'
    });

    // 장애인 프로필 추가
    await DisabilityProfile.create({
      user_id: traveler.user_id,
      disability_type: 'mobility_impairment',
      severity_level: 'moderate',
      mobility_aid_type: 'wheelchair',
      special_requirements: '휠체어 접근 가능한 시설 필요'
    });

    console.log('✅ 장애인 여행자 계정 생성 완료');
    console.log(`   - 이메일: traveler@test.com`);
    console.log(`   - 비밀번호: test1234`);
    console.log(`   - 이름: 김여행`);

    // 2. 동행인 계정
    const companionPassword = await bcrypt.hash('test1234', 10);
    const companion = await User.create({
      email: 'companion@test.com',
      password_hash: companionPassword,
      user_type: 'companion',
      name: '이동행',
      nickname: '도움이',
      phone: '010-3333-4444',
      birth_date: '1985-08-20',
      gender: 'M',
      region_city: '서울특별시',
      region_district: '서초구',
      email_verified: true,
      account_status: 'active'
    });

    // 동행인 프로필 추가
    await CompanionProfile.create({
      user_id: companion.user_id,
      experience_years: 3,
      supportable_disabilities: ['mobility_impairment', 'visual_impairment'],
      certifications: ['장애인 도우미 자격증', '응급처치 자격증'],
      experience_description: '3년간 장애인 여행 도우미로 활동하며 다양한 경험을 쌓았습니다.',
      available_regions: ['서울특별시', '경기도'],
      hourly_rate: 15000,
      preferred_schedule: 'weekends',
      languages: ['korean', 'english']
    });

    console.log('✅ 동행인 계정 생성 완료');
    console.log(`   - 이메일: companion@test.com`);
    console.log(`   - 비밀번호: test1234`);
    console.log(`   - 이름: 이동행`);

    // 3. 일반 사용자 계정
    const generalPassword = await bcrypt.hash('test1234', 10);
    const general = await User.create({
      email: 'general@test.com',
      password_hash: generalPassword,
      user_type: 'general',
      name: '박일반',
      nickname: '일반유저',
      phone: '010-5555-6666',
      birth_date: '1992-03-10',
      gender: 'M',
      region_city: '부산광역시',
      region_district: '해운대구',
      email_verified: true,
      account_status: 'active'
    });

    console.log('✅ 일반 사용자 계정 생성 완료');
    console.log(`   - 이메일: general@test.com`);
    console.log(`   - 비밀번호: test1234`);
    console.log(`   - 이름: 박일반`);

    console.log('\n🎉 모든 테스트 계정 생성 완료!');
    console.log('\n📋 테스트 계정 요약:');
    console.log('1. 장애인 여행자: traveler@test.com / test1234');
    console.log('2. 동행인: companion@test.com / test1234');
    console.log('3. 일반 사용자: general@test.com / test1234');

  } catch (error) {
    console.error('❌ 테스트 계정 생성 실패:', error);
  }
}

// 데이터베이스 연결 후 계정 생성
const { initializeDatabase } = require('./models/sequelize');

initializeDatabase().then(() => {
  createTestAccounts().then(() => {
    process.exit(0);
  });
}).catch(error => {
  console.error('데이터베이스 초기화 실패:', error);
  process.exit(1);
});