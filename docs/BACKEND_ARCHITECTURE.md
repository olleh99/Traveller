# Backend 아키텍처 상세 문서

## 개요
Traveller 백엔드는 Node.js와 Express.js 기반의 RESTful API 서버입니다. MySQL 데이터베이스와 Socket.io를 활용한 실시간 통신을 지원하며, JWT 인증과 다양한 보안 미들웨어로 안전한 서비스를 제공합니다.

## 기술 스택 상세

### Core Technologies
- **Node.js 18+**: JavaScript 런타임 환경
- **Express.js 4.18+**: 웹 애플리케이션 프레임워크
- **Sequelize 6.32+**: MySQL ORM (Object-Relational Mapping)
- **MySQL 8.0+**: 관계형 데이터베이스
- **Socket.io 4.7+**: 실시간 양방향 통신

### Supporting Libraries
- **bcrypt 5.1+**: 비밀번호 해싱
- **jsonwebtoken 9.0+**: JWT 토큰 생성/검증
- **multer 1.4+**: 파일 업로드 처리
- **helmet 7.0+**: 보안 헤더 설정
- **cors 2.8+**: CORS 정책 관리
- **express-rate-limit 6.8+**: API 요청 제한
- **winston 3.10+**: 로깅 시스템

## 프로젝트 구조

```
backend/
├── config/              # 설정 파일
│   ├── sequelize.js    # 데이터베이스 설정
│   ├── socket.js       # Socket.io 설정
│   └── redis.js        # Redis 설정 (예정)
├── controllers/         # 비즈니스 로직 컨트롤러
│   ├── authController.js
│   ├── userController.js
│   ├── travelPlanController.js
│   ├── destinationController.js
│   ├── reviewController.js
│   ├── matchingController.js
│   ├── messageController.js
│   ├── notificationController.js
│   ├── favoriteController.js
│   └── planDayController.js
├── middleware/          # Express 미들웨어
│   ├── auth.js         # 인증 미들웨어
│   └── validation.js   # 입력 검증 미들웨어
├── models/             # 데이터베이스 모델
│   └── sequelize/      # Sequelize 모델
│       ├── index.js    # 모델 연결 및 관계 설정
│       ├── User.js
│       ├── DisabilityProfile.js
│       ├── TravelPlan.js
│       ├── PlanDay.js
│       ├── PlanDestination.js
│       ├── Destination.js
│       ├── Review.js
│       ├── ReviewImage.js
│       ├── Favorite.js
│       ├── CompanionMatch.js
│       ├── MatchingRequest.js
│       ├── CompanionMessage.js
│       └── Notification.js
├── routes/             # API 라우트 정의
│   ├── auth.js
│   ├── user.js
│   ├── travelPlans.js
│   ├── destination.js
│   ├── reviews.js
│   ├── matching.js
│   ├── messages.js
│   ├── notifications.js
│   └── favorites.js
├── utils/              # 유틸리티 함수
│   ├── errorHandler.js # 에러 처리
│   ├── jwt.js          # JWT 유틸리티
│   └── validation.js   # 검증 헬퍼
├── uploads/            # 업로드된 파일
│   ├── profiles/       # 프로필 이미지
│   ├── reviews/        # 리뷰 이미지
│   └── destinations/   # 여행지 이미지
├── database/           # 데이터베이스 스크립트
├── tests/              # 테스트 파일
└── server.js           # 서버 진입점
```

## 설정 파일 (`/config/`)

### 데이터베이스 설정 (sequelize.js)

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.sequelize = null;
    this.initializeConnection();
  }

  initializeConnection() {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      timezone: '+09:00',
      
      // 연결 풀 설정
      pool: {
        max: 20,        // 최대 연결 수
        min: 5,         // 최소 연결 수
        idle: 30000,    // 유휴 시간 (30초)
        acquire: 60000, // 연결 획득 대기 시간 (60초)
      },
      
      // 로깅 설정
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      
      // 쿼리 최적화
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        underscored: false,     // camelCase 사용
        timestamps: true,       // createdAt, updatedAt 자동 생성
        freezeTableName: true,  // 테이블명 복수형 변환 방지
      },
    };

    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      config
    );
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Database connection established successfully');
      return true;
    } catch (error) {
      console.error('❌ Unable to connect to database:', error);
      return false;
    }
  }

  async syncModels(force = false) {
    try {
      await this.sequelize.sync({ 
        force,
        alter: process.env.NODE_ENV === 'development' // 개발환경에서만 스키마 자동 수정
      });
      console.log('✅ Database models synchronized');
    } catch (error) {
      console.error('❌ Error synchronizing models:', error);
      throw error;
    }
  }

  getSequelize() {
    return this.sequelize;
  }
}

const databaseConfig = new DatabaseConfig();
module.exports = databaseConfig.getSequelize();
```

### Socket.io 설정 (socket.js)

```javascript
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize');

class SocketManager {
  constructor() {
    this.io = null;
    this.userSockets = new Map();        // userId -> socketId 매핑
    this.socketUsers = new Map();        // socketId -> userId 매핑
    this.rooms = new Map();              // roomId -> Set<userId> 매핑
    this.connectionCount = 0;
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:8080',
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,      // 60초
      pingInterval: 25000,     // 25초
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupAdminHandlers();
  }

