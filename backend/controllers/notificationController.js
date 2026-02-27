const { Notification, User } = require('../models/sequelize');
const socketManager = require('../config/socket');

// 알림 목록 조회
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const where = { userId: userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await Notification.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'nickname', 'profile_image_url']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.rows,
        totalCount: notifications.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(notifications.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('알림 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '알림 목록을 조회하는 중 오류가 발생했습니다.' 
    });
  }
};

// 읽지 않은 알림 개수 조회
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const count = await Notification.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('읽지 않은 알림 개수 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '읽지 않은 알림 개수를 조회하는 중 오류가 발생했습니다.' 
    });
  }
};

// 알림 읽음 처리
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: '알림 ID 배열이 필요합니다.'
      });
    }

    await Notification.markAsRead(notificationIds, userId);
    
    // Socket으로 읽음 처리 알림
    socketManager.sendNotification(userId, {
      type: 'notifications_read',
      notificationIds
    });
    
    res.json({
      success: true,
      message: '알림을 읽음 처리했습니다.'
    });
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '알림을 읽음 처리하는 중 오류가 발생했습니다.' 
    });
  }
};

// 모든 알림 읽음 처리
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    await Notification.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      { 
        where: { 
          userId: userId,
          isRead: false 
        } 
      }
    );
    
    // Socket으로 모든 알림 읽음 처리 알림
    socketManager.sendNotification(userId, {
      type: 'all_notifications_read'
    });
    
    res.json({
      success: true,
      message: '모든 알림을 읽음 처리했습니다.'
    });
  } catch (error) {
    console.error('모든 알림 읽음 처리 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '모든 알림을 읽음 처리하는 중 오류가 발생했습니다.' 
    });
  }
};

// 알림 삭제
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    
    const result = await Notification.destroy({
      where: {
        id,
        user_id: userId
      }
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '알림을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '알림이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('알림 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '알림을 삭제하는 중 오류가 발생했습니다.' 
    });
  }
};

// 알림 설정 조회
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // notification_settings 컬럼이 없으므로 기본 설정 반환
    const defaultSettings = {
      matching_request: true,
      matching_accepted: true,
      matching_rejected: true,
      new_message: true,
      review_like: true,
      plan_shared: true,
      destination_update: true,
      system: true
    };
    
    res.json({
      success: true,
      data: defaultSettings
    });
  } catch (error) {
    console.error('알림 설정 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '알림 설정을 조회하는 중 오류가 발생했습니다.' 
    });
  }
};

// 알림 설정 업데이트
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { settings } = req.body;
    
    // notification_settings 컬럼이 없으므로 임시로 설정만 반환
    // TODO: notification_settings 컬럼 추가 후 실제 업데이트 구현
    
    res.json({
      success: true,
      message: '알림 설정이 업데이트되었습니다.',
      data: settings
    });
  } catch (error) {
    console.error('알림 설정 업데이트 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '알림 설정을 업데이트하는 중 오류가 발생했습니다.' 
    });
  }
};

// 테스트용 알림 생성 (개발 환경에서만 사용)
exports.createTestNotification = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: '프로덕션 환경에서는 사용할 수 없습니다.'
      });
    }
    
    const userId = req.user.user_id;
    const { type = 'system', title = '테스트 알림', message = '이것은 테스트 알림입니다.' } = req.body;
    
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      actionUrl: '/notifications'
    });
    
    // Socket으로 실시간 알림 전송
    socketManager.sendNotification(userId, notification);
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('테스트 알림 생성 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '테스트 알림을 생성하는 중 오류가 발생했습니다.' 
    });
  }
};