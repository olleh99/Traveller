const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { authenticate } = require('../middleware/auth');

// 공개 라우트
router.get('/', destinationController.getDestinations);
router.get('/:id', destinationController.getDestination);

// 인증 필요 라우트 (관리자/등록자만)
router.post('/', authenticate, destinationController.createDestination);
router.put('/:id', authenticate, destinationController.updateDestination);
router.delete('/:id', authenticate, destinationController.deleteDestination);

module.exports = router;