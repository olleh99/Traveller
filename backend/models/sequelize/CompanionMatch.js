const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const CompanionMatch = sequelize.define('CompanionMatch', {
  match_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  traveler_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '장애인 여행자 ID'
  },
  companion_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '동행인 ID'
  },
  travel_plan_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '관련 여행 계획 ID'
  },
  matching_request_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '원본 매칭 요청 ID'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
    comment: '매칭 상태'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '동행 시작일'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '동행 종료일'
  },
  // 평가 관련
  traveler_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 1.0,
      max: 5.0
    },
    comment: '여행자가 동행인에게 준 평점'
  },
  companion_rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 1.0,
      max: 5.0
    },
    comment: '동행인이 여행자에게 준 평점'
  },
  traveler_review: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '여행자 리뷰'
  },
  companion_review: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '동행인 리뷰'
  },
  // 메타데이터
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '특이사항 메모'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '동행 완료 일시'
  }
}, {
  tableName: 'companion_matches',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['traveler_id']
    },
    {
      fields: ['companion_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['start_date']
    },
    {
      unique: true,
      fields: ['traveler_id', 'companion_id', 'start_date']
    }
  ]
});

module.exports = CompanionMatch;