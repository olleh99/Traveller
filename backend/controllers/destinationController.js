const { Destination, Review } = require('../models/sequelize');

// 여행지 목록 조회
exports.getDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, region, search } = req.query;
    const offset = (page - 1) * limit;
    const where = { is_active: true };

    // 카테고리 필터
    if (category) where.category = category;
    
    // 지역 필터
    if (region) where.region = region;
    
    // 키워드 검색 (이름 또는 설명에서 검색)
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    // 여행지 목록 조회 (리뷰 통계 제외)
    const { count, rows } = await Destination.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    // 각 여행지에 대한 리뷰 통계 별도 조회
    const destinationsWithStats = await Promise.all(
      rows.map(async (destination) => {
        const reviewStats = await Review.findOne({
          where: {
            destination_id: destination.id,
            status: 'approved'
          },
          attributes: [
            [Review.sequelize.fn('AVG', Review.sequelize.col('overall_rating')), 'avgRating'],
            [Review.sequelize.fn('COUNT', Review.sequelize.col('review_id')), 'reviewCount']
          ],
          raw: true
        });

        return {
          ...destination.toJSON(),
          avgRating: parseFloat(reviewStats?.avgRating || 0).toFixed(1),
          reviewCount: parseInt(reviewStats?.reviewCount || 0)
        };
      })
    );

    res.json({
      success: true,
      data: {
        destinations: destinationsWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '여행지 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 여행지 상세 조회
exports.getDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findOne({
      where: { id, is_active: true }
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: '여행지를 찾을 수 없습니다.'
      });
    }

    // 리뷰 통계 별도 조회
    const reviewStats = await Review.findOne({
      where: {
        destination_id: id,
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

    // 데이터 가공
    const destinationWithStats = {
      ...destination.toJSON(),
      reviewStats: {
        averageRating: parseFloat(reviewStats?.avgOverallRating || 0).toFixed(1),
        averageAccessibilityRating: parseFloat(reviewStats?.avgAccessibilityRating || 0).toFixed(1),
        averageMobilityRating: parseFloat(reviewStats?.avgMobilityRating || 0).toFixed(1),
        averageFacilityRating: parseFloat(reviewStats?.avgFacilityRating || 0).toFixed(1),
        averageServiceRating: parseFloat(reviewStats?.avgServiceRating || 0).toFixed(1),
        totalReviews: parseInt(reviewStats?.totalReviews || 0)
      }
    };

    res.json({
      success: true,
      data: destinationWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '여행지 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 여행지 등록
exports.createDestination = async (req, res) => {
  try {
    const { name, category, description, address, region, phone } = req.body;

    // 간단한 유효성 검사
    if (!name || !category || !address || !region) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 입력해주세요. (이름, 카테고리, 주소, 지역)'
      });
    }

    const destination = await Destination.create({
      name,
      category,
      description,
      address,
      region,
      phone
    });

    res.status(201).json({
      success: true,
      message: '여행지가 성공적으로 등록되었습니다.',
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '여행지 등록 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 여행지 수정
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, address, region, phone } = req.body;

    const destination = await Destination.findOne({
      where: { id, is_active: true }
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: '여행지를 찾을 수 없습니다.'
      });
    }

    await destination.update({
      name: name || destination.name,
      category: category || destination.category,
      description,
      address: address || destination.address,
      region: region || destination.region,
      phone
    });

    res.json({
      success: true,
      message: '여행지가 성공적으로 수정되었습니다.',
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '여행지 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 여행지 삭제 (soft delete)
exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findOne({
      where: { id, is_active: true }
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: '여행지를 찾을 수 없습니다.'
      });
    }

    await destination.update({ is_active: false });

    res.json({
      success: true,
      message: '여행지가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '여행지 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};