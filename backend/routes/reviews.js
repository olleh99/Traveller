const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate: authMiddleware } = require('../middleware/auth');
const multer = require('multer');

// Multer 설정 (리뷰 이미지용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
    files: 5 // 한 번에 최대 5개 파일
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다. (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// 리뷰 관련 라우트
router.get('/destination/:destinationId', reviewController.getReviewsByDestination);
router.get('/user/:userId', authMiddleware, reviewController.getReviewsByUser);
router.get('/:reviewId', reviewController.getReview);
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);
router.post('/:reviewId/helpful', reviewController.toggleHelpful);

// 리뷰 이미지 관련 라우트
router.post('/:reviewId/images', authMiddleware, upload.array('images', 5), reviewController.uploadReviewImages);
router.delete('/images/:imageId', authMiddleware, reviewController.deleteReviewImage);

module.exports = router;