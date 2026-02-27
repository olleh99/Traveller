const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const TravelPlan = sequelize.define('TravelPlan', {
  plan_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '여행 계획 고유 ID'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '작성자 ID',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '여행 계획 제목'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '여행 계획 설명'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '여행 시작일'
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '여행 종료일'
  },
  travelers_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '여행 인원수'
  },
  has_disabled_member: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '장애인 동행 여부'
  },
  accessibility_requirements: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: '접근성 요구사항 (휠체어, 시각장애 지원 등)'
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: '예상 예산'
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'draft',
    comment: '계획 상태'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '공개 여부'
  },
  share_token: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true,
    comment: '공유 링크용 토큰'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'travel_plans',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['start_date', 'end_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['share_token']
    }
  ]
});

module.exports = TravelPlan;