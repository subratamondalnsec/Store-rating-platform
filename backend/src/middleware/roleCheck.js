const { sendError } = require('../utils/apiResponse');

/**
 * Role-based authorization middleware factory
 * @param  {...string} roles Allowed roles (e.g., 'ADMIN', 'USER', 'STORE_OWNER')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before checking roles.', [], 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required: ${roles.join(', ')}`,
        [],
        403
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
