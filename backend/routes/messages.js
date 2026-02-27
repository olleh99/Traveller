const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate: authMiddleware } = require('../middleware/auth');

// 매칭별 메시지 관리
router.get('/match/:matchId', authMiddleware, messageController.getMessages);
router.post('/match/:matchId', authMiddleware, messageController.sendMessage);
router.get('/match/:matchId/unread', authMiddleware, messageController.getUnreadCount);
router.get('/match/:matchId/search', authMiddleware, messageController.searchMessages);

// 메시지 개별 관리
router.delete('/:messageId', authMiddleware, messageController.deleteMessage);

// 전체 읽지 않은 메시지 수
router.get('/unread-counts', authMiddleware, messageController.getAllUnreadCounts);

module.exports = router;