  setupMiddleware() {
    // JWT 인증 미들웨어
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          throw new Error('Authentication token required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 사용자 정보 조회
        const user = await User.findByPk(decoded.userId, {
          attributes: ['user_id', 'email', 'name', 'nickname', 'profile_image_url']
        });

        if (!user) {
          throw new Error('User not found');
        }

        socket.userId = user.user_id;
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    // 연결 제한 미들웨어
    this.io.use((socket, next) => {
      if (this.connectionCount >= 1000) { // 최대 1000개 연결
        return next(new Error('Too many connections'));
      }
      next();
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
      
      // 연결 해제 처리
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      // 알림 읽음 처리
      socket.on('notification:read', async (notificationId) => {
        await this.handleNotificationRead(socket, notificationId);
      });

      // 모든 알림 읽음 처리
      socket.on('notifications:readAll', async () => {
        await this.handleAllNotificationsRead(socket);
      });

      // 메시지 읽음 처리
      socket.on('message:read', async (messageId) => {
        await this.handleMessageRead(socket, messageId);
      });

      // 타이핑 상태 (향후 구현)
      socket.on('typing:start', (matchId) => {
        this.handleTypingStart(socket, matchId);
      });

      socket.on('typing:stop', (matchId) => {
        this.handleTypingStop(socket, matchId);
      });

      // 사용자 상태 업데이트
      socket.on('status:update', (status) => {
        this.handleStatusUpdate(socket, status);
      });
    });
  }

  handleConnection(socket) {
    console.log(`🔌 User ${socket.userId} connected (${socket.id})`);
    
    this.connectionCount++;
    this.userSockets.set(socket.userId, socket.id);
    this.socketUsers.set(socket.id, socket.userId);
    
    // 사용자별 룸 참가
    socket.join(`user-${socket.userId}`);
    
    // 연결 성공 알림
    socket.emit('connection:success', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });

    // 온라인 상태 브로드캐스트
    this.broadcastUserStatus(socket.userId, 'online');
    
    // 관리자에게 연결 알림
    this.io.to('admin').emit('user:connected', {
      userId: socket.userId,
      connectionCount: this.connectionCount
    });
  }

  handleDisconnection(socket, reason) {
    console.log(`🔌 User ${socket.userId} disconnected: ${reason}`);
    
    this.connectionCount--;
    this.userSockets.delete(socket.userId);
    this.socketUsers.delete(socket.id);
    
    // 오프라인 상태 브로드캐스트 (지연 처리)
    setTimeout(() => {
      if (!this.isUserOnline(socket.userId)) {
        this.broadcastUserStatus(socket.userId, 'offline');
      }
    }, 5000); // 5초 후 오프라인 처리
    
    // 관리자에게 연결 해제 알림
    this.io.to('admin').emit('user:disconnected', {
      userId: socket.userId,
      connectionCount: this.connectionCount,
      reason
    });
  }

  async handleNotificationRead(socket, notificationId) {
    try {
      const { Notification } = require('../models/sequelize');
      
      const notification = await Notification.findOne({
        where: { 
          id: notificationId, 
          user_id: socket.userId 
        }
      });

      if (notification && !notification.isRead) {
        await notification.update({ 
          isRead: true, 
          readAt: new Date() 
        });
        
        socket.emit('notification:read:success', notificationId);
      }
    } catch (error) {
      console.error('Error handling notification read:', error);
      socket.emit('notification:read:error', error.message);
    }
  }

  async handleAllNotificationsRead(socket) {
    try {
      const { Notification } = require('../models/sequelize');
      
      await Notification.update(
        { 
          isRead: true, 
          readAt: new Date() 
        },
        { 
          where: { 
            user_id: socket.userId, 
            isRead: false 
          } 
        }
      );
      
      socket.emit('notifications:readAll:success');
    } catch (error) {
      console.error('Error handling all notifications read:', error);
      socket.emit('notifications:readAll:error', error.message);
    }
  }

  broadcastUserStatus(userId, status) {
    // 친구나 매칭된 사용자들에게 상태 브로드캐스트
    // 현재는 구현하지 않음 (향후 친구 기능 추가 시)
    this.io.emit('user:status', { userId, status, timestamp: new Date() });
  }

  // 알림 전송
  sendNotification(userId, notification) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      console.log(`📢 Sending notification to user ${userId}`);
      this.io.to(`user-${userId}`).emit('notification:new', notification);
      return true;
    } else {
      console.log(`📢 User ${userId} is offline, notification stored only`);
      return false;
    }
  }

  // 여러 사용자에게 알림 전송
  sendNotificationToUsers(userIds, notification) {
    const results = userIds.map(userId => {
      return {
        userId,
        sent: this.sendNotification(userId, notification)
      };
    });
    
    console.log(`📢 Bulk notification sent:`, results);
    return results;
  }

  // 실시간 메시지 전송
  sendMessage(userId, message) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      console.log(`💬 Sending message to user ${userId}`);
      this.io.to(`user-${userId}`).emit('message:new', message);
      return true;
    } else {
      console.log(`💬 User ${userId} is offline, message stored only`);
      return false;
    }
  }

  // 매칭 룸에 브로드캐스트
  sendToMatch(matchId, event, data) {
    this.io.to(`match-${matchId}`).emit(event, data);
  }

  // 온라인 사용자 목록
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  // 사용자 온라인 여부 확인
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  // 연결 통계
  getConnectionStats() {
    return {
      totalConnections: this.connectionCount,
      onlineUsers: this.userSockets.size,
      activeRooms: this.rooms.size
    };
  }

  // 관리자 전용 이벤트 핸들러
  setupAdminHandlers() {
    this.io.on('connection', (socket) => {
      // 관리자 권한 확인 (향후 구현)
      if (socket.user?.role === 'admin') {
        socket.join('admin');
        
        socket.on('admin:stats', () => {
          socket.emit('admin:stats:response', this.getConnectionStats());
        });
        
        socket.on('admin:broadcast', (data) => {
          this.io.emit('admin:message', data);
        });
      }
    });
  }
}

