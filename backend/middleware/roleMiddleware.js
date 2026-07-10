/**
 * Middleware to restrict access based on user roles.
 * Must be used AFTER the `protect` auth middleware.
 * 
 * @param {string} requiredRole - The role required to access the route (e.g., 'Manager')
 * @returns Express middleware function
 */
const authorize = (requiredRole) => {
  return (req, res, next) => {
    // Check if user exists on the request (should be attached by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if the user's role matches the required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Forbidden: Access restricted to ${requiredRole}s only` 
      });
    }

    // User is authorized, proceed to the next handler
    next();
  };
};

module.exports = { authorize };
