const { MatchingRequest, CompanionMatch, User, CompanionProfile, DisabilityProfile, TravelPlan, Notification } = require('../models/sequelize');
const { AppError } = require('../utils/errorHandler');
const { Op } = require('sequelize');
const socketManager = require('../config/socket');

const matchingController = {
  // 동행인 검색 및 필터링
  async searchCompanions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        supportable_disabilities,
        experience_years_min,
        sort = 'created_at'
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      // 요청한 사용자의 타입 확인
      const requestingUser = await User.findByPk(req.user.user_id);
      
      // 기본 조건: 일반 사용자는 일반 사용자를, 장애인은 동행인을 검색
      const whereClause = {
        user_type: requestingUser.user_type === 'general_user' ? 'general_user' : 'companion',
        account_status: 'active',
        user_id: { [Op.ne]: req.user.user_id } // 자신은 제외
      };
      
      // 동행인 프로필 조건
      const companionProfileWhere = {};
      
      if (supportable_disabilities) {
        const disabilities = Array.isArray(supportable_disabilities) 
          ? supportable_disabilities 
          : [supportable_disabilities];
        companionProfileWhere.supportable_disabilities = {
          [Op.overlap]: disabilities
        };
      }
      
      if (experience_years_min) {
        companionProfileWhere.experience_years = {
          [Op.gte]: parseInt(experience_years_min)
        };
      }
      
      // 정렬 설정
      const orderClause = [];
      switch (sort) {
        case 'experience':
          orderClause.push([{ model: CompanionProfile, as: 'companionProfile' }, 'experience_years', 'DESC']);
          break;
        case 'rating':
          orderClause.push([{ model: CompanionProfile, as: 'companionProfile' }, 'average_rating', 'DESC']);
          break;
        case 'recent':
          orderClause.push(['created_at', 'DESC']);
          break;
        default:
          orderClause.push(['created_at', 'DESC']);
      }
      
      // 일반 사용자를 검색하는 경우와 동행인을 검색하는 경우 구분
      const includeOptions = requestingUser.user_type === 'general_user' 
        ? [] // 일반 사용자는 프로필이 없음
        : [
            {
              model: CompanionProfile,
              as: 'companionProfile',
              where: companionProfileWhere,
              required: true
            }
          ];
      
      const { count, rows: companions } = await User.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit: parseInt(limit),
        offset: offset,
        order: orderClause,
        distinct: true
      });
      
      res.json({
        success: true,
        data: {
          companions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 매칭 요청 생성
  async createMatchingRequest(req, res, next) {
    try {
      const requesterId = req.user.user_id;
      const {
        companion_id,
        travel_plan_id,
        request_message,
        travel_start_date,
        travel_end_date,
        travel_destination,
        travelers_count,
        required_services,
        special_requirements
      } = req.body;
      
      // 요청자 확인
      const requester = await User.findByPk(requesterId);
      if (!requester) {
        throw new AppError('사용자를 찾을 수 없습니다.', 404);
      }
      
      // 대상자 존재 확인 (동행인 또는 일반 사용자)
      let targetUser;
      if (requester.user_type === 'disabled_traveler') {
        // 장애인은 동행인에게만 요청 가능
        targetUser = await User.findOne({
          where: { user_id: companion_id, user_type: 'companion' },
          include: [{
            model: CompanionProfile,
            as: 'companionProfile'
          }]
        });
        if (!targetUser) {
          throw new AppError('존재하지 않는 동행인입니다.', 404);
        }
      } else if (requester.user_type === 'general_user') {
        // 일반 사용자는 일반 사용자에게만 요청 가능
        targetUser = await User.findOne({
          where: { user_id: companion_id, user_type: 'general_user' }
        });
        if (!targetUser) {
          throw new AppError('존재하지 않는 사용자입니다.', 404);
        }
      } else {
        throw new AppError('매칭 요청을 할 수 없는 사용자 유형입니다.', 403);
      }
      
      // 중복 요청 확인 (같은 기간, 같은 동행인)
      const existingRequest = await MatchingRequest.findOne({
        where: {
          requester_id: requesterId,
          companion_id,
          status: 'pending',
          [Op.or]: [
            {
              travel_start_date: {
                [Op.between]: [travel_start_date, travel_end_date]
              }
            },
            {
              travel_end_date: {
                [Op.between]: [travel_start_date, travel_end_date]
              }
            }
          ]
        }
      });
      
      if (existingRequest) {
        throw new AppError('해당 기간에 이미 매칭 요청이 있습니다.', 400);
      }
      
      // 7일 후 자동 만료 설정
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // 매칭 요청 생성
      const matchingRequest = await MatchingRequest.create({
        requester_id: requesterId,
        companion_id,
        travel_plan_id,
        request_message,
        travel_start_date,
        travel_end_date,
        travel_destination,
        travelers_count,
        required_services,
        special_requirements,
        expires_at: expiresAt
      });
      
      // 상세 정보와 함께 반환
      const createdRequest = await MatchingRequest.findByPk(matchingRequest.request_id, {
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
          },
          {
            model: User,
            as: 'companion',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url'],
            include: [{
              model: CompanionProfile,
              as: 'companionProfile'
            }]
          },
          {
            model: TravelPlan,
            as: 'travelPlan',
            attributes: ['plan_id', 'title', 'description']
          }
        ]
      });
      
      // 알림 생성 및 전송
      const notification = await Notification.createMatchingRequestNotification(
        companion_id,
        requester,
        matchingRequest.request_id
      );
      
      // Socket으로 실시간 알림 전송
      socketManager.sendNotification(companion_id, notification);
      
      res.status(201).json({
        success: true,
        message: '매칭 요청이 성공적으로 전송되었습니다.',
        data: createdRequest
      });
    } catch (error) {
      next(error);
    }
  },

  // 받은 매칭 요청 목록 조회 (동행인용)
  async getReceivedRequests(req, res, next) {
    try {
      const companionId = req.user.user_id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = { companion_id: companionId };
      if (status) {
        whereClause.status = status;
      }
      
      const { count, rows: requests } = await MatchingRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url'],
            include: [{
              model: DisabilityProfile,
              as: 'disabilityProfile'
            }]
          },
          {
            model: TravelPlan,
            as: 'travelPlan',
            attributes: ['plan_id', 'title', 'description']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          requests,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 보낸 매칭 요청 목록 조회 (장애인 여행자용)
  async getSentRequests(req, res, next) {
    try {
      const requesterId = req.user.user_id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = { requester_id: requesterId };
      if (status) {
        whereClause.status = status;
      }
      
      const { count, rows: requests } = await MatchingRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'companion',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url'],
            include: [{
              model: CompanionProfile,
              as: 'companionProfile'
            }]
          },
          {
            model: TravelPlan,
            as: 'travelPlan',
            attributes: ['plan_id', 'title', 'description']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          requests,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 매칭 요청 응답 (승인/거절)
  async respondToRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const companionId = req.user.user_id;
      const { status, response_message } = req.body;
      
      if (!['accepted', 'rejected'].includes(status)) {
        throw new AppError('유효하지 않은 응답 상태입니다.', 400);
      }
      
      // 매칭 요청 찾기
      const matchingRequest = await MatchingRequest.findOne({
        where: { 
          request_id: requestId, 
          companion_id: companionId,
          status: 'pending'
        },
        include: [
          {
            model: User,
            as: 'requester'
          }
        ]
      });
      
      if (!matchingRequest) {
        throw new AppError('매칭 요청을 찾을 수 없거나 이미 처리되었습니다.', 404);
      }
      
      // 요청 상태 업데이트
      await matchingRequest.update({
        status,
        response_message,
        responded_at: new Date()
      });
      
      // 승인된 경우 CompanionMatch 생성
      let createdMatch = null;
      if (status === 'accepted') {
        console.log('Creating CompanionMatch with:', {
          traveler_id: matchingRequest.requester_id,
          companion_id: companionId,
          travel_plan_id: matchingRequest.travel_plan_id,
          matching_request_id: requestId,
          start_date: matchingRequest.travel_start_date,
          end_date: matchingRequest.travel_end_date
        });
        
        createdMatch = await CompanionMatch.create({
          traveler_id: matchingRequest.requester_id,
          companion_id: companionId,
          travel_plan_id: matchingRequest.travel_plan_id,
          matching_request_id: requestId,
          start_date: matchingRequest.travel_start_date,
          end_date: matchingRequest.travel_end_date
        });
        
        // 승인 알림 생성 및 전송
        const acceptedByUser = await User.findByPk(companionId);
        const notification = await Notification.createMatchingAcceptedNotification(
          matchingRequest.requester_id,
          acceptedByUser,
          createdMatch.match_id
        );
        socketManager.sendNotification(matchingRequest.requester_id, notification);
      } else if (status === 'rejected') {
        // 거절 알림 생성 및 전송
        const rejectedByUser = await User.findByPk(companionId);
        const notification = await Notification.createMatchingRejectedNotification(
          matchingRequest.requester_id,
          rejectedByUser
        );
        socketManager.sendNotification(matchingRequest.requester_id, notification);
      }
      
      res.json({
        success: true,
        message: status === 'accepted' ? '매칭 요청을 승인했습니다.' : '매칭 요청을 거절했습니다.',
        data: matchingRequest
      });
    } catch (error) {
      next(error);
    }
  },

  // 매칭 요청 취소 (요청자용)
  async cancelRequest(req, res, next) {
    try {
      const { requestId } = req.params;
      const requesterId = req.user.user_id;
      
      const matchingRequest = await MatchingRequest.findOne({
        where: { 
          request_id: requestId, 
          requester_id: requesterId,
          status: 'pending'
        }
      });
      
      if (!matchingRequest) {
        throw new AppError('매칭 요청을 찾을 수 없거나 이미 처리되었습니다.', 404);
      }
      
      await matchingRequest.update({
        status: 'cancelled',
        responded_at: new Date()
      });
      
      res.json({
        success: true,
        message: '매칭 요청이 취소되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  // 매칭 종료
  async endMatch(req, res, next) {
    try {
      const { matchId } = req.params;
      const userId = req.user.user_id;
      
      // 매칭 찾기 (자신이 참여한 매칭만)
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ],
          status: 'active'
        }
      });
      
      if (!match) {
        throw new AppError('매칭을 찾을 수 없거나 이미 종료되었습니다.', 404);
      }
      
      // 매칭 종료
      await match.update({
        status: 'completed',
        end_date: new Date()
      });
      
      res.json({
        success: true,
        message: '매칭이 종료되었습니다.',
        data: match
      });
    } catch (error) {
      next(error);
    }
  },

  // 나의 매칭 목록 조회 (성사된 매칭들)
  async getMyMatches(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;
      
      const whereClause = {
        [Op.or]: [
          { traveler_id: userId },
          { companion_id: userId }
        ]
      };
      
      if (status) {
        whereClause.status = status;
      }
      
      const { count, rows: matches } = await CompanionMatch.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'traveler',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
          },
          {
            model: User,
            as: 'companion',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
          },
          {
            model: TravelPlan,
            as: 'travelPlan',
            attributes: ['plan_id', 'title', 'description']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          matches,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = matchingController;