const socketManager = new SocketManager();
module.exports = socketManager;
```

## 데이터베이스 모델 (`/models/sequelize/`)

### 사용자 모델 (User.js)

```javascript
const { DataTypes, Model } = require('sequelize');

class User extends Model {
  static associate(models) {
    // 1:1 관계
    User.hasOne(models.DisabilityProfile, { 
      foreignKey: 'user_id',
      as: 'disabilityProfile'
    });
    
    // 1:N 관계
    User.hasMany(models.TravelPlan, { 
      foreignKey: 'user_id',
      as: 'travelPlans'
    });
    
    User.hasMany(models.Review, { 
      foreignKey: 'user_id',
      as: 'reviews'
    });
    
    User.hasMany(models.Favorite, { 
      foreignKey: 'user_id',
      as: 'favorites'
    });
    
    User.hasMany(models.Notification, { 
      foreignKey: 'user_id',
      as: 'notifications'
    });
    
    // 매칭 관계 (복합)
    User.hasMany(models.MatchingRequest, { 
      foreignKey: 'requester_id',
      as: 'sentRequests'
    });
    
    User.hasMany(models.MatchingRequest, { 
      foreignKey: 'target_user_id',
      as: 'receivedRequests'
    });
    
    User.hasMany(models.CompanionMatch, { 
      foreignKey: 'traveler_id',
      as: 'travelerMatches'
    });
    
    User.hasMany(models.CompanionMatch, { 
      foreignKey: 'companion_id',
      as: 'companionMatches'
    });
    
    // 메시지 관계
    User.hasMany(models.CompanionMessage, { 
      foreignKey: 'sender_id',
      as: 'sentMessages'
    });
    
    User.hasMany(models.CompanionMessage, { 
      foreignKey: 'receiver_id',
      as: 'receivedMessages'
    });
  }

  // 인스턴스 메서드
  async getMatchingStats() {
    const [sentRequests, receivedRequests, activeMatches] = await Promise.all([
      this.getSentRequests(),
      this.getReceivedRequests(),
      this.getTravelerMatches({ where: { status: 'active' } })
    ]);
    
    return {
      sentRequestsCount: sentRequests.length,
      receivedRequestsCount: receivedRequests.length,
      activeMatchesCount: activeMatches.length
    };
  }

  async getTotalReviewStats() {
    const reviews = await this.getReviews();
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    
    return {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0
    };
  }

  // JSON 직렬화 시 민감한 정보 제외
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }

  // 정적 메서드
  static async findByEmail(email) {
    return this.findOne({ 
      where: { email },
      include: [{ 
        model: this.sequelize.models.DisabilityProfile,
        as: 'disabilityProfile'
      }]
    });
  }

  static async createWithProfile(userData, disabilityData = null) {
    const transaction = await this.sequelize.transaction();
    
    try {
      const user = await this.create(userData, { transaction });
      
      if (disabilityData) {
        await this.sequelize.models.DisabilityProfile.create({
          user_id: user.user_id,
          ...disabilityData
        }, { transaction });
      }
      
      await transaction.commit();
      return user;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

User.init({
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: '유효한 이메일 주소를 입력해주세요.'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [8, 255],
        msg: '비밀번호는 8자 이상이어야 합니다.'
      }
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [2, 50],
        msg: '이름은 2-50자 사이여야 합니다.'
      }
    }
  },
  nickname: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [2, 30],
        msg: '닉네임은 2-30자 사이여야 합니다.'
      },
      is: {
        args: /^[a-zA-Z0-9가-힣_-]+$/,
        msg: '닉네임은 한글, 영문, 숫자, _, - 만 사용 가능합니다.'
      }
    }
  },
  phone_number: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9-+\s]+$/,
        msg: '유효한 전화번호를 입력해주세요.'
      }
    }
  },
  profile_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: '유효한 생년월일을 입력해주세요.'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: '생년월일은 오늘 이전이어야 합니다.'
      }
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: '자기소개는 1000자를 초과할 수 없습니다.'
      }
    }
  },
  travel_style: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize: require('../../config/sequelize'),
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['email'] },
    { fields: ['nickname'] },
    { fields: ['is_active'] },
    { fields: ['created_at'] }
  ]
});

module.exports = User;
```

### 알림 모델 (Notification.js)

```javascript
const { DataTypes, Model } = require('sequelize');

class Notification extends Model {
  static associate(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }

  // 정적 메서드 - 다양한 알림 생성
  static async createMatchingRequestNotification(userId, requesterName, travelPlanTitle) {
    return this.create({
      user_id: userId,
      type: 'matching_request',
      title: '새로운 동행 요청',
      message: `${requesterName}님이 "${travelPlanTitle}" 여행에 동행을 신청했습니다.`,
      actionUrl: '/my-matches',
      isRead: false
    });
  }

