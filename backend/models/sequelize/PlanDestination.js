const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const PlanDestination = sequelize.define('PlanDestination', {
  plan_destination_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: '계획 여행지 고유 ID'
  },
  day_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '일정 날짜 ID',
    references: {
      model: 'plan_days',
      key: 'day_id'
    }
  },
  destination_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '여행지 ID'
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '방문 순서'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: '방문 시작 시간'
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: '방문 종료 시간'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '예상 소요 시간 (분)'
  },
  transportation_mode: {
    type: DataTypes.ENUM('car', 'public', 'taxi', 'walk', 'wheelchair_taxi', 'other'),
    defaultValue: 'public',
    comment: '이동 수단'
  },
  transportation_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '이동 관련 메모'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '여행지별 메모'
  },
  is_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '확정 여부'
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
  tableName: 'plan_destinations',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['day_id', 'order_index']
    },
    {
      fields: ['destination_id']
    }
  ]
});

module.exports = PlanDestination;