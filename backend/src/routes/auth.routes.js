const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  signupValidator,
  loginValidator,
  updatePasswordValidator
} = require('../validators/auth.validators');

router.post('/signup', signupValidator, validate, authController.signup);
router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/password', authenticate, updatePasswordValidator, validate, authController.updatePassword);

module.exports = router;