  static async createMatchingAcceptedNotification(userId, accepterName, travelPlanTitle) {
    return this.create({
      user_id: userId,
      type: 'matching_accepted',
      title: '동행 요청 수락',
      message: `${accepterName}님이 "${travelPlanTitle}" 동행 요청을 수락했습니다.`,
      actionUrl: '/my-matches',
      isRead: false
    });
  }

  static async createMatchingRejectedNotification(userId, rejecterName, travelPlanTitle) {
    return this.create({
      user_id: userId,
      type: 'matching_rejected',
      title: '동행 요청 거절',
      message: `${rejecterName}님이 "${travelPlanTitle}" 동행 요청을 거절했습니다.`,
      actionUrl: '/my-matches',
      isRead: false
    });
  }

  static async createNewMessageNotification(userId, sender, matchId, messagePreview) {
    const preview = messagePreview.length > 50 
      ? messagePreview.substring(0, 50) + '...' 
      : messagePreview;
      
    return this.create({
      user_id: userId,
      type: 'new_message',
      title: `${sender.nickname}님으로부터 새 메시지`,
      message: preview,
      actionUrl: `/messaging/${matchId}`,
      relatedId: matchId,
      isRead: false
    });
  }

  static async createReviewLikeNotification(userId, likerName, reviewTitle) {
    return this.create({
      user_id: userId,
      type: 'review_like',
      title: '리뷰 좋아요',
      message: `${likerName}님이 "${reviewTitle}" 리뷰에 좋아요를 눌렀습니다.`,
      actionUrl: '/reviews',
      isRead: false
    });
  }

  static async createSystemNotification(userId, title, message, actionUrl = null) {
    return this.create({
      user_id: userId,
      type: 'system',
      title,
      message,
      actionUrl,
      isRead: false
    });
  }

  // 대량 알림 생성
  static async createBulkNotifications(notifications) {
    return this.bulkCreate(notifications);
  }

  // 읽지 않은 알림 개수
  static async getUnreadCount(userId) {
    return this.count({
      where: {
        user_id: userId,
        isRead: false
      }
    });
  }

  // 알림 읽음 처리
  static async markAsRead(notificationIds, userId) {
    return this.update(
      { 
        isRead: true, 
        readAt: new Date() 
      },
      {
        where: {
          id: notificationIds,
          user_id: userId
        }
      }
    );
  }

  // 모든 알림 읽음 처리
  static async markAllAsRead(userId) {
    return this.update(
      { 
        isRead: true, 
        readAt: new Date() 
      },
      {
        where: {
          user_id: userId,
          isRead: false
        }
      }
    );
  }

  // 오래된 알림 정리 (30일)
  static async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.destroy({
      where: {
        created_at: {
          [require('sequelize').Op.lt]: thirtyDaysAgo
        },
        isRead: true
      }
    });
  }
}

Notification.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'matching_request',
      'matching_accepted', 
      'matching_rejected',
      'new_message',
      'review_like',
      'plan_shared',
      'destination_update',
      'system'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  actionUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize: require('../../config/sequelize'),
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['isRead'] },
    { fields: ['created_at'] },
    { fields: ['user_id', 'isRead'] }, // 복합 인덱스
    { fields: ['user_id', 'created_at'] } // 복합 인덱스
  ]
});

module.exports = Notification;
```

### 메시지 모델 (CompanionMessage.js)

```javascript
const { DataTypes, Model } = require('sequelize');

class CompanionMessage extends Model {
  static associate(models) {
    CompanionMessage.belongsTo(models.CompanionMatch, {
      foreignKey: 'match_id',
      as: 'match'
    });
    
    CompanionMessage.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });
    
    CompanionMessage.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  }

  // 인스턴스 메서드
  async markAsRead() {
    if (!this.is_read) {
      await this.update({
        is_read: true,
        read_at: new Date()
      });
    }
  }

  async softDelete() {
    await this.update({
      is_deleted: true,
      deleted_at: new Date()
    });
  }

  // 정적 메서드
  static async getUnreadCount(matchId, userId) {
    return this.count({
      where: {
        match_id: matchId,
        receiver_id: userId,
        is_read: false,
        is_deleted: false
      }
    });
  }

  static async markAllAsRead(matchId, userId) {
    return this.update(
      { 
        is_read: true, 
        read_at: new Date() 
      },
      {
        where: {
          match_id: matchId,
          receiver_id: userId,
          is_read: false,
          is_deleted: false
        }
      }
    );
  }

  static async getLatestMessage(matchId) {
    return this.findOne({
      where: { 
        match_id: matchId, 
        is_deleted: false 
      },
      order: [['created_at', 'DESC']],
      include: [{
        model: this.sequelize.models.User,
        as: 'sender',
        attributes: ['user_id', 'nickname', 'profile_image_url']
      }]
    });
  }

  static async searchMessages(matchId, query, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    return this.findAndCountAll({
      where: {
        match_id: matchId,
        content: {
          [require('sequelize').Op.like]: `%${query}%`
        },
        is_deleted: false
      },
      include: [{
        model: this.sequelize.models.User,
        as: 'sender',
        attributes: ['user_id', 'nickname', 'profile_image_url']
      }],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }
}

CompanionMessage.init({
  message_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  match_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companion_matches',
      key: 'match_id'
    }
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [1, 1000],
        msg: '메시지는 1-1000자 사이여야 합니다.'
      }
    }
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'location', 'system'),
    defaultValue: 'text',
    allowNull: false
  },
  attachment_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  sequelize: require('../../config/sequelize'),
  modelName: 'CompanionMessage',
  tableName: 'companion_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['match_id'] },
    { fields: ['sender_id'] },
    { fields: ['receiver_id'] },
    { fields: ['is_read'] },
    { fields: ['is_deleted'] },
    { fields: ['created_at'] },
    { fields: ['match_id', 'is_deleted', 'created_at'] }, // 복합 인덱스
    { fields: ['receiver_id', 'is_read'] } // 복합 인덱스
  ],
  // 소프트 삭제된 메시지 기본 제외
  defaultScope: {
    where: {
      is_deleted: false
    }
  },
  scopes: {
    withDeleted: {
      where: {}
    },
    onlyDeleted: {
      where: {
        is_deleted: true
      }
    }
  }
});

