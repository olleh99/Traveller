const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const DisabilityProfile = sequelize.define('DisabilityProfile', {
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
  disability_types: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  support_needs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  assistive_devices: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  emergency_contacts: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'disability_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] }
  ]
});

module.exports = DisabilityProfile;