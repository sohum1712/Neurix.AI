/**
 * Authentication Validation Middleware
 * Validates requests using userId from body/query/params
 * For production: Replace with JWT or Supabase token validation
 */

const validateAuth = (req, res, next) => {
  // Extract userId from various sources
  const userId = req.body?.userId || 
                 req.query?.userId || 
                 req.params?.userId ||
                 req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'User ID not provided'
    });
  }

  // Attach userId to request for downstream use
  req.userId = userId;
  next();
};

/**
 * Optional authentication (allows anonymous access)
 */
const optionalAuth = (req, res, next) => {
  const userId = req.body?.userId || 
                 req.query?.userId || 
                 req.params?.userId ||
                 req.headers['x-user-id'];

  if (userId) {
    req.userId = userId;
  }
  next();
};

module.exports = {
  validateAuth,
  optionalAuth
};
