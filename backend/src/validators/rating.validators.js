const { body } = require('express-validator');

const rateStoreValidator = [
  body('value')
    .notEmpty().withMessage('Rating value is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating value must be an integer between 1 and 5.')
];

module.exports = {
  rateStoreValidator
};
