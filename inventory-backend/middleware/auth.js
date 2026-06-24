const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Missing or invalid authorization header' 
      });
    }
    
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      branch_id: decoded.branch_id
    };
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token has expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      error: 'Invalid or malformed token' 
    });
  }
};

module.exports = authMiddleware;
