const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// 모든 알림 관련 라우트는 인증 필요
router.use(authenticateToken);

// 알림 목록 조회
router.get('/', notificationController.getNotifications);

// 읽지 않은 알림 개수 조회
router.get('/unread-count', notificationController.getUnreadCount);

// 알림 읽음 처리
router.put('/read', notificationController.markAsRead);

// 모든 알림 읽음 처리
router.put('/read-all', notificationController.markAllAsRead);

// 알림 삭제
router.delete('/:id', notificationController.deleteNotification);

// 알림 설정 조회
router.get('/settings', notificationController.getNotificationSettings);

// 알림 설정 업데이트
router.put('/settings', notificationController.updateNotificationSettings);

// 테스트용 알림 생성 (개발 환경에서만)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', notificationController.createTestNotification);
}

module.exports = router;