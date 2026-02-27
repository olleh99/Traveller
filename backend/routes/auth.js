const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { 
  signupSchema, 
  loginSchema, 
  checkEmailSchema, 
  checkNicknameSchema 
} = require('../utils/validation');

// 회원가입
router.post('/signup', validate(signupSchema), authController.signup);

// 로그인
router.post('/login', validate(loginSchema), authController.login);

// 토큰 새로고침
router.post('/refresh', authController.refreshToken);

// 로그아웃
router.post('/logout', authController.logout);

// 이메일 중복 확인
router.post('/check-email', validate(checkEmailSchema), authController.checkEmail);

// 닉네임 중복 확인
router.post('/check-nickname', validate(checkNicknameSchema), authController.checkNickname);

// 현재 사용자 정보 조회 (인증 필요)
router.get('/me', authenticate, authController.getMe);

module.exports = router;