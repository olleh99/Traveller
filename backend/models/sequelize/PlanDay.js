const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const PlanDay = sequelize.define('PlanDay', {
  day_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '일정 날짜 고유 ID'
  },
  plan_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '여행 계획 ID',
    references: {
      model: 'travel_plans',
      key: 'plan_id'
    }
  },
  day_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '여행 일차 (1일차, 2일차...)'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '해당 날짜'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '일차별 제목'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '일차별 메모'
  },
  accommodation_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '숙소 ID (destinations 테이블 참조)'
  },
  accommodation_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '숙소 관련 메모'
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
  tableName: 'plan_days',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['plan_id', 'day_number'],
      unique: true
    },
    {
      fields: ['date']
    }
  ]
});

module.exports = PlanDay;