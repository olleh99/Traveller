const { Favorite, Destination, User } = require('../models/sequelize');

const favoriteController = {
  // 사용자의 즐겨찾기 목록 조회
  async getFavoritesByUser(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const favorites = await Favorite.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: Destination,
            as: 'destination',
            where: { is_active: true },
            attributes: ['id', 'name', 'category', 'description', 'address', 'region', 'accessibilityLevel', 'amenities']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          favorites: favorites.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(favorites.count / limit),
            totalItems: favorites.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '즐겨찾기 목록을 불러올 수 없습니다.',
        error: error.message
      });
    }
  },

  // 즐겨찾기 추가
  async addFavorite(req, res) {
    try {
      const { user_id, destination_id, note } = req.body;

      // 필수 필드 검증
      if (!user_id || !destination_id) {
        return res.status(400).json({
          success: false,
          message: '사용자 ID와 여행지 ID가 필요합니다.'
        });
      }

      // 여행지 존재 확인
      const destination = await Destination.findByPk(destination_id, {
        where: { is_active: true }
      });

      if (!destination) {
        return res.status(404).json({
          success: false,
          message: '존재하지 않는 여행지입니다.'
        });
      }

      // 중복 즐겨찾기 확인
      const existingFavorite = await Favorite.findOne({
        where: {
          user_id: user_id,
          destination_id: destination_id
        }
      });

      if (existingFavorite) {
        return res.status(409).json({
          success: false,
          message: '이미 즐겨찾기에 추가된 여행지입니다.'
        });
      }

      // 즐겨찾기 추가
      const favorite = await Favorite.create({
        user_id,
        destination_id,
        note: note || null
      });

      // 생성된 즐겨찾기 조회 (관계 데이터 포함)
      const createdFavorite = await Favorite.findByPk(favorite.favorite_id, {
        include: [
          {
            model: Destination,
            as: 'destination',
            attributes: ['id', 'name', 'category', 'region', 'accessibilityLevel']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: '즐겨찾기에 추가되었습니다.',
        data: createdFavorite
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '즐겨찾기 추가에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 즐겨찾기 삭제
  async removeFavorite(req, res) {
    try {
      const { favoriteId } = req.params;

      const favorite = await Favorite.findByPk(favoriteId);
      if (!favorite) {
        return res.status(404).json({
          success: false,
          message: '즐겨찾기를 찾을 수 없습니다.'
        });
      }

      await favorite.destroy();

      res.json({
        success: true,
        message: '즐겨찾기에서 제거되었습니다.'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '즐겨찾기 삭제에 실패했습니다.',
        error: error.message
      });
    }
  },

  // 사용자-여행지 즐겨찾기 상태 확인
  async checkFavoriteStatus(req, res) {
    try {
      const { userId, destinationId } = req.params;

      const favorite = await Favorite.findOne({
        where: {
          user_id: userId,
          destination_id: destinationId
        }
      });

      res.json({
        success: true,
        data: {
          isFavorite: !!favorite,
          favoriteId: favorite?.favorite_id || null
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '즐겨찾기 상태를 확인할 수 없습니다.',
        error: error.message
      });
    }
  },

  // 즐겨찾기 토글 (추가/제거)
  async toggleFavorite(req, res) {
    try {
      const { user_id, destination_id } = req.body;

      if (!user_id || !destination_id) {
        return res.status(400).json({
          success: false,
          message: '사용자 ID와 여행지 ID가 필요합니다.'
        });
      }

      // 사용자 존재 확인
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.'
        });
      }

      // 기존 즐겨찾기 확인
      const existingFavorite = await Favorite.findOne({
        where: {
          user_id: user_id,
          destination_id: destination_id
        }
      });

      if (existingFavorite) {
        // 즐겨찾기 제거
        await existingFavorite.destroy();
        res.json({
          success: true,
          message: '즐겨찾기에서 제거되었습니다.',
          data: {
            action: 'removed',
            isFavorite: false
          }
        });
      } else {
        // 여행지 존재 확인
        const destination = await Destination.findOne({
          where: { 
            id: destination_id,
            is_active: true 
          }
        });

        if (!destination) {
          return res.status(404).json({
            success: false,
            message: '존재하지 않는 여행지입니다.'
          });
        }

        // 즐겨찾기 추가
        const favorite = await Favorite.create({
          user_id,
          destination_id
        });

        res.status(201).json({
          success: true,
          message: '즐겨찾기에 추가되었습니다.',
          data: {
            action: 'added',
            isFavorite: true,
            favoriteId: favorite.favorite_id
          }
        });
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        message: '즐겨찾기 처리에 실패했습니다.',
        error: error.message
      });
    }
  }
};

module.exports = favoriteController;