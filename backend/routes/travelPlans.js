const express = require('express');
const router = express.Router();
const travelPlanController = require('../controllers/travelPlanController');
const { authenticate: authMiddleware } = require('../middleware/auth');

// 여행 계획 기본 CRUD
router.get('/', authMiddleware, travelPlanController.getTravelPlans);
router.post('/', authMiddleware, travelPlanController.createTravelPlan);
router.get('/:planId', authMiddleware, travelPlanController.getTravelPlan);
router.put('/:planId', authMiddleware, travelPlanController.updateTravelPlan);
router.delete('/:planId', authMiddleware, travelPlanController.deleteTravelPlan);

// 여행 계획 상태 관리
router.patch('/:planId/status', authMiddleware, travelPlanController.updatePlanStatus);

// 여행지 관리
router.post('/:planId/destinations', authMiddleware, travelPlanController.addDestinationToPlan);
router.delete('/:planId/destinations/:planDestinationId', authMiddleware, travelPlanController.removeDestinationFromPlan);
router.patch('/:planId/destinations/order', authMiddleware, travelPlanController.updateDestinationOrder);

module.exports = router;