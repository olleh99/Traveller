const joi = require('joi');

// 회원가입 유효성 검사 스키마
const signupSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': '올바른 이메일 형식이 아닙니다.',
    'any.required': '이메일은 필수 입력 항목입니다.'
  }),
  password: joi.string()
    .min(8)
    .pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
      'string.pattern.base': '비밀번호는 영문 대소문자, 숫자를 포함해주세요.',
      'any.required': '비밀번호는 필수 입력 항목입니다.'
    }),
  user_type: joi.string()
    .valid('disabled_traveler', 'companion', 'general')
    .required()
    .messages({
      'any.only': '올바른 사용자 유형이 아닙니다.',
      'any.required': '사용자 유형은 필수 선택 항목입니다.'
    }),
  name: joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': '이름은 최소 2자 이상이어야 합니다.',
      'string.max': '이름은 최대 50자까지 가능합니다.',
      'any.required': '이름은 필수 입력 항목입니다.'
    }),
  nickname: joi.string()
    .min(2)
    .max(20)
    .pattern(/^[가-힣a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.min': '닉네임은 최소 2자 이상이어야 합니다.',
      'string.max': '닉네임은 최대 20자까지 가능합니다.',
      'string.pattern.base': '닉네임은 한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다.',
      'any.required': '닉네임은 필수 입력 항목입니다.'
    }),
  phone: joi.string()
    .pattern(/^\d{3}-\d{4}-\d{4}$/)
    .optional()
    .messages({
      'string.pattern.base': '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)'
    }),
  birth_date: joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': '올바른 생년월일이 아닙니다.'
    }),
  gender: joi.string()
    .valid('M', 'F', 'O')
    .optional()
    .messages({
      'any.only': '올바른 성별 값이 아닙니다.'
    }),
  region_city: joi.string().optional(),
  region_district: joi.string().optional(),
  marketing_consent: joi.boolean().optional(),
  
  // 장애인 사용자 추가 정보
  disability_types: joi.when('user_type', {
    is: 'disabled_traveler',
    then: joi.array().items(joi.string()).min(1).required(),
    otherwise: joi.forbidden()
  }),
  support_needs: joi.when('user_type', {
    is: 'disabled_traveler',
    then: joi.array().items(joi.string()).optional(),
    otherwise: joi.forbidden()
  }),
  assistive_devices: joi.when('user_type', {
    is: 'disabled_traveler',
    then: joi.array().items(joi.string()).optional(),
    otherwise: joi.forbidden()
  }),
  emergency_contacts: joi.when('user_type', {
    is: 'disabled_traveler',
    then: joi.array().items(joi.object({
      name: joi.string().required(),
      phone: joi.string().required(),
      relation: joi.string().required()
    })).optional(),
    otherwise: joi.forbidden()
  }),
  
  // 동행 지원자 추가 정보
  supportable_disabilities: joi.when('user_type', {
    is: 'companion',
    then: joi.array().items(joi.string()).min(1).required(),
    otherwise: joi.forbidden()
  }),
  experience_years: joi.when('user_type', {
    is: 'companion',
    then: joi.number().min(0).required(),
    otherwise: joi.forbidden()
  }),
  experience_description: joi.when('user_type', {
    is: 'companion',
    then: joi.string().optional(),
    otherwise: joi.forbidden()
  }),
  certifications: joi.when('user_type', {
    is: 'companion',
    then: joi.array().items(joi.object({
      name: joi.string().required(),
      issuer: joi.string().required(),
      file_url: joi.string().optional()
    })).optional(),
    otherwise: joi.forbidden()
  })
});

// 로그인 유효성 검사 스키마
const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': '올바른 이메일 형식이 아닙니다.',
    'any.required': '이메일을 입력해주세요.'
  }),
  password: joi.string().required().messages({
    'any.required': '비밀번호를 입력해주세요.'
  })
});

// 이메일 중복 확인 스키마
const checkEmailSchema = joi.object({
  email: joi.string().email().required()
});

// 닉네임 중복 확인 스키마
const checkNicknameSchema = joi.object({
  nickname: joi.string().min(2).max(20).pattern(/^[가-힣a-zA-Z0-9_]+$/).required()
});

// 프로필 업데이트 스키마
const updateProfileSchema = joi.object({
  name: joi.string().min(2).max(50).optional(),
  nickname: joi.string().min(2).max(20).pattern(/^[가-힣a-zA-Z0-9_]+$/).optional(),
  phone: joi.string().pattern(/^\d{3}-\d{4}-\d{4}$/).optional(),
  phone_number: joi.string().pattern(/^\d{3}-\d{4}-\d{4}$/).optional(), // 프론트엔드 호환성
  birth_date: joi.date().max('now').optional(),
  gender: joi.string().valid('M', 'F', 'O').optional(),
  region_city: joi.string().optional(),
  region_district: joi.string().optional(),
  address: joi.string().optional(), // 주소 필드 추가
  profile_image_url: joi.string().allow('', null).optional(), // 프로필 이미지 URL
  marketing_consent: joi.boolean().optional()
});

// 장애인 프로필 스키마
const disabilityProfileSchema = joi.object({
  disability_types: joi.array().items(joi.string()).min(1).optional(),
  support_needs: joi.object().optional(),
  assistive_devices: joi.array().items(joi.string()).optional(),
  emergency_contacts: joi.array().items(joi.object({
    name: joi.string().required(),
    phone: joi.string().required(),
    relation: joi.string().required()
  })).optional()
});

// 동행인 프로필 스키마
const companionProfileSchema = joi.object({
  supportable_disabilities: joi.array().items(joi.string()).min(1).optional(),
  experience_years: joi.number().min(0).optional(),
  experience_description: joi.string().optional(),
  certifications: joi.array().items(joi.object({
    name: joi.string().required(),
    issuer: joi.string().required(),
    file_url: joi.string().optional()
  })).optional()
});

module.exports = {
  signupSchema,
  loginSchema,
  checkEmailSchema,
  checkNicknameSchema,
  updateProfileSchema,
  disabilityProfileSchema,
  companionProfileSchema
};