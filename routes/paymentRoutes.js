const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRazorpayOrder, verifyRazorpay, codPayment, getPaymentByOrder } = require('../controllers/paymentController');

router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpay);
router.post('/cod', protect, codPayment);
router.get('/:orderId', protect, getPaymentByOrder);

module.exports = router;
