const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      },
      field: 'user_id'
    },
    type: {
      type: DataTypes.ENUM(
        'matching_request',      // 매칭 요청 받음
        'matching_accepted',     // 매칭 승인됨
        'matching_rejected',     // 매칭 거절됨
        'matching_ended',        // 매칭 종료됨
        'new_message',          // 새 메시지
        'review_like',          // 리뷰 도움됨
        'plan_shared',          // 여행 계획 공유됨
        'destination_update',   // 즐겨찾기 여행지 업데이트
        'system'               // 시스템 알림
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    relatedType: {
      type: DataTypes.ENUM('matching', 'message', 'review', 'destination', 'plan', 'user'),
      allowNull: true
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'Notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id', 'isRead']
      },
      {
        fields: ['user_id', 'type']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'user_id',
      as: 'user'
    });
  };

  // Helper methods
  Notification.createMatchingRequestNotification = async function(toUserId, fromUser, matchingRequestId) {
    return this.create({
      userId: toUserId,
      type: 'matching_request',
      title: '새로운 매칭 요청',
      message: `${fromUser.nickname}님이 동행 요청을 보냈습니다.`,
      relatedType: 'matching',
      relatedId: matchingRequestId,
      actionUrl: `/my-matches`,
      metadata: {
        fromUserId: fromUser.id,
        fromUserNickname: fromUser.nickname
      }
    });
  };

  Notification.createMatchingAcceptedNotification = async function(toUserId, acceptedByUser, matchId) {
    return this.create({
      userId: toUserId,
      type: 'matching_accepted',
      title: '매칭 요청 승인',
      message: `${acceptedByUser.nickname}님이 동행 요청을 승인했습니다.`,
      relatedType: 'matching',
      relatedId: matchId,
      actionUrl: `/messages/${matchId}`,
      metadata: {
        acceptedByUserId: acceptedByUser.id,
        acceptedByUserNickname: acceptedByUser.nickname
      }
    });
  };

  Notification.createMatchingRejectedNotification = async function(toUserId, rejectedByUser) {
    return this.create({
      userId: toUserId,
      type: 'matching_rejected',
      title: '매칭 요청 거절',
      message: `${rejectedByUser.nickname}님이 동행 요청을 거절했습니다.`,
      relatedType: 'matching',
      metadata: {
        rejectedByUserId: rejectedByUser.id,
        rejectedByUserNickname: rejectedByUser.nickname
      }
    });
  };

  Notification.createNewMessageNotification = async function(toUserId, fromUser, matchId, messagePreview) {
    return this.create({
      userId: toUserId,
      type: 'new_message',
      title: '새 메시지',
      message: `${fromUser.nickname}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
      relatedType: 'message',
      relatedId: matchId,
      actionUrl: `/messages/${matchId}`,
      metadata: {
        fromUserId: fromUser.id,
        fromUserNickname: fromUser.nickname,
        messagePreview
      }
    });
  };

  Notification.createReviewLikeNotification = async function(toUserId, fromUser, reviewId, destinationName) {
    return this.create({
      userId: toUserId,
      type: 'review_like',
      title: '리뷰 도움됨',
      message: `${fromUser.nickname}님이 "${destinationName}" 리뷰를 도움이 된다고 표시했습니다.`,
      relatedType: 'review',
      relatedId: reviewId,
      actionUrl: `/my-reviews`,
      metadata: {
        fromUserId: fromUser.id,
        fromUserNickname: fromUser.nickname,
        destinationName
      }
    });
  };

  Notification.createSystemNotification = async function(toUserId, title, message, actionUrl = null) {
    return this.create({
      userId: toUserId,
      type: 'system',
      title,
      message,
      actionUrl
    });
  };

  // Get unread count for user
  Notification.getUnreadCount = async function(userId) {
    return this.count({
      where: {
        userId: userId,
        isRead: false
      }
    });
  };

  // Mark notifications as read
  Notification.markAsRead = async function(notificationIds, userId) {
    return this.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          id: notificationIds,
          userId: userId
        }
      }
    );
  };

  return Notification;
};