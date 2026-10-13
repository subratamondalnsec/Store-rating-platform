const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const storeRoutes = require('./store.routes');
const ownerRoutes = require('./owner.routes');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Store Rating Platform API is healthy',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/owner', ownerRoutes);

module.exports = router;
