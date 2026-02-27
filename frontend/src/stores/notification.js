import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const notificationSettings = ref({
    matching_request: true,
    matching_accepted: true,
    matching_rejected: true,
    new_message: true,
    review_like: true,
    plan_shared: true,
    destination_update: true,
    system: true
  });

  // Computed
  const hasUnread = computed(() => unreadCount.value > 0);
  
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  );
  
  const readNotifications = computed(() => 
    notifications.value.filter(n => n.isRead)
  );

  const groupedNotifications = computed(() => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    notifications.value.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      let groupKey;
      
      if (notifDate >= today) {
        groupKey = '오늘';
      } else if (notifDate >= yesterday) {
        groupKey = '어제';
      } else if (notifDate >= weekAgo) {
        groupKey = '이번 주';
      } else {
        groupKey = '이전';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  });

  // Actions
  async function fetchNotifications(page = 1, unreadOnly = false) {
    try {
      loading.value = true;
      const response = await api.get('/notifications', {
        params: {
          page,
          limit: 20,
          unreadOnly
        }
      });
      
      if (response && response.success) {
        notifications.value = response.data.notifications;
        currentPage.value = response.data.currentPage;
        totalPages.value = response.data.totalPages;
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response && response.success) {
        unreadCount.value = response.data.unreadCount;
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }

  async function markAsRead(notificationIds) {
    try {
      // 입력값을 배열로 변환
      const idsArray = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const response = await api.put('/notifications/read', {
        notificationIds: idsArray
      });
      
      // axios 인터셉터가 response.data를 반환하므로, response가 곧 data임
      if (response && response.success) {
        // Update local state
        notifications.value = notifications.value.map(n => {
          if (idsArray.includes(n.id)) {
            return { ...n, isRead: true, readAt: new Date() };
          }
          return n;
        });
        
        // Update unread count
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      
      if (response && response.success) {
        // Update local state
        notifications.value = notifications.value.map(n => ({
          ...n,
          isRead: true,
          readAt: new Date()
        }));
        
        unreadCount.value = 0;
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async function deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      if (response && response.success) {
        // Remove from local state
        notifications.value = notifications.value.filter(n => n.id !== notificationId);
        
        // Update unread count if needed
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async function fetchNotificationSettings() {
    try {
      const response = await api.get('/notifications/settings');
      if (response && response.success) {
        notificationSettings.value = response.data;
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  }

  async function updateNotificationSettings(settings) {
    try {
      const response = await api.put('/notifications/settings', { settings });
      if (response && response.success) {
        notificationSettings.value = settings;
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  // Local state updates (called from socket events)
  function addNotification(notification) {
    notifications.value.unshift(notification);
    if (!notification.isRead) {
      unreadCount.value++;
    }
  }

  function markAsReadLocal(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  }

  function markAllAsReadLocal() {
    notifications.value = notifications.value.map(n => ({
      ...n,
      isRead: true,
      readAt: new Date()
    }));
    unreadCount.value = 0;
  }

  // Clear all data
  function clearNotifications() {
    notifications.value = [];
    unreadCount.value = 0;
    currentPage.value = 1;
    totalPages.value = 1;
  }

  return {
    // State
    notifications,
    unreadCount,
    loading,
    currentPage,
    totalPages,
    notificationSettings,
    
    // Computed
    hasUnread,
    unreadNotifications,
    readNotifications,
    groupedNotifications,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotificationSettings,
    updateNotificationSettings,
    addNotification,
    markAsReadLocal,
    markAllAsReadLocal,
    clearNotifications
  };
});