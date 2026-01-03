const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCheckout, myCheckout, expireCheckout } = require('../controllers/checkoutController');

router.post('/create', protect, createCheckout);
router.get('/my', protect, myCheckout);
router.delete('/expire', protect, expireCheckout);

module.exports = router;
