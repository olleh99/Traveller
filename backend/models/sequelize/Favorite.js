const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const Favorite = sequelize.define('Favorite', {
  favorite_id: {
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
    comment: '사용자 ID'
  },
  destination_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'destinations',
      key: 'id'
    },
    comment: '여행지 ID'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '개인 메모'
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['destination_id'] },
    { fields: ['user_id', 'destination_id'], unique: true, name: 'unique_user_destination_favorite' }
  ]
});

module.exports = Favorite;