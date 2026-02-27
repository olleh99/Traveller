const { CompanionMessage, CompanionMatch, User, Notification } = require('../models/sequelize');
const { AppError } = require('../utils/errorHandler');
const { Op } = require('sequelize');
const socketManager = require('../config/socket');

const messageController = {
  // 메시지 목록 조회 (매칭별)
  async getMessages(req, res, next) {
    try {
      const { matchId } = req.params;
      const userId = req.user.user_id;
      const { page = 1, limit = 50 } = req.query;
      
      const offset = (page - 1) * limit;
      
      // 매칭 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ]
        }
      });
      
      if (!match) {
        throw new AppError('접근 권한이 없습니다.', 403);
      }
      
      // 메시지 목록 조회
      const { count, rows: messages } = await CompanionMessage.findAndCountAll({
        where: { 
          match_id: matchId,
          is_deleted: false
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'ASC']]
      });
      
      // 읽지 않은 메시지 읽음 처리
      await CompanionMessage.update(
        { 
          is_read: true,
          read_at: new Date()
        },
        {
          where: {
            match_id: matchId,
            receiver_id: userId,
            is_read: false
          }
        }
      );
      
      res.json({
        success: true,
        data: {
          messages,
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

  // 메시지 전송
  async sendMessage(req, res, next) {
    try {
      const { matchId } = req.params;
      const senderId = req.user.user_id;
      const { content, message_type = 'text' } = req.body;
      
      if (!content || content.trim() === '') {
        throw new AppError('메시지 내용을 입력해주세요.', 400);
      }
      
      // 매칭 정보 및 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: senderId },
            { companion_id: senderId }
          ],
          status: 'active'
        }
      });
      
      if (!match) {
        throw new AppError('유효하지 않은 매칭이거나 접근 권한이 없습니다.', 403);
      }
      
      // 수신자 ID 결정
      const receiverId = match.traveler_id === senderId 
        ? match.companion_id 
        : match.traveler_id;
      
      // 메시지 생성
      const message = await CompanionMessage.create({
        match_id: matchId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        message_type
      });
      
      // 전송된 메시지 상세 정보
      const sentMessage = await CompanionMessage.findByPk(message.message_id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
          }
        ]
      });
      
      // 새 메시지 알림 생성 및 전송
      const senderUser = await User.findByPk(senderId);
      const notification = await Notification.createNewMessageNotification(
        receiverId,
        senderUser,
        matchId,
        content.trim()
      );
      socketManager.sendNotification(receiverId, notification);
      
      // 실시간 메시지 전송 (상대방에게)
      socketManager.sendMessage(receiverId, sentMessage);
      
      res.status(201).json({
        success: true,
        message: '메시지가 전송되었습니다.',
        data: sentMessage
      });
    } catch (error) {
      next(error);
    }
  },

  // 메시지 삭제
  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user.user_id;
      
      const message = await CompanionMessage.findOne({
        where: {
          message_id: messageId,
          sender_id: userId,
          is_deleted: false
        }
      });
      
      if (!message) {
        throw new AppError('메시지를 찾을 수 없거나 삭제 권한이 없습니다.', 404);
      }
      
      // 소프트 삭제
      await message.update({
        is_deleted: true,
        deleted_at: new Date()
      });
      
      res.json({
        success: true,
        message: '메시지가 삭제되었습니다.'
      });
    } catch (error) {
      next(error);
    }
  },

  // 읽지 않은 메시지 수 조회
  async getUnreadCount(req, res, next) {
    try {
      const { matchId } = req.params;
      const userId = req.user.user_id;
      
      // 매칭 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ]
        }
      });
      
      if (!match) {
        throw new AppError('접근 권한이 없습니다.', 403);
      }
      
      const unreadCount = await CompanionMessage.count({
        where: {
          match_id: matchId,
          receiver_id: userId,
          is_read: false,
          is_deleted: false
        }
      });
      
      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      next(error);
    }
  },

  // 모든 매칭의 읽지 않은 메시지 수 조회
  async getAllUnreadCounts(req, res, next) {
    try {
      const userId = req.user.user_id;
      
      // 사용자의 모든 활성 매칭 조회
      const matches = await CompanionMatch.findAll({
        where: {
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ],
          status: 'active'
        },
        attributes: ['match_id']
      });
      
      // 각 매칭별 읽지 않은 메시지 수 조회
      const unreadCounts = await Promise.all(
        matches.map(async (match) => {
          const count = await CompanionMessage.count({
            where: {
              match_id: match.match_id,
              receiver_id: userId,
              is_read: false,
              is_deleted: false
            }
          });
          
          return {
            match_id: match.match_id,
            unread_count: count
          };
        })
      );
      
      // 전체 읽지않은 메시지 수
      const totalUnread = unreadCounts.reduce((sum, match) => sum + match.unread_count, 0);
      
      res.json({
        success: true,
        data: {
          totalUnread,
          byMatch: unreadCounts
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // 메시지 검색
  async searchMessages(req, res, next) {
    try {
      const { matchId } = req.params;
      const userId = req.user.user_id;
      const { query, page = 1, limit = 20 } = req.query;
      
      const offset = (page - 1) * limit;
      
      // 매칭 권한 확인
      const match = await CompanionMatch.findOne({
        where: {
          match_id: matchId,
          [Op.or]: [
            { traveler_id: userId },
            { companion_id: userId }
          ]
        }
      });
      
      if (!match) {
        throw new AppError('접근 권한이 없습니다.', 403);
      }
      
      const whereClause = {
        match_id: matchId,
        is_deleted: false
      };
      
      if (query) {
        whereClause.content = {
          [Op.like]: `%${query}%`
        };
      }
      
      const { count, rows: messages } = await CompanionMessage.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['user_id', 'name', 'nickname', 'profile_image_url']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        data: {
          messages,
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

module.exports = messageController;