const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const ReviewImage = sequelize.define('ReviewImage', {
  image_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  review_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'reviews',
      key: 'review_id'
    },
    comment: '리뷰 ID'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '이미지 URL'
  },
  image_type: {
    type: DataTypes.ENUM('accessibility', 'facility', 'general'),
    allowNull: false,
    comment: '이미지 타입'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '이미지 설명'
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '표시 순서'
  }
}, {
  tableName: 'review_images',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['review_id'] },
    { fields: ['image_type'] },
    { fields: ['review_id', 'display_order'] }
  ]
});

module.exports = ReviewImage;