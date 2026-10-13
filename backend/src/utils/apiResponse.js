/**
 * Consistent API Response Helper Functions
 */

const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError
};
