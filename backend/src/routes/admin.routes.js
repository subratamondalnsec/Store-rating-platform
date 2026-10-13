const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { createUserValidator } = require('../validators/user.validators');
const { createStoreValidator } = require('../validators/store.validators');

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.post('/users', createUserValidator, validate, adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.get('/available-owners', adminController.getAvailableOwners);
router.get('/stores', adminController.getStores);
router.post('/stores', createStoreValidator, validate, adminController.createStore);

module.exports = router;
