const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { authenticate: authMiddleware } = require('../middleware/auth');

// 동행인 검색
router.get('/companions/search', authMiddleware, matchingController.searchCompanions);

// 매칭 요청 관련
router.post('/requests', authMiddleware, matchingController.createMatchingRequest);
router.get('/requests/received', authMiddleware, matchingController.getReceivedRequests);
router.get('/requests/sent', authMiddleware, matchingController.getSentRequests);
router.put('/requests/:requestId/respond', authMiddleware, matchingController.respondToRequest);
router.delete('/requests/:requestId', authMiddleware, matchingController.cancelRequest);

// 매칭 목록
router.get('/matches', authMiddleware, matchingController.getMyMatches);

// 매칭 종료
router.put('/matches/:matchId/end', authMiddleware, matchingController.endMatch);

module.exports = router;