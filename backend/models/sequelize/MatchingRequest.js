const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const MatchingRequest = sequelize.define('MatchingRequest', {
  request_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requester_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '매칭을 요청한 사용자 ID (장애인 여행자)'
  },
  companion_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '매칭 대상 동행인 ID'
  },
  travel_plan_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: '관련 여행 계획 ID (선택사항)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '매칭 상태'
  },
  request_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '매칭 요청 메시지'
  },
  response_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '동행인의 응답 메시지'
  },
  // 여행 관련 정보
  travel_start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '여행 시작일'
  },
  travel_end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '여행 종료일'
  },
  travel_destination: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '여행 목적지'
  },
  travelers_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '전체 여행 인원수'
  },
  // 매칭 조건
  required_services: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '필요한 동행 서비스 (이동 보조, 의사소통 지원 등)'
  },
  special_requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '특별 요구사항'
  },
  // 일정 관련
  requested_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '요청 일시'
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '응답 일시'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '요청 만료 일시 (7일 후 자동 만료)'
  }
}, {
  tableName: 'matching_requests',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['requester_id']
    },
    {
      fields: ['companion_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['travel_start_date']
    }
  ]
});

module.exports = MatchingRequest;