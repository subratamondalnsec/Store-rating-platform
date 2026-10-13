const { body } = require('express-validator');

const createStoreValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 3, max: 255 }).withMessage('Store name must be between 3 and 255 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please provide a valid store email address.')
    .normalizeEmail(),
  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ max: 400 }).withMessage('Store address must not exceed 400 characters.'),
  body('ownerId')
    .notEmpty().withMessage('Store owner ID is required.')
    .isInt({ min: 1 }).withMessage('Store owner ID must be a positive integer.')
];

module.exports = {
  createStoreValidator
};
