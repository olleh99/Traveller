const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate: authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const { validateUpdateProfile, validateDisabilityProfile, validateCompanionProfile } = require('../middleware/validation');

// Multer 설정 (메모리 스토리지 사용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 기본 프로필 관련 라우트
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, validateUpdateProfile, userController.updateProfile);

// 프로필 이미지 관련 라우트
router.post('/profile/image', authMiddleware, upload.single('image'), userController.uploadProfileImage);
router.delete('/profile/image', authMiddleware, userController.deleteProfileImage);

// 장애인 프로필 관련 라우트
router.get('/disability-profile', authMiddleware, userController.getDisabilityProfile);
router.put('/disability-profile', authMiddleware, validateDisabilityProfile, userController.updateDisabilityProfile);

// 동행인 프로필 관련 라우트
router.get('/companion-profile', authMiddleware, userController.getCompanionProfile);
router.put('/companion-profile', authMiddleware, validateCompanionProfile, userController.updateCompanionProfile);

// 프로필 통계 및 활동 내역 관련 라우트
router.get('/profile/statistics', authMiddleware, userController.getProfileStatistics);
router.get('/profile/activities', authMiddleware, userController.getRecentActivities);

// 디버깅용 라우트
router.get('/debug/reviews', authMiddleware, async (req, res) => {
  try {
    const { Review } = require('../models/sequelize');
    const reviews = await Review.findAll({
      where: { user_id: req.user.user_id },
      attributes: ['review_id', 'title', 'user_id', 'status', 'created_at']
    });
    res.json({
      success: true,
      userId: req.user.user_id,
      userType: typeof req.user.user_id,
      reviewCount: reviews.length,
      reviews: reviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;