const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const CompanionMessage = sequelize.define('CompanionMessage', {
  message_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  match_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '매칭 ID (CompanionMatch)'
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '메시지 발신자 ID'
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '메시지 수신자 ID'
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'location', 'system'),
    allowNull: false,
    defaultValue: 'text',
    comment: '메시지 타입'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '메시지 내용'
  },
  attachment_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '첨부파일 URL (이미지 등)'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '읽음 여부'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '읽은 시간'
  },
  // 메타데이터
  is_deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '삭제 여부'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '삭제 시간'
  }
}, {
  tableName: 'companion_messages',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['match_id']
    },
    {
      fields: ['sender_id']
    },
    {
      fields: ['receiver_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_read']
    }
  ]
});

module.exports = CompanionMessage;