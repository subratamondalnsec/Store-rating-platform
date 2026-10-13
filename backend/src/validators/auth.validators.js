const { body } = require('express-validator');

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const passwordErrorMessage = 'Password must be 8 to 16 characters long and contain at least one uppercase letter and at least one special character.';

const signupValidator = [
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
    .matches(passwordRegex).withMessage(passwordErrorMessage),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.')
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

const updatePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .matches(passwordRegex).withMessage(passwordErrorMessage)
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password.');
      }
      return true;
    })
];

module.exports = {
  signupValidator,
  loginValidator,
  updatePasswordValidator,
  passwordRegex
};
