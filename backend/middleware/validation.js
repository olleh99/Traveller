const { 
  updateProfileSchema, 
  disabilityProfileSchema, 
  companionProfileSchema 
} = require('../utils/validation');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: '입력 데이터가 올바르지 않습니다.',
        details: errors
      });
    }
    
    req.body = value;
    next();
  };
};

// 프로필 관련 validation 미들웨어
const validateUpdateProfile = validate(updateProfileSchema);
const validateDisabilityProfile = validate(disabilityProfileSchema);
const validateCompanionProfile = validate(companionProfileSchema);

module.exports = { 
  validate,
  validateUpdateProfile,
  validateDisabilityProfile,
  validateCompanionProfile
};