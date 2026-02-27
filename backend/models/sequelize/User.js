const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_type: {
    type: DataTypes.ENUM('disabled_traveler', 'companion', 'general'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'O'),
    allowNull: true
  },
  region_city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  region_district: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  profile_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  marketing_consent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  account_status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
    defaultValue: 'pending'
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['email'] },
    { fields: ['nickname'] },
    { fields: ['user_type'] },
    { fields: ['account_status'] }
  ]
});

// Instance methods
User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.updateLastLogin = async function() {
  this.last_login_at = new Date();
  await this.save();
};

User.prototype.updateEmailVerified = async function(verified = true) {
  this.email_verified = verified;
  this.account_status = verified ? 'active' : 'pending';
  await this.save();
};

// Static methods
User.createUser = async function(userData, options = {}) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const { password, ...userDataWithoutPassword } = userData;
  return await User.create({
    ...userDataWithoutPassword,
    password_hash: hashedPassword
  }, options);
};

User.findByEmail = async function(email) {
  return await User.findOne({ where: { email } });
};

User.findByNickname = async function(nickname) {
  return await User.findOne({ where: { nickname } });
};

User.emailExists = async function(email) {
  const count = await User.count({ where: { email } });
  return count > 0;
};

User.nicknameExists = async function(nickname) {
  const count = await User.count({ where: { nickname } });
  return count > 0;
};

// Hooks
User.beforeCreate(async (user) => {
  if (user.password && !user.password_hash) {
    user.password_hash = await bcrypt.hash(user.password, 10);
  }
});

// JSON 변환 시 민감한 정보 제외
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;