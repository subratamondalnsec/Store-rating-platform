const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const authenticate = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { rateStoreValidator } = require('../validators/rating.validators');

// GET /api/stores - Accessible to authenticated users (normal users, admin, store owners can view stores)
router.get('/', authenticate, storeController.getStores);

// POST /api/stores/:id/rating - Strictly USER role only
router.post(
  '/:id/rating',
  authenticate,
  authorizeRoles('USER'),
  rateStoreValidator,
  validate,
  storeController.rateStore
);

module.exports = router;
