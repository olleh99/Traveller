const { User, DisabilityProfile, CompanionProfile, sequelize } = require('../models/sequelize');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken } = require('../utils/jwt');

// 회원가입
const signup = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      email, password, user_type, name, nickname, phone, birth_date,
      gender, region_city, region_district, marketing_consent,
      // 장애인 사용자 추가 정보
      disability_types, support_needs, assistive_devices, emergency_contacts,
      // 동행 지원자 추가 정보
      supportable_disabilities, experience_years, experience_description, certifications
    } = req.body;
    
    // 이메일 중복 확인
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 이메일입니다.'
      });
    }
    
    // 닉네임 중복 확인
    const nicknameExists = await User.nicknameExists(nickname);
    if (nicknameExists) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 닉네임입니다.'
      });
    }
    
    // 사용자 생성
    const userData = {
      email, password, user_type, name, nickname, phone, birth_date,
      gender, region_city, region_district, marketing_consent,
      // 개발 환경에서는 바로 이메일 인증된 상태로 설정
      email_verified: process.env.NODE_ENV === 'development' ? true : false,
      account_status: process.env.NODE_ENV === 'development' ? 'active' : 'pending'
    };
    
    const user = await User.createUser(userData, { transaction });
    
    // 사용자 유형별 추가 프로필 생성
    if (user_type === 'disabled_traveler') {
      await DisabilityProfile.create({
        user_id: user.user_id,
        disability_types,
        support_needs,
        assistive_devices,
        emergency_contacts
      }, { transaction });
    } else if (user_type === 'companion') {
      await CompanionProfile.create({
        user_id: user.user_id,
        supportable_disabilities,
        experience_years,
        experience_description,
        certifications
      }, { transaction });
    }
    
    await transaction.commit();
    
    // 응답에서 민감한 정보 제거
    const userResponse = user.toJSON();
    
    res.status(201).json({
      success: true,
      message: process.env.NODE_ENV === 'development' 
        ? '회원가입이 완료되었습니다. 바로 로그인하실 수 있습니다.' 
        : '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.',
      user: userResponse
    });
    
  } catch (error) {
    await transaction.rollback();
    
    res.status(500).json({
      success: false,
      error: '회원가입 중 오류가 발생했습니다.'
    });
  }
};

// 로그인
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 비밀번호 확인
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 계정 상태 확인
    if (user.account_status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: '정지된 계정입니다. 고객센터에 문의해주세요.'
      });
    }
    
    if (user.account_status === 'pending' && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: '이메일 인증이 필요합니다.'
      });
    }
    
    // 개발 환경에서 pending 상태인 사용자는 자동으로 활성화
    if (user.account_status === 'pending' && process.env.NODE_ENV === 'development') {
      await user.updateEmailVerified(true);
    }
    
    // 토큰 생성
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = await generateRefreshToken(user.user_id);
    
    // 마지막 로그인 시간 업데이트
    await user.updateLastLogin();
    
    // 로그인 성공 기록은 필요시 추가 구현
    
    const userResponse = user.toJSON();
    
    res.json({
      success: true,
      message: '로그인 성공',
      user: userResponse,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer'
      }
    });
    
  } catch (error) {
    
    res.status(500).json({
      success: false,
      error: '로그인 중 오류가 발생했습니다.'
    });
  }
};

// 토큰 새로고침
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token이 필요합니다.'
      });
    }
    
    // Refresh token 검증
    const decoded = await verifyRefreshToken(refresh_token);
    
    // 사용자 확인
    const user = await User.findById(decoded.userId);
    if (!user || user.account_status !== 'active') {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 사용자입니다.'
      });
    }
    
    // 기존 refresh token 제거
    await revokeRefreshToken(refresh_token);
    
    // 새 토큰 생성
    const newAccessToken = generateAccessToken(user.user_id);
    const newRefreshToken = await generateRefreshToken(user.user_id);
    
    res.json({
      success: true,
      tokens: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer'
      }
    });
    
  } catch (error) {
    
    res.status(401).json({
      success: false,
      error: '토큰 갱신에 실패했습니다.'
    });
  }
};

// 로그아웃
const logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    // refresh_token이 있으면 revoke 시도하지만 실패해도 로그아웃 계속 진행
    if (refresh_token) {
      try {
        await revokeRefreshToken(refresh_token);
      } catch (revokeError) {
        // revoke 실패는 로그만 남기고 계속 진행
      }
    }
    
    // 항상 성공 응답 반환 (클라이언트 상태 정리가 더 중요)
    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
    
  } catch (error) {
    
    // 로그아웃은 클라이언트 측 정리가 더 중요하므로 성공으로 처리
    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
  }
};

// 이메일 중복 확인
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const exists = await User.emailExists(email);
    
    res.json({
      success: true,
      available: !exists
    });
    
  } catch (error) {
    
    res.status(500).json({
      success: false,
      error: '이메일 확인 중 오류가 발생했습니다.'
    });
  }
};

// 닉네임 중복 확인
const checkNickname = async (req, res) => {
  try {
    const { nickname } = req.body;
    
    const exists = await User.nicknameExists(nickname);
    
    res.json({
      success: true,
      available: !exists
    });
    
  } catch (error) {
    
    res.status(500).json({
      success: false,
      error: '닉네임 확인 중 오류가 발생했습니다.'
    });
  }
};

// 현재 사용자 정보 조회
const getMe = async (req, res) => {
  try {
    const user = req.user;
    const userResponse = user.toJSON();
    
    // 사용자 유형별 추가 정보 로드
    if (user.user_type === 'disabled_traveler') {
      const disabilityProfile = await DisabilityProfile.findOne({ where: { user_id: user.user_id } });
      if (disabilityProfile) {
        userResponse.disability_profile = disabilityProfile.toJSON();
      }
    } else if (user.user_type === 'companion') {
      const companionProfile = await CompanionProfile.findOne({ where: { user_id: user.user_id } });
      if (companionProfile) {
        userResponse.companion_profile = companionProfile.toJSON();
      }
    }
    
    res.json({
      success: true,
      user: userResponse
    });
    
  } catch (error) {
    
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  checkEmail,
  checkNickname,
  getMe
};