const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models/sequelize');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 필요합니다.'
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        error: '계정이 활성화되지 않았습니다.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다.'
    });
  }
};


module.exports = {
  authenticate,
  authenticateToken: authenticate // 별칭 추가
};