const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../config/env');
const { sendError } = require('../utils/apiResponse');

/**
 * Authentication middleware that verifies JWT and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No Bearer token provided.', [], 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Authentication token missing.', [], 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 'Token has expired. Please log in again.', [], 401);
      }
      return sendError(res, 'Invalid token. Please log in again.', [], 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return sendError(res, 'User no longer exists.', [], 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
