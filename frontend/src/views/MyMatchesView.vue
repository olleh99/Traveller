<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">내 매칭</h1>
        
        <!-- 매칭 상태 탭 -->
        <v-tabs v-model="activeTab" class="mb-4">
          <v-tab value="active">활성 매칭</v-tab>
          <v-tab value="pending">대기 중</v-tab>
          <v-tab value="completed">완료됨</v-tab>
        </v-tabs>
        
        <v-tabs-window v-model="activeTab">
          <!-- 활성 매칭 -->
          <v-tabs-window-item value="active">
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate></v-progress-circular>
            </div>
            
            <div v-else-if="activeMatches.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-heart</v-icon>
              <h3 class="text-h6 mb-2">활성 매칭이 없습니다</h3>
              <p class="text-body-2 text-grey-darken-1">
                새로운 동행인을 찾아보세요
              </p>
              <v-btn 
                color="primary" 
                to="/matching" 
                class="mt-4"
                prepend-icon="mdi-magnify"
              >
                동행인 찾기
              </v-btn>
            </div>
            
            <v-row v-else>
              <v-col
                v-for="match in activeMatches"
                :key="match.match_id"
                cols="12"
                md="6"
              >
                <v-card class="mb-4">
                  <v-card-title class="d-flex align-center">
                    <v-avatar class="mr-3">
                      <v-img
                        v-if="getPartnerInfo(match)?.profile_image_url"
                        :src="getPartnerInfo(match).profile_image_url"
                        :alt="getPartnerInfo(match)?.name"
                      />
                      <v-icon v-else>mdi-account</v-icon>
                    </v-avatar>
                    <div>
                      <h3>{{ getPartnerInfo(match)?.name }}</h3>
                      <p class="text-caption text-grey">
                        {{ formatDate(match.created_at) }}부터 매칭
                      </p>
                    </div>
                    <v-spacer></v-spacer>
                    <v-chip 
                      v-if="match.unread_count > 0"
                      color="primary"
                      size="small"
                    >
                      {{ match.unread_count }}
                    </v-chip>
                  </v-card-title>
                  
                  <v-card-text>
                    <p v-if="match.last_message" class="text-body-2">
                      <strong>{{ match.last_message.sender?.name }}:</strong>
                      {{ truncateText(match.last_message.content, 50) }}
                    </p>
                    <p v-else class="text-body-2 text-grey">
                      아직 메시지가 없습니다
                    </p>
                  </v-card-text>
                  
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      :to="`/messages/${match.match_id}`"
                      prepend-icon="mdi-message"
                    >
                      메시지
                    </v-btn>
                    <v-btn
                      variant="text"
                      @click="showMatchDetails(match)"
                    >
                      상세보기
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      variant="text"
                      color="error"
                      @click="endMatch(match)"
                    >
                      매칭 종료
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>
          
          <!-- 대기 중 매칭 -->
          <v-tabs-window-item value="pending">
            <div v-if="pendingMatches.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clock-outline</v-icon>
              <h3 class="text-h6 mb-2">대기 중인 매칭이 없습니다</h3>
            </div>
            
            <v-row v-else>
              <v-col
                v-for="match in pendingMatches"
                :key="match.request_id"
                cols="12"
                md="6"
              >
                <v-card class="mb-4">
                  <v-card-title>
                    {{ getPartnerInfo(match)?.name }}
                    <v-spacer></v-spacer>
                    <v-chip color="orange" size="small">대기중</v-chip>
                  </v-card-title>
                  
                  <v-card-text>
                    <p class="text-body-2">{{ match.message }}</p>
                    <p class="text-caption text-grey">
                      {{ formatDate(match.created_at) }}에 요청
                    </p>
                  </v-card-text>
                  
                  <v-card-actions v-if="canRespondToMatch(match)">
                    <v-btn
                      color="success"
                      variant="outlined"
                      @click="approveMatch(match)"
                    >
                      승인
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="outlined"
                      @click="rejectMatch(match)"
                    >
                      거절
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>
          
          <!-- 완료된 매칭 -->
          <v-tabs-window-item value="completed">
            <div v-if="completedMatches.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-check-circle</v-icon>
              <h3 class="text-h6 mb-2">완료된 매칭이 없습니다</h3>
            </div>
            
            <v-row v-else>
              <v-col
                v-for="match in completedMatches"
                :key="match.match_id"
                cols="12"
                md="6"
              >
                <v-card class="mb-4">
                  <v-card-title>
                    {{ getPartnerInfo(match)?.name }}
                    <v-spacer></v-spacer>
                    <v-chip color="success" size="small">완료</v-chip>
                  </v-card-title>
                  
                  <v-card-text>
                    <p class="text-caption text-grey">
                      {{ formatDate(match.created_at) }} - {{ formatDate(match.updated_at) }}
                    </p>
                  </v-card-text>
                  
                  <v-card-actions>
                    <v-btn
                      v-if="!match.rating"
                      color="primary"
                      variant="outlined"
                      @click="rateMatch(match)"
                    >
                      평가하기
                    </v-btn>
                    <v-btn
                      variant="text"
                      @click="showMatchDetails(match)"
                    >
                      상세보기
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { matchingAPI } from '@/api/matching'
import { messagesApi } from '@/api/messages'

