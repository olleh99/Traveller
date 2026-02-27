<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">메시지</h1>
        
        <!-- 메시지 리스트 -->
        <v-card class="mb-4" style="height: 500px;">
          <v-card-title class="d-flex align-center">
            <v-icon start>mdi-message</v-icon>
            {{ companionName }}님과의 대화
            <v-spacer></v-spacer>
            <v-chip 
              v-if="unreadCount > 0" 
              color="primary" 
              size="small"
            >
              {{ unreadCount }}개 안읽음
            </v-chip>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <!-- 메시지 영역 -->
          <v-card-text 
            ref="messagesContainer"
            class="pa-0" 
            style="height: 350px; overflow-y: auto;"
          >
            <div v-if="loading" class="text-center pa-4">
              <v-progress-circular indeterminate></v-progress-circular>
            </div>
            
            <div v-else-if="messages.length === 0" class="text-center pa-4 text-grey">
              아직 메시지가 없습니다. 첫 메시지를 보내보세요!
            </div>
            
            <div v-else class="pa-2">
              <div 
                v-for="message in messages" 
                :key="message.message_id"
                class="mb-3"
              >
                <div 
                  :class="[
                    'd-flex',
                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div 
                    :class="[
                      'pa-3 rounded-lg max-width-70',
                      message.sender_id === currentUserId 
                        ? 'bg-primary text-white ml-8' 
                        : 'bg-grey-lighten-3 mr-8'
                    ]"
                  >
                    <div class="text-body-2 mb-1">
                      {{ message.content }}
                    </div>
                    <div 
                      :class="[
                        'text-caption',
                        message.sender_id === currentUserId ? 'text-blue-lighten-4' : 'text-grey'
                      ]"
                    >
                      {{ formatTime(message.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <!-- 메시지 입력 -->
          <v-card-actions class="pa-3">
            <v-text-field
              v-model="newMessage"
              placeholder="메시지를 입력하세요..."
              variant="outlined"
              density="compact"
              hide-details
              class="flex-grow-1 mr-2"
              @keyup.enter="sendMessage"
              :disabled="sending"
            ></v-text-field>
            <v-btn
              color="primary"
              :disabled="!newMessage.trim() || sending"
              :loading="sending"
              @click="sendMessage"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { messagesApi } from '@/api/messages'
import { useAuthStore } from '@/stores/auth'
import socketService from '@/services/socket'

const route = useRoute()
const authStore = useAuthStore()

const matchId = computed(() => route.params.matchId)
const currentUserId = computed(() => authStore.user?.user_id)

const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const sending = ref(false)
const unreadCount = ref(0)
const companionName = ref('동행자')
const messagesContainer = ref(null)

// 시간 포맷팅
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1분 미만
    return '방금 전'
  } else if (diff < 3600000) { // 1시간 미만
    return `${Math.floor(diff / 60000)}분 전`
  } else if (diff < 86400000) { // 24시간 미만
    return `${Math.floor(diff / 3600000)}시간 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 메시지 목록 로드
const loadMessages = async () => {
  try {
    loading.value = true
    const response = await messagesApi.getMessages(matchId.value)
    
    // axios 인터셉터로 인해 response = { success, data: { messages, pagination } }
    if (response && response.success && response.data && response.data.messages) {
      messages.value = response.data.messages;
    } else {
      messages.value = [];
    }
    
    // 상대방 이름 설정
    if (messages.value.length > 0) {
      const firstMessage = messages.value.find(m => m.sender_id !== currentUserId.value)
      if (firstMessage?.sender) {
        companionName.value = firstMessage.sender.name || firstMessage.sender.nickname
      }
    }
    
    // 스크롤을 맨 아래로
    await nextTick()
    scrollToBottom()
    
  } catch (error) {
    console.error('메시지 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 읽지 않은 메시지 수 로드
const loadUnreadCount = async () => {
  try {
    const response = await messagesApi.getUnreadCount(matchId.value)
    unreadCount.value = response.unreadCount || 0
  } catch (error) {
    console.error('읽지 않은 메시지 수 로드 실패:', error)
  }
}

// 메시지 전송
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  
  try {
    sending.value = true
    const response = await messagesApi.sendMessage(matchId.value, newMessage.value.trim())
    
    // 새 메시지를 목록에 추가 - axios 인터셉터로 인해 response.data 접근
    if (response && response.success && response.data) {
      messages.value.push(response.data)
      newMessage.value = ''
      
      // 스크롤을 맨 아래로
      await nextTick()
      scrollToBottom()
    }
    
  } catch (error) {
    console.error('메시지 전송 실패:', error)
    alert('메시지 전송에 실패했습니다.')
  } finally {
    sending.value = false
  }
}

// 스크롤을 맨 아래로
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 실시간 메시지 수신 처리
const handleNewMessage = (message) => {
  if (message.match_id === matchId.value) {
    messages.value.push(message);
    nextTick(() => scrollToBottom());
  }
}

onMounted(() => {
  if (matchId.value) {
    loadMessages()
    loadUnreadCount()
    
    // Socket 이벤트 등록
    if (socketService.socket) {
      socketService.socket.on('message:new', handleNewMessage);
    }
  }
})

onUnmounted(() => {
  // Socket 이벤트 해제
  if (socketService.socket) {
    socketService.socket.off('message:new', handleNewMessage);
  }
})
</script>

<style scoped>
.max-width-70 {
  max-width: 70%;
}

.messages-container {
  scroll-behavior: smooth;
}
</style>