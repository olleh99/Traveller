const { User, DisabilityProfile, CompanionProfile } = require('../models/sequelize');
const { AppError } = require('../utils/errorHandler');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const userController = {
  // 프로필 조회
  async getProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ['password_hash', 'createdAt', 'updatedAt']
        },
        include: [
          {
            model: DisabilityProfile,
            as: 'disabilityProfile',
            required: false
          },
          {
            model: CompanionProfile,
            as: 'companionProfile',
            required: false
          }
        ]
      });

      if (!user) {
        throw new AppError('사용자를 찾을 수 없습니다.', 404);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  // 기본 프로필 수정
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        name,
        nickname,
        phone_number,
        birth_date,
        gender,
        address
      } = req.body;
      

      // 기본 validation
      if (!name || name.trim().length < 2) {
        throw new AppError('이름은 2글자 이상이어야 합니다.', 400);
      }
      
      if (!nickname || nickname.trim().length < 2) {
        throw new AppError('닉네임은 2글자 이상이어야 합니다.', 400);
      }

      // 기존 사용자 정보 확인
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('사용자를 찾을 수 없습니다.', 404);
      }

      // 닉네임 중복 확인 (본인 제외)
      if (nickname && nickname !== user.nickname) {
        const existingUser = await User.findOne({
          where: { nickname },
          attributes: ['user_id']
        });
        
        if (existingUser) {
          throw new AppError('이미 사용 중인 닉네임입니다.', 400);
        }
      }

      // 사용자 정보 업데이트 (필드명 매핑)
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (nickname !== undefined) updateData.nickname = nickname;
      if (phone_number !== undefined) updateData.phone = phone_number || null; // phone_number -> phone
      if (birth_date !== undefined) updateData.birth_date = birth_date;
      if (gender !== undefined) updateData.gender = gender;
      if (address !== undefined) updateData.region_city = address || null; // address -> region_city
      

      await user.update(updateData);

      // 업데이트된 사용자 정보 조회
      const updatedUser = await User.findByPk(userId, {
        attributes: {
          exclude: ['password_hash', 'createdAt', 'updatedAt']
        },
        include: [
          {
            model: DisabilityProfile,
            as: 'disabilityProfile',
            required: false
          },
          {
            model: CompanionProfile,
            as: 'companionProfile',
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  },

  // 장애인 프로필 수정
  async updateDisabilityProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        disability_type,
        disability_level,
        mobility_aid,
        assistance_needs,
        emergency_contact,
        medical_conditions
      } = req.body;

      // 기존 프로필 확인
      let disabilityProfile = await DisabilityProfile.findOne({
        where: { user_id: userId }
      });

      const updateData = {
        user_id: userId,
        disability_type,
        disability_level,
        mobility_aid,
        assistance_needs,
        emergency_contact,
        medical_conditions
      };

      if (disabilityProfile) {
        // 기존 프로필 업데이트
        await disabilityProfile.update(updateData);
      } else {
        // 새 프로필 생성
        disabilityProfile = await DisabilityProfile.create(updateData);
      }

      res.json({
        success: true,
        message: '장애인 프로필이 성공적으로 업데이트되었습니다.',
        data: disabilityProfile
      });
    } catch (error) {
      next(error);
    }
  },

  // 동행인 프로필 수정
  async updateCompanionProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        supported_disabilities,
        experience_years,
        certifications,
        specializations,
        availability,
        rate_per_hour
      } = req.body;

      // 기존 프로필 확인
      let companionProfile = await CompanionProfile.findOne({
        where: { user_id: userId }
      });

      const updateData = {
        user_id: userId,
        supported_disabilities,
        experience_years,
        certifications,
        specializations,
        availability,
        rate_per_hour
      };

      if (companionProfile) {
        // 기존 프로필 업데이트
        await companionProfile.update(updateData);
      } else {
        // 새 프로필 생성
        companionProfile = await CompanionProfile.create(updateData);
      }

      res.json({
        success: true,
        message: '동행인 프로필이 성공적으로 업데이트되었습니다.',
        data: companionProfile
      });
    } catch (error) {
      next(error);
    }
  },

  // 프로필 이미지 업로드
  async uploadProfileImage(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      if (!req.file) {
        throw new AppError('이미지 파일이 필요합니다.', 400);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('사용자를 찾을 수 없습니다.', 404);
      }

      // 이전 이미지 삭제
      if (user.profile_image_url) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(user.profile_image_url));
        try {
          await fs.unlink(oldImagePath);
        } catch (error) {
        }
      }

      // 이미지 처리 및 저장
      const filename = `profile_${userId}_${Date.now()}.jpg`;
      const filepath = path.join(__dirname, '..', 'uploads', 'profiles', filename);
      
      // uploads/profiles 디렉토리 생성
      await fs.mkdir(path.join(__dirname, '..', 'uploads', 'profiles'), { recursive: true });

      // Sharp를 사용한 이미지 리사이징 및 최적화
      await sharp(req.file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toFile(filepath);

      // 데이터베이스 업데이트
      const imageUrl = `/uploads/profiles/${filename}`;
      await user.update({ profile_image_url: imageUrl });

      res.json({
        success: true,
        message: '프로필 이미지가 업로드되었습니다.',
        data: {
          profile_image_url: imageUrl
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 프로필 이미지 삭제
  async deleteProfileImage(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('사용자를 찾을 수 없습니다.', 404);
      }

      if (user.profile_image_url) {
        const imagePath = path.join(__dirname, '..', 'uploads', path.basename(user.profile_image_url));
        try {
          await fs.unlink(imagePath);
        } catch (error) {
        }
      }

      await user.update({ profile_image_url: null });

      res.json({
        success: true,
        message: '프로필 이미지가 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  // 장애인 프로필 조회
  async getDisabilityProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      const user = await User.findByPk(userId);
      if (!user || user.user_type !== 'disabled_traveler') {
        throw new AppError('권한이 없습니다.', 403);
      }

      const profile = await DisabilityProfile.findOne({
        where: { user_id: userId }
      });

      if (!profile) {
        return res.json({
          success: true,
          data: null,
          message: '장애 프로필이 아직 생성되지 않았습니다.'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  },

  // 장애인 프로필 수정
  async updateDisabilityProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        disability_types,
        support_needs,
        assistive_devices,
        emergency_contacts
      } = req.body;

      const user = await User.findByPk(userId);
      if (!user || user.user_type !== 'disabled_traveler') {
        throw new AppError('권한이 없습니다.', 403);
      }

      let profile = await DisabilityProfile.findOne({
        where: { user_id: userId }
      });

      if (!profile) {
        // 프로필이 없으면 생성
        profile = await DisabilityProfile.create({
          user_id: userId,
          disability_types: disability_types || [],
          support_needs: support_needs || {},
          assistive_devices: assistive_devices || [],
          emergency_contacts: emergency_contacts || []
        });
      } else {
        // 프로필이 있으면 업데이트
        await profile.update({
          disability_types: disability_types || profile.disability_types,
          support_needs: support_needs || profile.support_needs,
          assistive_devices: assistive_devices || profile.assistive_devices,
          emergency_contacts: emergency_contacts || profile.emergency_contacts
        });
      }

      res.json({
        success: true,
        message: '장애 프로필이 업데이트되었습니다.',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  },

  // 동행인 프로필 조회
  async getCompanionProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      const user = await User.findByPk(userId);
      if (!user || user.user_type !== 'companion') {
        throw new AppError('권한이 없습니다.', 403);
      }

      const profile = await CompanionProfile.findOne({
        where: { user_id: userId }
      });

      if (!profile) {
        return res.json({
          success: true,
          data: null,
          message: '동행인 프로필이 아직 생성되지 않았습니다.'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  },

  // 동행인 프로필 수정
  async updateCompanionProfile(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        supportable_disabilities,
        experience_years,
        experience_description,
        certifications
      } = req.body;

      const user = await User.findByPk(userId);
      if (!user || user.user_type !== 'companion') {
        throw new AppError('권한이 없습니다.', 403);
      }

      let profile = await CompanionProfile.findOne({
        where: { user_id: userId }
      });

      if (!profile) {
        // 프로필이 없으면 생성
        profile = await CompanionProfile.create({
          user_id: userId,
          supportable_disabilities: supportable_disabilities || [],
          experience_years: experience_years || 0,
          experience_description: experience_description || '',
          certifications: certifications || []
        });
      } else {
        // 프로필이 있으면 업데이트
        await profile.update({
          supportable_disabilities: supportable_disabilities || profile.supportable_disabilities,
          experience_years: experience_years !== undefined ? experience_years : profile.experience_years,
          experience_description: experience_description || profile.experience_description,
          certifications: certifications || profile.certifications
        });
      }

      res.json({
        success: true,
        message: '동행인 프로필이 업데이트되었습니다.',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  },

  // 사용자 활동 통계 조회
  async getProfileStatistics(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      // 필요한 모델들 import
      const { Review, Favorite, TravelPlan } = require('../models/sequelize');
      
      // 병렬로 모든 통계 데이터 조회
      const [reviewCount, reviewStats, favoriteStats, travelPlanStats] = await Promise.all([
        // 리뷰 개수
        Review.count({
          where: { user_id: userId }
        }),
        
        // 리뷰 집계 통계
        Review.findOne({
          where: { user_id: userId },
          attributes: [
            [Review.sequelize.fn('AVG', Review.sequelize.col('overall_rating')), 'avgRating'],
            [Review.sequelize.fn('SUM', Review.sequelize.col('helpful_count')), 'totalHelpful']
          ],
          raw: true
        }),
        
        // 즐겨찾기 통계
        Favorite.count({
          where: { user_id: userId }
        }),
        
        // 여행 계획 통계
        TravelPlan.findAndCountAll({
          where: { user_id: userId },
          attributes: [
            'status',
            [TravelPlan.sequelize.fn('COUNT', TravelPlan.sequelize.col('plan_id')), 'count']
          ],
          group: ['status'],
          raw: true
        })
      ]);

      // 여행 계획 상태별 통계 정리
      const planStatusStats = {
        draft: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
      };

      if (travelPlanStats.rows) {
        travelPlanStats.rows.forEach(row => {
          planStatusStats[row.status] = parseInt(row.count) || 0;
        });
      }


      const statistics = {
        reviews: {
          total: reviewCount || 0,
          averageRating: parseFloat(reviewStats?.avgRating || 0).toFixed(1),
          totalHelpful: parseInt(reviewStats?.totalHelpful || 0)
        },
        favorites: {
          total: favoriteStats || 0
        },
        travelPlans: {
          total: Object.values(planStatusStats).reduce((sum, count) => sum + count, 0),
          byStatus: planStatusStats
        },
        profileCompletion: calculateProfileCompletion(req.user)
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  },

  // 최근 활동 내역 조회
  async getRecentActivities(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { limit = 10 } = req.query;

      const { Review, Favorite, TravelPlan, Destination } = require('../models/sequelize');

      // 병렬로 최근 활동 조회
      const [recentReviews, recentFavorites, recentTravelPlans] = await Promise.all([
        // 최근 리뷰
        Review.findAll({
          where: { user_id: userId },
          include: [{
            model: Destination,
            as: 'destination',
            attributes: ['id', 'name']
          }],
          order: [['created_at', 'DESC']],
          limit: Math.ceil(limit / 3),
          attributes: ['review_id', 'title', 'overall_rating', 'created_at']
        }),

        // 최근 즐겨찾기
        Favorite.findAll({
          where: { user_id: userId },
          include: [{
            model: Destination,
            as: 'destination',
            attributes: ['id', 'name']
          }],
          order: [['created_at', 'DESC']],
          limit: Math.ceil(limit / 3),
          attributes: ['favorite_id', 'created_at']
        }),

        // 최근 여행 계획
        TravelPlan.findAll({
          where: { user_id: userId },
          order: [['updated_at', 'DESC']],
          limit: Math.ceil(limit / 3),
          attributes: ['plan_id', 'title', 'status', 'start_date', 'end_date', 'updated_at']
        })
      ]);

      // 활동을 통합하고 시간순으로 정렬
      const activities = [];
      

      recentReviews.forEach(review => {
        activities.push({
          type: 'review',
          id: review.review_id,
          title: review.title,
          subtitle: `${review.destination?.name || '여행지'}에 대한 리뷰 (${review.overall_rating}점)`,
          date: review.created_at,
          data: review
        });
      });

      recentFavorites.forEach(favorite => {
        activities.push({
          type: 'favorite',
          id: favorite.favorite_id,
          title: '즐겨찾기 추가',
          subtitle: favorite.destination?.name || '여행지',
          date: favorite.created_at,
          data: favorite
        });
      });

      recentTravelPlans.forEach(plan => {
        activities.push({
          type: 'travel_plan',
          id: plan.plan_id,
          title: plan.title,
          subtitle: `여행 계획 (${getStatusText(plan.status)})`,
          date: plan.updated_at,
          data: plan
        });
      });

      // 날짜순으로 정렬하고 제한
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      const limitedActivities = activities.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: {
          activities: limitedActivities,
          total: activities.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

// 헬퍼 함수들
function calculateProfileCompletion(user) {
  let completed = 0;
  const total = 10; // 총 필수 항목 수

  // 기본 정보 체크
  if (user.name) completed++;
  if (user.nickname) completed++;
  if (user.email) completed++;
  if (user.phone) completed++;
  if (user.birth_date) completed++;
  if (user.gender) completed++;
  if (user.region_city) completed++;
  if (user.profile_image_url) completed++;

  // 사용자 유형별 추가 정보 체크
  if (user.user_type !== 'general') {
    if (user.disabilityProfile || user.companionProfile) completed++;
  } else {
    completed++; // 일반 사용자는 자동으로 완료
  }

  // 마케팅 동의 (선택사항이지만 완성도에 포함)
  if (user.marketing_consent !== null) completed++;

  return Math.round((completed / total) * 100);
}

function getStatusText(status) {
  const statusTexts = {
    draft: '임시저장',
    confirmed: '확정',
    completed: '완료',
    cancelled: '취소됨'
  };
  return statusTexts[status] || status;
}

module.exports = userController;