const authStore = useAuthStore()

const activeTab = ref('active')
const loading = ref(false)
const matches = ref([])
const unreadCounts = ref({})

const currentUserId = computed(() => authStore.user?.user_id)

// 매칭 상태별 필터링
const activeMatches = computed(() => 
  matches.value.filter(match => match.status === 'active')
)

const pendingMatches = computed(() => 
  matches.value.filter(match => match.status === 'pending')
)

const completedMatches = computed(() => 
  matches.value.filter(match => match.status === 'completed')
)

// 상대방 정보 가져오기
const getPartnerInfo = (match) => {
  // 매칭 요청인 경우
  if (match.request_id) {
    if (match.requester_id === currentUserId.value) {
      return match.companion || match.Companion
    } else {
      return match.requester || match.Requester
    }
  }
  
  // 완성된 매칭인 경우
  if (match.traveler_id === currentUserId.value) {
    return match.companion || match.Companion
  } else {
    return match.traveler || match.Traveler
  }
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 텍스트 자르기
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 매칭 요청에 응답할 수 있는지 확인
const canRespondToMatch = (match) => {
  // 매칭 요청의 경우: 요청을 받은 사용자(companion_id)만 응답 가능
  if (match.request_id) {
    return match.companion_id === currentUserId.value
  }
  // 다른 경우에 대한 로직 추가 가능
  return false
}

// 매칭 목록 로드
const loadMatches = async () => {
  try {
    loading.value = true
    
    // API 호출을 순차적으로 변경 (429 오류 방지)
    const activeResponse = await matchingAPI.getUserMatches('active').catch(e => ({ matches: [] }))
    await new Promise(resolve => setTimeout(resolve, 300)) // 300ms 지연
    
    const pendingRequestsResponse = await matchingAPI.getReceivedRequests({ status: 'pending' }).catch(e => ({ requests: [] }))
    await new Promise(resolve => setTimeout(resolve, 300)) // 300ms 지연
    
    const completedResponse = await matchingAPI.getUserMatches('completed').catch(e => ({ matches: [] }))
    
    // 실제 매칭된 것들
    const activeMatches = activeResponse.matches || activeResponse.data?.matches || []
    const completedMatches = completedResponse.matches || completedResponse.data?.matches || []
    
    // 대기 중인 요청들
    const pendingRequests = pendingRequestsResponse.requests || pendingRequestsResponse.data?.requests || []
    
    matches.value = [
      ...activeMatches,
      ...pendingRequests,
      ...completedMatches
    ]
    
    // 활성 매칭이 있는 경우에만 읽지 않은 메시지 수 로드
    if (activeMatches.length > 0) {
      await loadUnreadCounts()
    }
    
  } catch (error) {
    console.error('매칭 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 읽지 않은 메시지 수 로드
const loadUnreadCounts = async () => {
  try {
    const response = await messagesApi.getAllUnreadCounts()
    const counts = {}
    
    // response.byMatch가 존재하고 배열인지 확인
    if (response?.byMatch && Array.isArray(response.byMatch)) {
      response.byMatch.forEach(item => {
        counts[item.match_id] = item.unread_count
      })
    }
    
    unreadCounts.value = counts
    
    // 매칭 데이터에 읽지 않은 메시지 수 추가
    matches.value = matches.value.map(match => ({
      ...match,
      unread_count: counts[match.match_id] || 0
    }))
    
  } catch (error) {
    console.error('읽지 않은 메시지 수 로드 실패:', error)
    // 에러 발생 시 빈 객체로 설정
    unreadCounts.value = {}
  }
}

// 매칭 승인
const approveMatch = async (match) => {
  try {
    await matchingAPI.approveMatchingRequest(match.request_id)
    await loadMatches()
  } catch (error) {
    console.error('매칭 승인 실패:', error)
  }
}

// 매칭 거절
const rejectMatch = async (match) => {
  try {
    await matchingAPI.rejectMatchingRequest(match.request_id)
    await loadMatches()
  } catch (error) {
    console.error('매칭 거절 실패:', error)
  }
}

// 매칭 종료
const endMatch = async (match) => {
  if (confirm('정말로 이 매칭을 종료하시겠습니까?')) {
    try {
      await matchingAPI.endMatch(match.match_id)
      await loadMatches()
    } catch (error) {
      console.error('매칭 종료 실패:', error)
    }
  }
}

// 매칭 상세보기
const showMatchDetails = (match) => {
  // 상세보기 모달 또는 페이지로 이동
  console.log('매칭 상세보기:', match)
}

// 매칭 평가
const rateMatch = (match) => {
  // 평가 모달 열기
  console.log('매칭 평가:', match)
}

onMounted(() => {
  loadMatches()
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>