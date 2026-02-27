const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketManager {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId mapping
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:8080',
        credentials: true
      }
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Store user socket mapping
      this.userSockets.set(socket.userId, socket.id);
      
      // Join user-specific room
      socket.join(`user-${socket.userId}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.userSockets.delete(socket.userId);
      });

      // Handle notification read
      socket.on('notification:read', async (notificationId) => {
        try {
          const { Notification } = require('../models/sequelize');
          await Notification.update(
            { isRead: true },
            { where: { id: notificationId, user_id: socket.userId } }
          );
          
          socket.emit('notification:read:success', notificationId);
        } catch (error) {
          socket.emit('notification:read:error', error.message);
        }
      });

      // Handle notification read all
      socket.on('notifications:readAll', async () => {
        try {
          const { Notification } = require('../models/sequelize');
          await Notification.update(
            { isRead: true },
            { where: { user_id: socket.userId, isRead: false } }
          );
          
          socket.emit('notifications:readAll:success');
        } catch (error) {
          socket.emit('notifications:readAll:error', error.message);
        }
      });
    });
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit('notification:new', notification);
    }
  }

  // Send notification to multiple users
  sendNotificationToUsers(userIds, notification) {
    if (this.io) {
      userIds.forEach(userId => {
        this.io.to(`user-${userId}`).emit('notification:new', notification);
      });
    }
  }

  // Send real-time message to specific user
  sendMessage(userId, message) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit('message:new', message);
    }
  }

  // Get online users
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }
}

module.exports = new SocketManager();