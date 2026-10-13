const { body } = require('express-validator');
const { passwordRegex } = require('./auth.validators');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .matches(passwordRegex).withMessage('Password must be 8 to 16 characters long and contain at least one uppercase letter and one special character.'),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.'),
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['ADMIN', 'USER', 'STORE_OWNER']).withMessage('Role must be ADMIN, USER, or STORE_OWNER.')
];

module.exports = {
  createUserValidator
};
