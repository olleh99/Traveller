<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom end"
    transition="slide-y-transition"
    max-width="400"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        :color="hasUnread ? 'primary' : 'default'"
      >
        <v-badge
          v-if="hasUnread"
          :content="unreadCount > 99 ? '99+' : unreadCount"
          color="error"
          floating
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell-outline</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>알림</span>
        <div>
          <v-btn
            v-if="hasUnread"
            size="small"
            variant="text"
            @click="handleMarkAllAsRead"
          >
            모두 읽음
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            @click="showSettings = true"
          >
            <v-icon size="small">mdi-cog</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0" style="max-height: 400px; overflow-y: auto;">
        <v-list v-if="notifications.length > 0" lines="two">
          <template v-for="(group, groupName) in groupedNotifications" :key="groupName">
            <v-list-subheader>{{ groupName }}</v-list-subheader>
            <v-list-item
              v-for="notification in group"
              :key="notification.id"
              :class="{ 'bg-blue-lighten-5': !notification.isRead }"
              @click="handleNotificationClick(notification)"
            >
              <template v-slot:prepend>
                <v-avatar :color="getNotificationColor(notification.type)" size="40">
                  <v-icon color="white">{{ getNotificationIcon(notification.type) }}</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>
                {{ notification.title }}
                <v-chip
                  v-if="!notification.isRead"
                  size="x-small"
                  color="primary"
                  class="ml-2"
                >
                  새 알림
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ notification.message }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption">
                {{ formatTime(notification.createdAt) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click.stop="handleDeleteNotification(notification.id)"
                >
                  <v-icon size="small">mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </template>
        </v-list>

        <v-container v-else class="text-center py-8">
          <v-icon size="64" color="grey">mdi-bell-sleep</v-icon>
          <p class="text-grey mt-2">새로운 알림이 없습니다</p>
        </v-container>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-center">
        <v-btn
          variant="text"
          @click="goToNotifications"
        >
          모든 알림 보기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <!-- Notification Settings Dialog -->
  <v-dialog
    v-model="showSettings"
    max-width="500"
  >
    <v-card>
      <v-card-title>알림 설정</v-card-title>
      <v-divider />
      
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="(value, key) in notificationSettings"
            :key="key"
          >
            <v-switch
              v-model="notificationSettings[key]"
              :label="getSettingLabel(key)"
              color="primary"
              hide-details
            />
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="showSettings = false"
        >
          취소
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="saveSettings"
        >
          저장
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import socketService from '@/services/socket';

const router = useRouter();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const menu = ref(false);
const showSettings = ref(false);

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const hasUnread = computed(() => notificationStore.hasUnread);
const groupedNotifications = computed(() => notificationStore.groupedNotifications);
const notificationSettings = ref({ ...notificationStore.notificationSettings });

onMounted(() => {
  if (authStore.isAuthenticated) {
    // Connect socket
    socketService.connect();
    
    // Fetch initial data
    notificationStore.fetchNotifications();
    notificationStore.fetchUnreadCount();
    notificationStore.fetchNotificationSettings();
    
    // Request notification permission
    socketService.requestNotificationPermission();
  }
});

onUnmounted(() => {
  // Don't disconnect socket here as it might be used by other components
});

function getNotificationIcon(type) {
  const icons = {
    matching_request: 'mdi-account-multiple',
    matching_accepted: 'mdi-check-circle',
    matching_rejected: 'mdi-close-circle',
    matching_ended: 'mdi-account-remove',
    new_message: 'mdi-message',
    review_like: 'mdi-thumb-up',
    plan_shared: 'mdi-share',
    destination_update: 'mdi-map-marker',
    system: 'mdi-information'
  };
  return icons[type] || 'mdi-bell';
}

function getNotificationColor(type) {
  const colors = {
    matching_request: 'blue',
    matching_accepted: 'success',
    matching_rejected: 'error',
    matching_ended: 'warning',
    new_message: 'primary',
    review_like: 'pink',
    plan_shared: 'purple',
    destination_update: 'teal',
    system: 'grey'
  };
  return colors[type] || 'grey';
}

function getSettingLabel(key) {
  const labels = {
    matching_request: '매칭 요청',
    matching_accepted: '매칭 승인',
    matching_rejected: '매칭 거절',
    new_message: '새 메시지',
    review_like: '리뷰 도움됨',
    plan_shared: '여행 계획 공유',
    destination_update: '여행지 업데이트',
    system: '시스템 알림'
  };
  return labels[key] || key;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return date.toLocaleDateString();
}

async function handleNotificationClick(notification) {
  // Mark as read if not already
  if (!notification.isRead) {
    await notificationStore.markAsRead(notification.id);
    socketService.markNotificationAsRead(notification.id);
  }
  
  // Navigate if action URL exists
  if (notification.actionUrl) {
    menu.value = false;
    router.push(notification.actionUrl);
  }
}

async function handleMarkAllAsRead() {
  await notificationStore.markAllAsRead();
  socketService.markAllNotificationsAsRead();
}

async function handleDeleteNotification(notificationId) {
  await notificationStore.deleteNotification(notificationId);
}

async function saveSettings() {
  try {
    await notificationStore.updateNotificationSettings(notificationSettings.value);
    showSettings.value = false;
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

function goToNotifications() {
  menu.value = false;
  router.push('/notifications');
}
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>