module.exports = CompanionMessage;
```

## 컨트롤러 (`/controllers/`)

### 인증 컨트롤러 (authController.js)

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, DisabilityProfile } = require('../models/sequelize');
const { AppError } = require('../utils/errorHandler');
const { validationResult } = require('express-validator');

class AuthController {
  // 회원가입
  async register(req, res, next) {
    try {
      // 입력 검증
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '입력 데이터가 올바르지 않습니다.',
          errors: errors.array()
        });
      }

      const { 
        email, 
        password, 
        name, 
        nickname, 
        phone_number,
        birth_date,
        gender,
        location,
        bio,
        disability_info 
      } = req.body;

      // 이메일 중복 확인
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        throw new AppError('이미 사용 중인 이메일입니다.', 400);
      }

      // 닉네임 중복 확인
      const existingUserByNickname = await User.findOne({ where: { nickname } });
      if (existingUserByNickname) {
        throw new AppError('이미 사용 중인 닉네임입니다.', 400);
      }

      // 비밀번호 해싱
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 사용자 생성 (트랜잭션 사용)
      const user = await User.createWithProfile({
        email,
        password: hashedPassword,
        name,
        nickname,
        phone_number,
        birth_date,
        gender,
        location,
        bio
      }, disability_info);

      // JWT 토큰 생성
      const token = this.generateToken(user.user_id);

      // 응답에서 비밀번호 제외
      const userResponse = user.toJSON();

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          token,
          user: userResponse
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 로그인
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '입력 데이터가 올바르지 않습니다.',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // 사용자 조회 (장애 프로필 포함)
      const user = await User.findOne({
        where: { email },
        include: [{
          model: DisabilityProfile,
          as: 'disabilityProfile',
          required: false
        }]
      });

      if (!user) {
        throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
      }

      // 계정 활성화 확인
      if (!user.is_active) {
        throw new AppError('비활성화된 계정입니다. 관리자에게 문의해주세요.', 403);
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
      }

      // 마지막 로그인 시간 업데이트
      await user.update({ last_login_at: new Date() });

      // JWT 토큰 생성
      const token = this.generateToken(user.user_id);
      const refreshToken = this.generateRefreshToken(user.user_id);

      // 응답
      const userResponse = user.toJSON();
      
      res.json({
        success: true,
        message: '로그인이 완료되었습니다.',
        data: {
          token,
          refreshToken,
          user: userResponse
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 토큰 갱신
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('리프레시 토큰이 필요합니다.', 400);
      }

      // 리프레시 토큰 검증
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // 사용자 확인
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.is_active) {
        throw new AppError('유효하지 않은 사용자입니다.', 401);
      }

      // 새 토큰 생성
      const newToken = this.generateToken(user.user_id);
      const newRefreshToken = this.generateRefreshToken(user.user_id);

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('리프레시 토큰이 만료되었습니다.', 401));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('유효하지 않은 리프레시 토큰입니다.', 401));
      }
      next(error);
    }
  }

  // 로그아웃
  async logout(req, res, next) {
    try {
      // 실제로는 클라이언트에서 토큰 삭제
      // 서버에서는 블랙리스트 관리 가능 (Redis 사용)
      
      res.json({
        success: true,
        message: '로그아웃이 완료되었습니다.'
      });

    } catch (error) {
      next(error);
    }
  }

  // 이메일 중복 확인
  async checkEmailDuplicate(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError('이메일을 입력해주세요.', 400);
      }

      const existingUser = await User.findOne({ where: { email } });
      const isDuplicate = !!existingUser;

      res.json({
        success: true,
        data: {
          email,
          isDuplicate,
          message: isDuplicate ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.'
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 닉네임 중복 확인
  async checkNicknameDuplicate(req, res, next) {
    try {
      const { nickname } = req.body;

      if (!nickname) {
        throw new AppError('닉네임을 입력해주세요.', 400);
      }

      const existingUser = await User.findOne({ where: { nickname } });
      const isDuplicate = !!existingUser;

      res.json({
        success: true,
        data: {
          nickname,
          isDuplicate,
          message: isDuplicate ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.'
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 비밀번호 재설정 요청 (향후 구현)
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      
      // 이메일로 사용자 조회
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // 보안상 사용자 존재 여부를 알리지 않음
        return res.json({
          success: true,
          message: '비밀번호 재설정 이메일을 발송했습니다.'
        });
      }

      // TODO: 이메일 발송 구현
      // 1. 임시 토큰 생성
      // 2. 이메일 발송
      // 3. 토큰을 데이터베이스나 Redis에 저장

      res.json({
        success: true,
        message: '비밀번호 재설정 이메일을 발송했습니다.'
      });

    } catch (error) {
      next(error);
    }
  }

  // 헬퍼 메서드
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer: 'traveller-api',
        audience: 'traveller-client'
      }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'traveller-api',
        audience: 'traveller-client'
      }
    );
  }
}

module.exports = new AuthController();
```

