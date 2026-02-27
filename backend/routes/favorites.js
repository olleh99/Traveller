const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

// 즐겨찾기 관련 라우트
// TODO: 프로덕션에서는 모든 라우트에 authenticate 미들웨어 추가 필요
router.get('/user/:userId', favoriteController.getFavoritesByUser);
router.post('/', favoriteController.addFavorite);
router.delete('/:favoriteId', favoriteController.removeFavorite);
router.get('/check/:userId/:destinationId', favoriteController.checkFavoriteStatus);
router.post('/toggle', favoriteController.toggleFavorite);

module.exports = router;