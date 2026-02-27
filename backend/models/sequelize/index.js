const { sequelize } = require('../../config/sequelize');

// 기존 모델들
const User = require('./User');
const DisabilityProfile = require('./DisabilityProfile');
const CompanionProfile = require('./CompanionProfile');

// 새 모델 (단계별 추가)
const Destination = require('./Destination');
const Review = require('./Review');
const ReviewImage = require('./ReviewImage');
const Favorite = require('./Favorite');

// 여행 계획 관련 모델
const TravelPlan = require('./TravelPlan');
const PlanDay = require('./PlanDay');
const PlanDestination = require('./PlanDestination');

// 매칭 시스템 관련 모델
const MatchingRequest = require('./MatchingRequest');
const CompanionMatch = require('./CompanionMatch');
const CompanionMessage = require('./CompanionMessage');

// 알림 시스템 모델
const Notification = require('./Notification')(sequelize);

// 기존 연관관계 설정 (원래대로 복구)
User.hasOne(DisabilityProfile, {
  foreignKey: 'user_id',
  as: 'disabilityProfile',
  onDelete: 'CASCADE'
});

User.hasOne(CompanionProfile, {
  foreignKey: 'user_id', 
  as: 'companionProfile',
  onDelete: 'CASCADE'
});

DisabilityProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

CompanionProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Review 관련 관계 설정
User.hasMany(Review, {
  foreignKey: 'user_id',
  as: 'reviews',
  onDelete: 'CASCADE'
});

Review.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Destination.hasMany(Review, {
  foreignKey: 'destination_id',
  as: 'reviews',
  onDelete: 'CASCADE'
});

Review.belongsTo(Destination, {
  foreignKey: 'destination_id',
  as: 'destination'
});

Review.hasMany(ReviewImage, {
  foreignKey: 'review_id',
  as: 'images',
  onDelete: 'CASCADE'
});

ReviewImage.belongsTo(Review, {
  foreignKey: 'review_id',
  as: 'review'
});

// Favorite 관련 관계 설정
User.hasMany(Favorite, {
  foreignKey: 'user_id',
  as: 'favorites',
  onDelete: 'CASCADE'
});

Favorite.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Destination.hasMany(Favorite, {
  foreignKey: 'destination_id',
  as: 'favorites',
  onDelete: 'CASCADE'
});

Favorite.belongsTo(Destination, {
  foreignKey: 'destination_id',
  as: 'destination'
});

// 여행 계획 관련 관계 설정
User.hasMany(TravelPlan, {
  foreignKey: 'user_id',
  as: 'travelPlans',
  onDelete: 'CASCADE'
});

TravelPlan.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

TravelPlan.hasMany(PlanDay, {
  foreignKey: 'plan_id',
  as: 'planDays',
  onDelete: 'CASCADE'
});

PlanDay.belongsTo(TravelPlan, {
  foreignKey: 'plan_id',
  as: 'travelPlan'
});

PlanDay.hasMany(PlanDestination, {
  foreignKey: 'day_id',
  as: 'planDestinations',
  onDelete: 'CASCADE'
});

PlanDestination.belongsTo(PlanDay, {
  foreignKey: 'day_id',
  as: 'planDay'
});

PlanDestination.belongsTo(Destination, {
  foreignKey: 'destination_id',
  as: 'destination',
  constraints: false
});

Destination.hasMany(PlanDestination, {
  foreignKey: 'destination_id',
  as: 'planDestinations',
  constraints: false
});

// 숙소 관계 (PlanDay -> Destination) - 외래키 제약조건 없이
PlanDay.belongsTo(Destination, {
  foreignKey: 'accommodation_id',
  as: 'accommodation',
  constraints: false
});

// 매칭 시스템 관계 설정
// MatchingRequest 관계
User.hasMany(MatchingRequest, {
  foreignKey: 'requester_id',
  as: 'sentMatchingRequests',
  onDelete: 'CASCADE'
});

User.hasMany(MatchingRequest, {
  foreignKey: 'companion_id', 
  as: 'receivedMatchingRequests',
  onDelete: 'CASCADE'
});

MatchingRequest.belongsTo(User, {
  foreignKey: 'requester_id',
  as: 'requester'
});

MatchingRequest.belongsTo(User, {
  foreignKey: 'companion_id',
  as: 'companion'
});

MatchingRequest.belongsTo(TravelPlan, {
  foreignKey: 'travel_plan_id',
  as: 'travelPlan',
  constraints: false
});

// CompanionMatch 관계
User.hasMany(CompanionMatch, {
  foreignKey: 'traveler_id',
  as: 'travelerMatches',
  onDelete: 'CASCADE'
});

User.hasMany(CompanionMatch, {
  foreignKey: 'companion_id',
  as: 'companionMatches', 
  onDelete: 'CASCADE'
});

CompanionMatch.belongsTo(User, {
  foreignKey: 'traveler_id',
  as: 'traveler'
});

CompanionMatch.belongsTo(User, {
  foreignKey: 'companion_id',
  as: 'companion'
});

CompanionMatch.belongsTo(TravelPlan, {
  foreignKey: 'travel_plan_id',
  as: 'travelPlan',
  constraints: false
});

CompanionMatch.belongsTo(MatchingRequest, {
  foreignKey: 'matching_request_id',
  as: 'matchingRequest'
});

// CompanionMessage 관계
CompanionMatch.hasMany(CompanionMessage, {
  foreignKey: 'match_id',
  as: 'messages',
  onDelete: 'CASCADE'
});

CompanionMessage.belongsTo(CompanionMatch, {
  foreignKey: 'match_id',
  as: 'match'
});

CompanionMessage.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

CompanionMessage.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver'
});

// Notification 관계 설정
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications',
  onDelete: 'CASCADE'
});

Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// 새 모델들 (나중에 점진적으로 추가)
// const Destination = require('./Destination')(sequelize);
// const Accessibility = require('./Accessibility')(sequelize);
// const Amenity = require('./Amenity')(sequelize);
// const DestinationImage = require('./DestinationImage')(sequelize);
// const Review = require('./Review')(sequelize);
// const ReviewImage = require('./ReviewImage')(sequelize);

// Initialize database
const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Sync all models (create tables)
    await sequelize.sync({ force: false });
    console.log('✓ Database tables synchronized');
    
    // Show created tables
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('📋 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  DisabilityProfile,
  CompanionProfile,
  Destination,
  Review,
  ReviewImage,
  Favorite,
  TravelPlan,
  PlanDay,
  PlanDestination,
  MatchingRequest,
  CompanionMatch,
  CompanionMessage,
  Notification,
  initializeDatabase
};