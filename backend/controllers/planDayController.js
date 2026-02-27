const { PlanDay, PlanDestination, Destination, TravelPlan, sequelize } = require('../models/sequelize');

const planDayController = {
  // 특정 일차에 여행지 추가
  async addDestinationToDay(req, res) {
    try {
      const { dayId } = req.params;
      const {
        destination_id,
        start_time,
        end_time,
        duration_minutes,
        transportation_mode = 'public',
        transportation_notes,
        notes
      } = req.body;

      if (!destination_id) {
        return res.status(400).json({
          success: false,
          message: '여행지 ID가 필요합니다.'
        });
      }

      // 일차 존재 확인
      const day = await PlanDay.findByPk(dayId);
      if (!day) {
        return res.status(404).json({
          success: false,
          message: '해당 일차를 찾을 수 없습니다.'
        });
      }

      // 여행지 존재 확인
      const destination = await Destination.findByPk(destination_id);
      if (!destination) {
        return res.status(404).json({
          success: false,
          message: '여행지를 찾을 수 없습니다.'
        });
      }

      // 해당 일차의 마지막 순서 확인
      const lastDestination = await PlanDestination.findOne({
        where: { day_id: dayId },
        order: [['order_index', 'DESC']]
      });

      const newOrderIndex = lastDestination ? lastDestination.order_index + 1 : 0;

      // 여행지 추가
      const planDestination = await PlanDestination.create({
        day_id: dayId,
        destination_id,
        order_index: newOrderIndex,
        start_time,
        end_time,
        duration_minutes,
        transportation_mode,
        transportation_notes,
        notes
      });

      // 추가된 여행지 정보와 함께 반환
      const result = await PlanDestination.findByPk(planDestination.plan_destination_id, {
        include: [
          {
            model: Destination,
            as: 'destination'
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: '여행지가 일정에 추가되었습니다.',
        data: result
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '여행지 추가에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 일차에서 여행지 제거
  async removeDestinationFromDay(req, res) {
    try {
      const { planDestinationId } = req.params;

      const planDestination = await PlanDestination.findByPk(planDestinationId);
      
      if (!planDestination) {
        return res.status(404).json({
          success: false,
          message: '해당 여행지를 찾을 수 없습니다.'
        });
      }

      const dayId = planDestination.day_id;
      const removedOrderIndex = planDestination.order_index;

      await planDestination.destroy();

      // 제거된 여행지 이후의 순서 재정렬
      await PlanDestination.update(
        { order_index: sequelize.literal('order_index - 1') },
        {
          where: {
            day_id: dayId,
            order_index: { [sequelize.Op.gt]: removedOrderIndex }
          }
        }
      );

      res.json({
        success: true,
        message: '여행지가 일정에서 제거되었습니다.'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '여행지 제거에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 여행지 순서 변경
  async reorderDestinations(req, res) {
    try {
      const { dayId } = req.params;
      const { destinations } = req.body; // [{ plan_destination_id, order_index }]

      if (!Array.isArray(destinations)) {
        return res.status(400).json({
          success: false,
          message: '올바른 순서 정보가 필요합니다.'
        });
      }

      // 트랜잭션으로 순서 변경
      await sequelize.transaction(async (t) => {
        for (const dest of destinations) {
          await PlanDestination.update(
            { order_index: dest.order_index },
            {
              where: {
                plan_destination_id: dest.plan_destination_id,
                day_id: dayId
              },
              transaction: t
            }
          );
        }
      });

      res.json({
        success: true,
        message: '여행지 순서가 변경되었습니다.'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '여행지 순서 변경에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 여행지 세부 정보 수정
  async updatePlanDestination(req, res) {
    try {
      const { planDestinationId } = req.params;
      const updateData = req.body;

      const planDestination = await PlanDestination.findByPk(planDestinationId);
      
      if (!planDestination) {
        return res.status(404).json({
          success: false,
          message: '해당 여행지를 찾을 수 없습니다.'
        });
      }

      await planDestination.update(updateData);

      // 업데이트된 정보와 함께 반환
      const result = await PlanDestination.findByPk(planDestinationId, {
        include: [
          {
            model: Destination,
            as: 'destination'
          }
        ]
      });

      res.json({
        success: true,
        message: '여행지 정보가 수정되었습니다.',
        data: result
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '여행지 정보 수정에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 일차별 정보 수정 (제목, 메모, 숙소 등)
  async updatePlanDay(req, res) {
    try {
      const { dayId } = req.params;
      const { title, notes, accommodation_id, accommodation_notes } = req.body;

      const day = await PlanDay.findByPk(dayId);
      
      if (!day) {
        return res.status(404).json({
          success: false,
          message: '해당 일차를 찾을 수 없습니다.'
        });
      }

      await day.update({
        title,
        notes,
        accommodation_id,
        accommodation_notes
      });

      // 업데이트된 정보와 함께 반환
      const result = await PlanDay.findByPk(dayId, {
        include: [
          {
            model: Destination,
            as: 'accommodation',
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: '일차 정보가 수정되었습니다.',
        data: result
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '일차 정보 수정에 실패했습니다.',
        error: error.message
      });
    }
  }
};

module.exports = planDayController;