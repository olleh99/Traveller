const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const Destination = sequelize.define('Destination', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '여행지명'
  },
  category: {
    type: DataTypes.ENUM(
      'attraction',      // 관광지
      'restaurant',      // 음식점
      'accommodation',   // 숙박시설
      'shopping',        // 쇼핑
      'cultural',        // 문화시설
      'other'            // 기타
    ),
    allowNull: false,
    comment: '여행지 카테고리'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '여행지 설명'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '주소'
  },
  region: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '지역 (서울, 부산, 제주 등)'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '전화번호'
  },
  // 지도 좌표
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: '위도'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: '경도'
  },
  // 접근성 정보
  accessibilityLevel: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: true,
    defaultValue: 'B',
    comment: '접근성 등급 (A:매우좋음, B:좋음, C:보통, D:어려움)'
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '편의시설 목록 (wheelchair, parking, toilet, elevator, guide, braille 등)'
  },
  // 추가 정보
  website: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '웹사이트 URL'
  },
  opening_hours: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '영업시간 정보'
  },
  admission_fee: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '입장료 정보'
  },
  // 상태
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '활성화 여부'
  }
}, {
  tableName: 'destinations',
  timestamps: true,
  underscored: true
});

module.exports = Destination;