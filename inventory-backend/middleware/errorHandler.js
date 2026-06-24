const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  
  // Handle specific error types
  if (err.message.includes('unique constraint')) {
    statusCode = 400;
    message = 'This email is already registered';
  }
  
  if (err.message.includes('no rows')) {
    statusCode = 404;
    message = 'Resource not found';
  }
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