### 메시지 컨트롤러 (messageController.js)

```javascript
const { CompanionMessage, CompanionMatch, User, Notification } = require('../models/sequelize');
const { AppError } = require('../utils/errorHandler');
const { Op } = require('sequelize');
const socketManager = require('../config/socket');

class MessageController {
  // 메시지 목록 조회 (매칭별)
  async getMessages(req, res, next) {
    try {
      const { matchId } = req.params;
      const userId = req.user.user_id;
      const { page = 1, limit = 50 } = req.query;
      
      const offset = (page - 1) * limit;
      
      // 매칭 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ]
        }
      });
      
      if (!match) {
        throw new AppError('접근 권한이 없습니다.', 403);
      }
      
      // 메시지 목록 조회
      const { count, rows: messages } = await CompanionMessage.findAndCountAll({
        where: { 
          match_id: matchId,
          is_deleted: false
        },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
        }],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'ASC']]
      });
      
      // 읽지 않은 메시지 읽음 처리
      await CompanionMessage.update(
        { 
          is_read: true,
          read_at: new Date()
        },
        {
          where: {
            match_id: matchId,
            receiver_id: userId,
            is_read: false
          }
        }
      );
      
      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 메시지 전송
  async sendMessage(req, res, next) {
    try {
      const { matchId } = req.params;
      const senderId = req.user.user_id;
      const { content, message_type = 'text', attachment_url } = req.body;
      
      // 내용 검증
      if (!content || content.trim() === '') {
        throw new AppError('메시지 내용을 입력해주세요.', 400);
      }
      
      if (content.length > 1000) {
        throw new AppError('메시지는 1000자를 초과할 수 없습니다.', 400);
      }
      
      // 매칭 정보 및 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: senderId },
            { companion_id: senderId }
          ],
          status: 'active'
        }
      });
      
      if (!match) {
        throw new AppError('유효하지 않은 매칭이거나 접근 권한이 없습니다.', 403);
      }
      
      // 수신자 ID 결정
      const receiverId = match.traveler_id === senderId 
        ? match.companion_id 
        : match.traveler_id;
      
      // 메시지 생성
      const message = await CompanionMessage.create({
        match_id: matchId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        message_type,
        attachment_url
      });
      
      // 전송된 메시지 상세 정보 조회
      const sentMessage = await CompanionMessage.findByPk(message.message_id, {
        include: [{
          model: User,
          as: 'sender',
          attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
        }]
      });
      
      // 알림 생성 및 전송 (비동기)
      this.createMessageNotification(senderId, receiverId, matchId, content.trim())
        .catch(error => console.error('알림 생성 실패:', error));
      
      // 실시간 메시지 전송 (상대방에게)
      const messageSent = socketManager.sendMessage(receiverId, sentMessage);
      
      // 응답에 전송 상태 포함
      res.status(201).json({
        success: true,
        message: '메시지가 전송되었습니다.',
        data: {
          ...sentMessage.toJSON(),
          realTimeSent: messageSent
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 메시지 알림 생성 헬퍼 메서드
  async createMessageNotification(senderId, receiverId, matchId, content) {
    try {
      const senderUser = await User.findByPk(senderId, {
        attributes: ['user_id', 'name', 'nickname']
      });

      if (senderUser) {
        const notification = await Notification.createNewMessageNotification(
          receiverId,
          senderUser,
          matchId,
          content
        );
        
        socketManager.sendNotification(receiverId, notification);
      }
    } catch (error) {
      console.error('메시지 알림 생성 실패:', error);
    }
  }

  // 메시지 삭제 (소프트 삭제)
  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user.user_id;
      
      const message = await CompanionMessage.findOne({
        where: {
          message_id: messageId,
          sender_id: userId,
          is_deleted: false
        }
      });
      
      if (!message) {
        throw new AppError('메시지를 찾을 수 없거나 삭제 권한이 없습니다.', 404);
      }
      
      // 소프트 삭제
      await message.softDelete();
      
      res.json({
        success: true,
        message: '메시지가 삭제되었습니다.'
      });

    } catch (error) {
      next(error);
    }
  }

  // 메시지 수정
  async updateMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user.user_id;
      const { content } = req.body;
      
      if (!content || content.trim() === '') {
        throw new AppError('메시지 내용을 입력해주세요.', 400);
      }
      
      const message = await CompanionMessage.findOne({
        where: {
          message_id: messageId,
          sender_id: userId,
          is_deleted: false
        }
      });
      
      if (!message) {
        throw new AppError('메시지를 찾을 수 없거나 수정 권한이 없습니다.', 404);
      }
      
      // 5분 후에는 수정 불가
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (message.created_at < fiveMinutesAgo) {
        throw new AppError('메시지 작성 후 5분 이내에만 수정할 수 있습니다.', 400);
      }
      
      await message.update({ 
        content: content.trim(),
        updated_at: new Date()
      });
      
      // 실시간 업데이트 전송
      const updatedMessage = await CompanionMessage.findByPk(messageId, {
        include: [{
          model: User,
          as: 'sender',
          attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
        }]
      });
      
      socketManager.sendToMatch(message.match_id, 'message:updated', updatedMessage);
      
      res.json({
        success: true,
        message: '메시지가 수정되었습니다.',
        data: updatedMessage
      });

    } catch (error) {
      next(error);
    }
  }

  // 읽지 않은 메시지 수 조회
  async getUnreadCount(req, res, next) {
    try {
      const { matchId } = req.params;
      const userId = req.user.user_id;
      
      // 매칭 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ]
        }
      });
      
      if (!match) {
        throw new AppError('접근 권한이 없습니다.', 403);
      }
      
      const unreadCount = await CompanionMessage.getUnreadCount(matchId, userId);
      
      res.json({
        success: true,
        data: { unreadCount }
      });

    } catch (error) {
      next(error);
    }
  }

  // 모든 매칭의 읽지 않은 메시지 수 조회
  async getAllUnreadCounts(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      // 사용자의 모든 활성 매칭 조회
      const matches = await CompanionMatch.findAll({
        where: {
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ],
          status: 'active'
        },
        attributes: ['match_id']
      });
      
      // 각 매칭별 읽지 않은 메시지 수 조회
      const unreadCounts = await Promise.all(
        matches.map(async (match) => {
          const count = await CompanionMessage.getUnreadCount(match.match_id, userId);
          return {
            match_id: match.match_id,
            unread_count: count
          };
        })
      );
      
      // 전체 읽지않은 메시지 수
      const totalUnread = unreadCounts.reduce((sum, match) => sum + match.unread_count, 0);
      
      res.json({
        success: true,
        data: {
          totalUnread,
          byMatch: unreadCounts
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 메시지 검색
  async searchMessages(req, res, next) {
    try {
      const { matchId } = req.params;
      const userId = req.user.user_id;
      const { query, page = 1, limit = 20 } = req.query;
      
      if (!query || query.trim() === '') {
        throw new AppError('검색어를 입력해주세요.', 400);
      }
      
      // 매칭 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ]
        }
      });
      
      if (!match) {
        throw new AppError('접근 권한이 없습니다.', 403);
      }
      
      const { count, rows: messages } = await CompanionMessage.searchMessages(
        matchId, 
        query.trim(),
        { page: parseInt(page), limit: parseInt(limit) }
      );
      
      res.json({
        success: true,
        data: {
          messages,
          searchQuery: query.trim(),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // 매칭별 최근 메시지 조회
  async getLatestMessages(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      // 사용자의 모든 활성 매칭 조회
      const matches = await CompanionMatch.findAll({
        where: {
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ],
          status: 'active'
        },
        include: [{
          model: User,
          as: 'traveler',
          attributes: ['user_id', 'nickname', 'profile_image_url']
        }, {
          model: User,
          as: 'companion',
          attributes: ['user_id', 'nickname', 'profile_image_url']
        }]
      });
      
      // 각 매칭의 최근 메시지 조회
      const matchesWithMessages = await Promise.all(
        matches.map(async (match) => {
          const latestMessage = await CompanionMessage.getLatestMessage(match.match_id);
          const unreadCount = await CompanionMessage.getUnreadCount(match.match_id, userId);
          
          // 상대방 정보
          const otherUser = match.traveler_id === userId ? match.companion : match.traveler;
          
          return {
            match_id: match.match_id,
            otherUser,
            latestMessage,
            unreadCount,
            matched_at: match.matched_at
          };
        })
      );
      
      // 최근 메시지 시간 순으로 정렬
      matchesWithMessages.sort((a, b) => {
        const aTime = a.latestMessage?.created_at || a.matched_at;
        const bTime = b.latestMessage?.created_at || b.matched_at;
        return new Date(bTime) - new Date(aTime);
      });
      
      res.json({
        success: true,
        data: {
          matches: matchesWithMessages
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
```

