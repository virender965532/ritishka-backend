const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { initiateRefund, getRefundByOrder } = require('../controllers/refundController');

router.post('/initiate', protect, initiateRefund);
router.get('/:orderId', protect, getRefundByOrder);

module.exports = router;
