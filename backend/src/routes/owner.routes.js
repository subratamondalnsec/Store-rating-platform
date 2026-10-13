const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleCheck');

// Protect owner routes with authentication and STORE_OWNER role check
router.use(authenticate, authorizeRoles('STORE_OWNER'));

router.get('/dashboard', ownerController.getOwnerDashboard);

module.exports = router;
