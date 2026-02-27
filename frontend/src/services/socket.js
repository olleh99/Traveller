import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (!token) {
      console.warn('No token available for socket connection');
      return;
    }

    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    const notificationStore = useNotificationStore();

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
      
      // Load initial notifications
      notificationStore.fetchNotifications();
      notificationStore.fetchUnreadCount();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.connected = false;
    });

    // Handle new notifications
    this.socket.on('notification:new', (notification) => {
      console.log('New notification received:', notification);
      notificationStore.addNotification(notification);
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        this.showBrowserNotification(notification);
      }
      
      // Play notification sound
      this.playNotificationSound();
    });

    // Handle notification read confirmation
    this.socket.on('notification:read:success', (notificationId) => {
      notificationStore.markAsReadLocal(notificationId);
    });

    // Handle all notifications read
    this.socket.on('notifications:readAll:success', () => {
      notificationStore.markAllAsReadLocal();
    });

    // Handle notification updates
    this.socket.on('notifications_read', (data) => {
      if (data.notificationIds) {
        data.notificationIds.forEach(id => {
          notificationStore.markAsReadLocal(id);
        });
      }
    });

    this.socket.on('all_notifications_read', () => {
      notificationStore.markAllAsReadLocal();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Emit events to server
  markNotificationAsRead(notificationId) {
    if (this.socket && this.connected) {
      this.socket.emit('notification:read', notificationId);
    }
  }

  markAllNotificationsAsRead() {
    if (this.socket && this.connected) {
      this.socket.emit('notifications:readAll');
    }
  }

  // Browser notification
  showBrowserNotification(notification) {
    if (!('Notification' in window)) {
      return;
    }

    const options = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `notification-${notification.id}`,
      requireInteraction: false,
      silent: false
    };

    const browserNotification = new Notification(notification.title, options);
    
    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  }

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.warn('Could not play notification sound:', err);
      });
    } catch (error) {
      console.warn('Notification sound not available:', error);
    }
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }
}

export default new SocketService();