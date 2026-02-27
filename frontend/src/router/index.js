import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/TermsView.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('../views/ProfileEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-reviews',
      name: 'my-reviews',
      component: () => import('../views/MyReviewsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/destinations',
      name: 'destinations',
      component: () => import('../views/DestinationsView.vue')
    },
    {
      path: '/destination/:id',
      name: 'destination-detail',
      component: () => import('../views/DestinationDetailView.vue'),
      props: true
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/travel-plans',
      name: 'travel-plans',
      component: () => import('../views/TravelPlansView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/travel-plans/:id',
      name: 'travel-plan-detail',
      component: () => import('../views/TravelPlanDetailView.vue'),
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/matching',
      name: 'companion-search',
      component: () => import('../views/CompanionSearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/messages/:matchId',
      name: 'messaging',
      component: () => import('../views/MessagingView.vue'),
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/my-matches',
      name: 'my-matches',
      component: () => import('../views/MyMatchesView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 라우터 가드 - 인증이 필요한 페이지 보호
router.beforeEach(async (to, _, next) => {
  // auth 스토어 가져오기
  const authStore = useAuthStore()
  
  // 인증이 필요한 페이지인지 확인
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    // 토큰이 있는지 확인
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      next({
        name: 'login',
        query: { redirect: to.fullPath } // 로그인 후 돌아올 페이지 저장
      })
    } else {
      // 토큰이 있지만 사용자 정보가 없으면 불러오기
      if (!authStore.user) {
        try {
          await authStore.fetchUser()
          // 사용자 정보가 완전히 설정될 때까지 대기
          let attempts = 0
          while (!authStore.user && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 50))
            attempts++
          }
          
          if (authStore.user) {
            next()
          } else {
            throw new Error('사용자 정보 로딩 실패')
          }
        } catch (error) {
          // 토큰이 유효하지 않으면 로그인 페이지로
          next({
            name: 'login',
            query: { redirect: to.fullPath }
          })
        }
      } else {
        next()
      }
    }
  } else {
    // 인증이 필요없는 페이지는 그대로 진행
    next()
  }
})

export default router