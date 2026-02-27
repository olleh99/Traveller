const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const CompanionProfile = sequelize.define('CompanionProfile', {
  profile_id: {
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
    }
  },
  supportable_disabilities: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  experience_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  certifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  background_check_status: {
    type: DataTypes.ENUM('not_required', 'pending', 'approved', 'rejected'),
    defaultValue: 'not_required'
  },
  admin_review_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  admin_review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'companion_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['admin_review_status'] }
  ]
});

module.exports = CompanionProfile;