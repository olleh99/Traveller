const { TravelPlan, PlanDay, PlanDestination, Destination, User } = require('../models/sequelize');
const { AppError } = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

const travelPlanController = {
  // 여행 계획 목록 조회 (사용자별)
  async getTravelPlans(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { page = 1, limit = 10, status, sort = 'created_at' } = req.query;
      
      const offset = (page - 1) * limit;
      
      // 조건 설정
      const whereClause = { user_id: userId };
      if (status) {
        whereClause.status = status;
      }
      
      // 정렬 설정
      const orderClause = [];
      switch (sort) {
        case 'start_date':
          orderClause.push(['start_date', 'ASC']);
          break;
        case 'title':
          orderClause.push(['title', 'ASC']);
          break;
        case 'updated_at':
          orderClause.push(['updated_at', 'DESC']);
          break;
        default:
          orderClause.push(['created_at', 'DESC']);
      }

      const { count, rows: travelPlans } = await TravelPlan.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: PlanDay,
            as: 'planDays',
            include: [
              {
                model: PlanDestination,
                as: 'planDestinations',
                include: [
                  {
                    model: Destination,
                    as: 'destination',
                    attributes: ['id', 'name', 'region', 'category', 'accessibilityLevel']
                  }
                ]
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: orderClause,
        distinct: true
      });

      // 계획별 통계 계산
      const plansWithStats = travelPlans.map(plan => {
        const planData = plan.toJSON();
        const totalDestinations = planData.planDays?.reduce((total, day) => 
          total + (day.planDestinations?.length || 0), 0) || 0;
        
        return {
          ...planData,
          statistics: {
            totalDays: planData.planDays?.length || 0,
            totalDestinations,
            duration: planData.start_date && planData.end_date ? 
              Math.ceil((new Date(planData.end_date) - new Date(planData.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 0
          }
        };
      });

      res.json({
        success: true,
        data: {
          travelPlans: plansWithStats,
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

  // 여행 계획 상세 조회
  async getTravelPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.user_id;

      const travelPlan = await TravelPlan.findOne({
        where: { plan_id: planId, user_id: userId },
        include: [
          {
            model: PlanDay,
            as: 'planDays',
            order: [['day_number', 'ASC']],
            include: [
              {
                model: PlanDestination,
                as: 'planDestinations',
                order: [['order_index', 'ASC']],
                include: [
                  {
                    model: Destination,
                    as: 'destination',
                    attributes: ['id', 'name', 'description', 'region', 'category', 'accessibilityLevel', 'address']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!travelPlan) {
        throw new AppError('여행 계획을 찾을 수 없습니다.', 404);
      }

      // 통계 정보 추가
      const planData = travelPlan.toJSON();
      const totalDestinations = planData.planDays?.reduce((total, day) => 
        total + (day.planDestinations?.length || 0), 0) || 0;

      const responseData = {
        ...planData,
        statistics: {
          totalDays: planData.planDays?.length || 0,
          totalDestinations,
          duration: planData.start_date && planData.end_date ? 
            Math.ceil((new Date(planData.end_date) - new Date(planData.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 0
        }
      };

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  },

  // 여행 계획 생성
  async createTravelPlan(req, res, next) {
    try {
      const userId = req.user.user_id;
      const {
        title,
        description,
        start_date,
        end_date,
        travelers_count = 1,
        has_disabled_member = false,
        accessibility_requirements = [],
        budget,
        is_public = false
      } = req.body;

      // 유효성 검사
      if (!title || !start_date || !end_date) {
        throw new AppError('제목, 시작일, 종료일은 필수입니다.', 400);
      }

      if (new Date(end_date) <= new Date(start_date)) {
        throw new AppError('종료일은 시작일보다 늦어야 합니다.', 400);
      }

      // 여행 계획 생성
      const travelPlan = await TravelPlan.create({
        user_id: userId,
        title,
        description,
        start_date,
        end_date,
        travelers_count,
        has_disabled_member,
        accessibility_requirements,
        budget,
        is_public,
        status: 'draft'
      });

      // 날짜별 PlanDay 자동 생성
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      const planDays = [];
      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const planDay = await PlanDay.create({
          plan_id: travelPlan.plan_id,
          day_number: i + 1,
          date: currentDate.toISOString().split('T')[0],
          title: `${i + 1}일차`
        });
        
        planDays.push(planDay);
      }

      // 생성된 계획 상세 조회
      const createdPlan = await TravelPlan.findByPk(travelPlan.plan_id, {
        include: [
          {
            model: PlanDay,
            as: 'planDays',
            order: [['day_number', 'ASC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: '여행 계획이 생성되었습니다.',
        data: createdPlan
      });
    } catch (error) {
      next(error);
    }
  },

  // 여행 계획 수정
  async updateTravelPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.user_id;
      const updateData = req.body;

      const travelPlan = await TravelPlan.findOne({
        where: { plan_id: planId, user_id: userId }
      });

      if (!travelPlan) {
        throw new AppError('여행 계획을 찾을 수 없습니다.', 404);
      }

      // 날짜 변경 시 유효성 검사
      if (updateData.start_date && updateData.end_date) {
        if (new Date(updateData.end_date) <= new Date(updateData.start_date)) {
          throw new AppError('종료일은 시작일보다 늦어야 합니다.', 400);
        }
      }

      await travelPlan.update(updateData);

      // 업데이트된 계획 조회
      const updatedPlan = await TravelPlan.findByPk(planId, {
        include: [
          {
            model: PlanDay,
            as: 'planDays',
            order: [['day_number', 'ASC']],
            include: [
              {
                model: PlanDestination,
                as: 'planDestinations',
                order: [['order_index', 'ASC']],
                include: [
                  {
                    model: Destination,
                    as: 'destination',
                    attributes: ['id', 'name', 'region', 'category', 'accessibilityLevel']
                  }
                ]
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: '여행 계획이 수정되었습니다.',
        data: updatedPlan
      });
    } catch (error) {
      next(error);
    }
  },

  // 여행 계획 삭제
  async deleteTravelPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.user_id;

      const travelPlan = await TravelPlan.findOne({
        where: { plan_id: planId, user_id: userId }
      });

      if (!travelPlan) {
        throw new AppError('여행 계획을 찾을 수 없습니다.', 404);
      }

      // 관련 데이터 삭제 (CASCADE로 처리됨)
      await travelPlan.destroy();

      res.json({
        success: true,
        message: '여행 계획이 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  // 여행지를 일정에 추가
  async addDestinationToPlan(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.user_id;
      const {
        day_number,
        destination_id,
        order_index,
        start_time,
        end_time,
        duration_minutes,
        transportation_mode = 'public',
        transportation_notes,
        notes
      } = req.body;

      // 여행 계획 권한 확인
      const travelPlan = await TravelPlan.findOne({
        where: { plan_id: planId, user_id: userId }
      });

      if (!travelPlan) {
        throw new AppError('여행 계획을 찾을 수 없습니다.', 404);
      }

      // 해당 일차 찾기
      const planDay = await PlanDay.findOne({
        where: { plan_id: planId, day_number }
      });

      if (!planDay) {
        throw new AppError('해당 일차를 찾을 수 없습니다.', 404);
      }

      // 여행지 존재 확인
      const destination = await Destination.findByPk(destination_id);
      if (!destination) {
        throw new AppError('여행지를 찾을 수 없습니다.', 404);
      }

      // 중복 확인
      const existingPlanDestination = await PlanDestination.findOne({
        where: { 
          day_id: planDay.day_id, 
          destination_id 
        }
      });

      if (existingPlanDestination) {
        throw new AppError('이미 해당 일차에 추가된 여행지입니다.', 400);
      }

      // order_index가 제공되지 않으면 마지막 순서로 설정
      let finalOrderIndex = order_index;
      if (finalOrderIndex === undefined) {
        const lastDestination = await PlanDestination.findOne({
          where: { day_id: planDay.day_id },
          order: [['order_index', 'DESC']]
        });
        finalOrderIndex = lastDestination ? lastDestination.order_index + 1 : 0;
      }

      // 여행지 추가
      const planDestination = await PlanDestination.create({
        day_id: planDay.day_id,
        destination_id,
        order_index: finalOrderIndex,
        start_time,
        end_time,
        duration_minutes,
        transportation_mode,
        transportation_notes,
        notes
      });

      // 추가된 여행지 정보와 함께 반환
      const addedDestination = await PlanDestination.findByPk(planDestination.plan_destination_id, {
        include: [
          {
            model: Destination,
            as: 'destination',
            attributes: ['id', 'name', 'description', 'image', 'region', 'category', 'accessibilityLevel']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: '여행지가 일정에 추가되었습니다.',
        data: addedDestination
      });
    } catch (error) {
      next(error);
    }
  },

  // 일정에서 여행지 제거
  async removeDestinationFromPlan(req, res, next) {
    try {
      const { planId, planDestinationId } = req.params;
      const userId = req.user.user_id;

      // 여행 계획 권한 확인
      const travelPlan = await TravelPlan.findOne({
        where: { plan_id: planId, user_id: userId }
      });

      if (!travelPlan) {
        throw new AppError('여행 계획을 찾을 수 없습니다.', 404);
      }

      // 계획 여행지 찾기
      const planDestination = await PlanDestination.findOne({
        where: { plan_destination_id: planDestinationId },
        include: [
          {
            model: PlanDay,
            as: 'planDay',
            where: { plan_id: planId }
          }
        ]
      });

      if (!planDestination) {
        throw new AppError('일정에서 여행지를 찾을 수 없습니다.', 404);
      }

      await planDestination.destroy();

      res.json({
        success: true,
        message: '여행지가 일정에서 제거되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  // 여행지 순서 변경
  async updateDestinationOrder(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.user_id;
      const { destinations } = req.body; // [{ plan_destination_id, order_index }]

      // 여행 계획 권한 확인
      const travelPlan = await TravelPlan.findOne({
        where: { plan_id: planId, user_id: userId }
      });

      if (!travelPlan) {
        throw new AppError('여행 계획을 찾을 수 없습니다.', 404);
      }

      // 배치 업데이트
      const updatePromises = destinations.map(dest => 
        PlanDestination.update(
          { order_index: dest.order_index },
          { where: { plan_destination_id: dest.plan_destination_id } }
        )
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: '여행지 순서가 업데이트되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  // 여행 계획 상태 변경
  async updatePlanStatus(req, res, next) {
    try {
      const { planId } = req.params;
      const userId = req.user.user_id;
      const { status } = req.body;

      const validStatuses = ['draft', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new AppError('유효하지 않은 상태입니다.', 400);
      }

      const travelPlan = await TravelPlan.findOne({
        where: { plan_id: planId, user_id: userId }
      });

      if (!travelPlan) {
        throw new AppError('여행 계획을 찾을 수 없습니다.', 404);
      }

      await travelPlan.update({ status });

      res.json({
        success: true,
        message: '여행 계획 상태가 변경되었습니다.',
        data: { status }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = travelPlanController;