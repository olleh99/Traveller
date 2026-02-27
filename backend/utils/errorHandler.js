class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) {
    statusCode = 500;
  }

  console.error('에러 발생:', {
    statusCode,
    message,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    stack: err.stack
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: message,
      details: err.details || [],
      stack: err.stack
    });
  } else {
    // 프로덕션 환경에서는 민감한 정보 숨김
    if (!err.isOperational) {
      statusCode = 500;
      message = '서버 오류가 발생했습니다.';
    }

    res.status(statusCode).json({
      success: false,
      error: {
        statusCode,
        message
      }
    });
  }
};

module.exports = {
  AppError,
  handleError
};