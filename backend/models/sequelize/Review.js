const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const Review = sequelize.define('Review', {
  review_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    },
    comment: '리뷰 작성자'
  },
  destination_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'destinations',
      key: 'id'
    },
    comment: '리뷰 대상 여행지'
  },
  
  // 기본 평점
  overall_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    validate: {
      min: 1.0,
      max: 5.0
    },
    comment: '전체 평점 (1.0-5.0)'
  },
  
  // 접근성 관련 세부 평점
  accessibility_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 1.0,
      max: 5.0
    },
    comment: '접근성 평점'
  },
  mobility_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 1.0,
      max: 5.0
    },
    comment: '이동 편의성 평점'
  },
  facility_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 1.0,
      max: 5.0
    },
    comment: '시설 편의성 평점'
  },
  service_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 1.0,
      max: 5.0
    },
    comment: '서비스 평점'
  },
  
  // 리뷰 내용
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '리뷰 제목'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '리뷰 내용'
  },
  
  // 접근성 관련 세부 정보
  accessibility_features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '접근성 기능 (휠체어 접근, 점자 안내 등)'
  },
  accessibility_issues: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '접근성 문제점'
  },
  helpful_tips: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '유용한 팁'
  },
  
  // 방문 정보
  visit_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '방문 날짜'
  },
  visit_purpose: {
    type: DataTypes.ENUM('leisure', 'business', 'medical', 'education', 'other'),
    allowNull: true,
    comment: '방문 목적'
  },
  companion_type: {
    type: DataTypes.ENUM('alone', 'family', 'friend', 'caregiver', 'group'),
    allowNull: true,
    comment: '동반자 유형'
  },
  
  // 추천 여부
  would_recommend: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    comment: '추천 여부'
  },
  
  // 리뷰 상태
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'hidden'),
    defaultValue: 'pending',
    comment: '리뷰 상태'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '관리자 메모'
  },
  
  // 도움됨 카운트
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '도움됨 수'
  },
  report_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '신고 수'
  }
  
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['destination_id'] },
    { fields: ['overall_rating'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['destination_id', 'status'] },
    { 
      fields: ['user_id', 'destination_id'], 
      unique: true,
      name: 'unique_user_destination_review'
    }
  ]
});

module.exports = Review;