## 미들웨어 (`/middleware/`)

### 인증 미들웨어 (auth.js)

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models/sequelize');
const { AppError } = require('../utils/errorHandler');

class AuthMiddleware {
  // JWT 토큰 인증
  async authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        throw new AppError('액세스 토큰이 필요합니다.', 401);
      }
      
      // 토큰 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 사용자 정보 조회
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new AppError('사용자를 찾을 수 없습니다.', 401);
      }
      
      if (!user.is_active) {
        throw new AppError('비활성화된 계정입니다.', 403);
      }
      
      // 요청 객체에 사용자 정보 추가
      req.user = user;
      next();
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('토큰이 만료되었습니다.', 401));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('유효하지 않은 토큰입니다.', 401));
      }
      next(error);
    }
  }

  // 선택적 인증 (토큰이 있으면 인증, 없으면 통과)
  async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        req.user = null;
        return next();
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      
      req.user = user && user.is_active ? user : null;
      next();
      
    } catch (error) {
      // 토큰 오류가 있어도 계속 진행 (선택적 인증)
      req.user = null;
      next();
    }
  }

  // 관리자 권한 확인
  async requireAdmin(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('인증이 필요합니다.', 401);
      }
      
      if (req.user.role !== 'admin') {
        throw new AppError('관리자 권한이 필요합니다.', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }

  // 본인 또는 관리자만 접근 가능
  async requireOwnerOrAdmin(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('인증이 필요합니다.', 401);
      }
      
      const targetUserId = req.params.userId || req.params.id;
      
      if (req.user.user_id !== targetUserId && req.user.role !== 'admin') {
        throw new AppError('본인의 정보만 접근할 수 있습니다.', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }

  // API 키 인증 (외부 API 연동용)
  async authenticateApiKey(req, res, next) {
    try {
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey) {
        throw new AppError('API 키가 필요합니다.', 401);
      }
      
      const validApiKeys = (process.env.API_KEYS || '').split(',');
      
      if (!validApiKeys.includes(apiKey)) {
        throw new AppError('유효하지 않은 API 키입니다.', 401);
      }
      
      req.apiAuthenticated = true;
      next();
      
    } catch (error) {
      next(error);
    }
  }

  // 이메일 인증 확인
  async requireEmailVerification(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('인증이 필요합니다.', 401);
      }
      
      if (!req.user.email_verified) {
        throw new AppError('이메일 인증이 필요합니다.', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }

  // 계정 완성도 확인
  async requireCompleteProfile(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('인증이 필요합니다.', 401);
      }
      
      const requiredFields = ['name', 'nickname', 'phone_number'];
      const missingFields = requiredFields.filter(field => !req.user[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: '프로필을 완성해주세요.',
          missingFields
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }
}

const authMiddleware = new AuthMiddleware();

module.exports = {
  authenticateToken: authMiddleware.authenticateToken.bind(authMiddleware),
  optionalAuth: authMiddleware.optionalAuth.bind(authMiddleware),
  requireAdmin: authMiddleware.requireAdmin.bind(authMiddleware),
  requireOwnerOrAdmin: authMiddleware.requireOwnerOrAdmin.bind(authMiddleware),
  authenticateApiKey: authMiddleware.authenticateApiKey.bind(authMiddleware),
  requireEmailVerification: authMiddleware.requireEmailVerification.bind(authMiddleware),
  requireCompleteProfile: authMiddleware.requireCompleteProfile.bind(authMiddleware)
};
```

## 서버 설정 (server.js)

```javascript
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// 내부 모듈
const sequelize = require('./config/sequelize');
const socketManager = require('./config/socket');
const { globalErrorHandler } = require('./utils/errorHandler');

// 모델 초기화
require('./models/sequelize');

class Server {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = process.env.PORT || 3000;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupSocketIO();
  }

  setupMiddleware() {
    // 보안 미들웨어
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS 설정
    this.app.use(cors({
      origin: function(origin, callback) {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          'http://localhost:8080',
          'http://127.0.0.1:8080'
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS 정책에 의해 차단됨'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
    }));

    // 압축
    this.app.use(compression());

    // 로깅
    if (process.env.NODE_ENV === 'production') {
      this.app.use(morgan('combined'));
    } else {
      this.app.use(morgan('dev'));
    }

    // Body 파싱
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // 정적 파일 서빙
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // 최대 100 요청
      message: {
        success: false,
        message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // API 라우트에만 제한 적용
    this.app.use('/api/', limiter);

    // 로그인/회원가입에 더 엄격한 제한
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 5, // 최대 5 요청
      message: {
        success: false,
        message: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
      }
    });

    this.app.use('/api/auth/login', authLimiter);
    this.app.use('/api/auth/register', authLimiter);
  }

  setupRoutes() {
    // 헬스 체크
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API 라우트
    this.app.use('/api/auth', require('./routes/auth'));
    this.app.use('/api/user', require('./routes/user'));
    this.app.use('/api/travel-plans', require('./routes/travelPlans'));
    this.app.use('/api/destinations', require('./routes/destination'));
    this.app.use('/api/reviews', require('./routes/reviews'));
    this.app.use('/api/matching', require('./routes/matching'));
    this.app.use('/api/messages', require('./routes/messages'));
    this.app.use('/api/notifications', require('./routes/notifications'));
    this.app.use('/api/favorites', require('./routes/favorites'));

    // API 문서 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      this.app.get('/api/docs', (req, res) => {
        res.json({
          message: 'API Documentation',
          endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            travelPlans: '/api/travel-plans',
            destinations: '/api/destinations',
            reviews: '/api/reviews',
            matching: '/api/matching',
            messages: '/api/messages',
            notifications: '/api/notifications',
            favorites: '/api/favorites'
          }
        });
      });
    }

    // 404 처리
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API 엔드포인트를 찾을 수 없습니다.'
      });
    });
  }

  setupErrorHandling() {
    this.app.use(globalErrorHandler);

    // 예상치 못한 에러 처리
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // 여기서는 프로세스를 종료하지 않고 로깅만
    });
  }

  setupSocketIO() {
    socketManager.initialize(this.server);
  }

  async start() {
    try {
      // 데이터베이스 연결 테스트
      await sequelize.authenticate();
      console.log('✅ Database connection established');

      // 모델 동기화 (개발 환경에서만 alter 사용)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized');
      }

      // 서버 시작
      this.server.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📚 API docs: http://localhost:${this.port}/api/docs`);
        }
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async gracefulShutdown(signal) {
    console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
    
    this.server.close(async () => {
      console.log('🔌 HTTP server closed');
      
      try {
        await sequelize.close();
        console.log('🗄️ Database connections closed');
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // 강제 종료 (30초 후)
    setTimeout(() => {
      console.error('❌ Forcing shutdown after 30s timeout');
      process.exit(1);
    }, 30000);
  }
}

// 서버 인스턴스 생성 및 시작
const server = new Server();
server.start();

module.exports = server;
```

---

*본 문서는 Traveller 백엔드의 상세한 아키텍처와 구현 사항을 기술한 개발자 가이드입니다.*