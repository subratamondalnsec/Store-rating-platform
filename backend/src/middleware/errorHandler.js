const { sendError } = require('../utils/apiResponse');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log server error for debugging
  console.error('Unhandled Error:', err);

  // Prisma Unique Constraint Violation (P2002)
  if (err.code === 'P2002') {
    const targetFields = err.meta && err.meta.target ? err.meta.target.join(', ') : 'field';
    return sendError(
      res,
      `A record with this ${targetFields} already exists.`,
      [{ field: targetFields, message: `Unique constraint violated on ${targetFields}` }],
      409
    );
  }

  // Prisma Record Not Found (P2025)
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', [], 404);
  }

  // Custom HTTP status code if attached
  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
  const message = err.message || 'Internal server error';

  return sendError(
    res,
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred on the server.'
      : message,
    err.errors || [],
    statusCode
  );
};

module.exports = errorHandler;
