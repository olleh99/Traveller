const { Review, ReviewImage, User, Destination } = require('../models/sequelize');
const { Op } = require('sequelize');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const reviewController = {
  // 리뷰 목록 조회 (여행지별)
  async getReviewsByDestination(req, res) {
    try {
      const { destinationId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'created_at', 
        sortOrder = 'DESC',
        status = 'approved'
      } = req.query;

      const offset = (page - 1) * limit;

      const reviews = await Review.findAndCountAll({
        where: {
          destination_id: destinationId,
          status: status
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'user_type', 'created_at']
          },
          {
            model: ReviewImage,
            as: 'images',
            attributes: ['image_id', 'image_url', 'image_type', 'description', 'display_order']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: offset
      });

      // 통계 계산
      const stats = await Review.findOne({
        where: {
          destination_id: destinationId,
          status: 'approved'
        },
        attributes: [
          [Review.sequelize.fn('AVG', Review.sequelize.col('overall_rating')), 'avgOverallRating'],
          [Review.sequelize.fn('AVG', Review.sequelize.col('accessibility_rating')), 'avgAccessibilityRating'],
          [Review.sequelize.fn('AVG', Review.sequelize.col('mobility_rating')), 'avgMobilityRating'],
          [Review.sequelize.fn('AVG', Review.sequelize.col('facility_rating')), 'avgFacilityRating'],
          [Review.sequelize.fn('AVG', Review.sequelize.col('service_rating')), 'avgServiceRating'],
          [Review.sequelize.fn('COUNT', Review.sequelize.col('review_id')), 'totalReviews']
        ],
        raw: true
      });

      res.json({
        success: true,
        data: {
          reviews: reviews.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(reviews.count / limit),
            totalItems: reviews.count,
            itemsPerPage: parseInt(limit)
          },
          statistics: {
            averageRating: parseFloat(stats.avgOverallRating || 0).toFixed(1),
            averageAccessibilityRating: parseFloat(stats.avgAccessibilityRating || 0).toFixed(1),
            averageMobilityRating: parseFloat(stats.avgMobilityRating || 0).toFixed(1),
            averageFacilityRating: parseFloat(stats.avgFacilityRating || 0).toFixed(1),
            averageServiceRating: parseFloat(stats.avgServiceRating || 0).toFixed(1),
            totalReviews: parseInt(stats.totalReviews || 0)
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '리뷰 목록을 불러올 수 없습니다.',
        error: error.message
      });
    }
  },

  // 특정 리뷰 상세 조회
  async getReview(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findByPk(reviewId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'user_type', 'created_at']
          },
          {
            model: Destination,
            as: 'destination',
            attributes: ['id', 'name', 'category', 'region']
          },
          {
            model: ReviewImage,
            as: 'images',
            order: [['display_order', 'ASC']],
            attributes: ['image_id', 'image_url', 'image_type', 'description', 'display_order']
          }
        ]
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: '리뷰를 찾을 수 없습니다.'
        });
      }

      res.json({
        success: true,
        data: review
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '리뷰 정보를 불러올 수 없습니다.',
        error: error.message
      });
    }
  },

  // 리뷰 작성
  async createReview(req, res) {
    try {
      const {
        user_id,
        destination_id,
        overall_rating,
        accessibility_rating,
        mobility_rating,
        facility_rating,
        service_rating,
        title,
        content,
        accessibility_features,
        accessibility_issues,
        helpful_tips,
        visit_date,
        visit_purpose,
        companion_type,
        would_recommend,
        images
      } = req.body;

      // 필수 필드 검증
      if (!user_id || !destination_id || !overall_rating || !title || !content) {
        return res.status(400).json({
          success: false,
          message: '필수 정보가 누락되었습니다.'
        });
      }

      // 평점 범위 검증
      const ratings = [overall_rating, accessibility_rating, mobility_rating, facility_rating, service_rating];
      for (let rating of ratings) {
        if (rating !== null && rating !== undefined && (rating < 1.0 || rating > 5.0)) {
          return res.status(400).json({
            success: false,
            message: '평점은 1.0에서 5.0 사이여야 합니다.'
          });
        }
      }

      // 여행지 존재 확인
      const destination = await Destination.findByPk(destination_id);
      if (!destination) {
        return res.status(404).json({
          success: false,
          message: '존재하지 않는 여행지입니다.'
        });
      }

      // 사용자당 여행지별 리뷰 중복 확인
      const existingReview = await Review.findOne({
        where: {
          user_id: user_id,
          destination_id: destination_id
        }
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: '이미 이 여행지에 대한 리뷰를 작성하셨습니다.'
        });
      }

      // 리뷰 생성
      const review = await Review.create({
        user_id,
        destination_id,
        overall_rating,
        accessibility_rating,
        mobility_rating,
        facility_rating,
        service_rating,
        title,
        content,
        accessibility_features: accessibility_features || [],
        accessibility_issues: accessibility_issues || [],
        helpful_tips,
        visit_date,
        visit_purpose,
        companion_type,
        would_recommend,
        status: 'approved' // 기본적으로 승인된 상태로 생성
      });

      // 이미지 추가 (있는 경우)
      if (images && images.length > 0) {
        const imageData = images.map((img, index) => ({
          review_id: review.review_id,
          image_url: img.image_url,
          image_type: img.image_type || 'general',
          description: img.description,
          display_order: img.display_order || index
        }));

        await ReviewImage.bulkCreate(imageData);
      }

      // 생성된 리뷰 조회 (관계 데이터 포함)
      const createdReview = await Review.findByPk(review.review_id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'user_type']
          },
          {
            model: ReviewImage,
            as: 'images',
            order: [['display_order', 'ASC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: '리뷰가 성공적으로 작성되었습니다.',
        data: createdReview
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '리뷰 작성에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 리뷰 수정
  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const updateData = req.body;

      const review = await Review.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: '리뷰를 찾을 수 없습니다.'
        });
      }

      // 평점 검증
      const ratings = ['overall_rating', 'accessibility_rating', 'mobility_rating', 'facility_rating', 'service_rating'];
      for (let field of ratings) {
        if (updateData[field] !== undefined && (updateData[field] < 1.0 || updateData[field] > 5.0)) {
          return res.status(400).json({
            success: false,
            message: '평점은 1.0에서 5.0 사이여야 합니다.'
          });
        }
      }

      // 리뷰 업데이트
      await review.update(updateData);

      // 이미지 업데이트 (있는 경우)
      if (updateData.images) {
        // 기존 이미지 삭제
        await ReviewImage.destroy({
          where: { review_id: reviewId }
        });

        // 새 이미지 추가
        if (updateData.images.length > 0) {
          const imageData = updateData.images.map((img, index) => ({
            review_id: reviewId,
            image_url: img.image_url,
            image_type: img.image_type || 'general',
            description: img.description,
            display_order: img.display_order || index
          }));

          await ReviewImage.bulkCreate(imageData);
        }
      }

      // 업데이트된 리뷰 조회
      const updatedReview = await Review.findByPk(reviewId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'user_type']
          },
          {
            model: ReviewImage,
            as: 'images',
            order: [['display_order', 'ASC']]
          }
        ]
      });

      res.json({
        success: true,
        message: '리뷰가 성공적으로 수정되었습니다.',
        data: updatedReview
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '리뷰 수정에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 리뷰 삭제
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: '리뷰를 찾을 수 없습니다.'
        });
      }

      // 관련 이미지들도 함께 삭제 (CASCADE로 자동 삭제됨)
      await review.destroy();

      res.json({
        success: true,
        message: '리뷰가 성공적으로 삭제되었습니다.'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '리뷰 삭제에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 리뷰 도움됨 토글
  async toggleHelpful(req, res) {
    try {
      const { reviewId } = req.params;

      const review = await Review.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: '리뷰를 찾을 수 없습니다.'
        });
      }

      // 도움됨 수 증가
      await review.increment('helpful_count');

      res.json({
        success: true,
        message: '도움됨이 추가되었습니다.',
        data: {
          helpful_count: review.helpful_count + 1
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '도움됨 처리에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 리뷰 이미지 업로드
  async uploadReviewImages(req, res) {
    try {
      const { reviewId } = req.params;
      const { imageType = 'general', description = '' } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: '이미지 파일이 필요합니다.'
        });
      }

      // 리뷰 존재 확인
      const review = await Review.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: '리뷰를 찾을 수 없습니다.'
        });
      }

      // 기존 이미지 개수 확인 (최대 10개 제한)
      const existingImagesCount = await ReviewImage.count({
        where: { review_id: reviewId }
      });

      if (existingImagesCount + req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: '리뷰당 최대 10개의 이미지만 업로드할 수 있습니다.'
        });
      }

      // uploads/reviews 디렉토리 생성
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'reviews');
      await fs.mkdir(uploadsDir, { recursive: true });

      const uploadedImages = [];

      // 각 파일 처리
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filename = `review_${reviewId}_${Date.now()}_${i}.jpg`;
        const filepath = path.join(uploadsDir, filename);

        // Sharp를 사용한 이미지 리사이징 및 최적화
        await sharp(file.buffer)
          .resize(800, 600, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toFile(filepath);

        // 데이터베이스에 이미지 정보 저장
        const imageUrl = `/uploads/reviews/${filename}`;
        const reviewImage = await ReviewImage.create({
          review_id: reviewId,
          image_url: imageUrl,
          image_type: imageType,
          description: description,
          display_order: existingImagesCount + i
        });

        uploadedImages.push(reviewImage);
      }

      res.status(201).json({
        success: true,
        message: '이미지가 성공적으로 업로드되었습니다.',
        data: {
          images: uploadedImages
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '이미지 업로드에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 리뷰 이미지 삭제
  async deleteReviewImage(req, res) {
    try {
      const { imageId } = req.params;

      const reviewImage = await ReviewImage.findByPk(imageId);
      if (!reviewImage) {
        return res.status(404).json({
          success: false,
          message: '이미지를 찾을 수 없습니다.'
        });
      }

      // 파일 시스템에서 이미지 삭제
      const imagePath = path.join(__dirname, '..', 'uploads', path.basename(reviewImage.image_url));
      try {
        await fs.unlink(imagePath);
      } catch (error) {
      }

      // 데이터베이스에서 이미지 정보 삭제
      await reviewImage.destroy();

      res.json({
        success: true,
        message: '이미지가 성공적으로 삭제되었습니다.'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '이미지 삭제에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 사용자별 리뷰 목록 조회
  async getReviewsByUser(req, res) {
    try {
      const { userId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'created_at', 
        sortOrder = 'DESC',
        status = 'approved'
      } = req.query;

      // 현재 로그인한 사용자가 자신의 리뷰만 조회할 수 있도록 권한 체크
      console.log('사용자별 리뷰 조회 요청:', {
        requestUserId: userId,
        requestUserIdType: typeof userId,
        loggedInUserId: req.user.user_id,
        loggedInUserIdType: typeof req.user.user_id
      });
      
      if (req.user.user_id !== userId && req.user.user_id !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: '권한이 없습니다.'
        });
      }

      const offset = (page - 1) * limit;

      const reviews = await Review.findAndCountAll({
        where: {
          user_id: userId,
          status: status
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'user_type', 'created_at']
          },
          {
            model: Destination,
            as: 'destination',
            attributes: ['id', 'name', 'category', 'region']
          },
          {
            model: ReviewImage,
            as: 'images',
            attributes: ['image_id', 'image_url', 'image_type', 'description', 'display_order'],
            order: [['display_order', 'ASC']]
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: offset
      });

      // 통계 계산
      const stats = await Review.findOne({
        where: {
          user_id: userId,
          status: 'approved'
        },
        attributes: [
          [Review.sequelize.fn('AVG', Review.sequelize.col('overall_rating')), 'avgOverallRating'],
          [Review.sequelize.fn('SUM', Review.sequelize.col('helpful_count')), 'totalHelpful'],
          [Review.sequelize.fn('COUNT', Review.sequelize.col('review_id')), 'totalReviews']
        ],
        raw: true
      });

      res.json({
        success: true,
        data: {
          reviews: reviews.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(reviews.count / limit),
            totalItems: reviews.count,
            itemsPerPage: parseInt(limit)
          },
          statistics: {
            averageRating: parseFloat(stats.avgOverallRating || 0).toFixed(1),
            totalHelpful: parseInt(stats.totalHelpful || 0),
            totalReviews: parseInt(stats.totalReviews || 0)
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '리뷰 목록을 불러올 수 없습니다.',
        error: error.message
      });
    }
  }
};

module.exports = reviewController;