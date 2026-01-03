const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { placeOrder, myOrders, getOrder, cancelOrder, returnOrder } = require('../controllers/orderController');

router.post('/place', protect, placeOrder);
router.get('/my', protect, myOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, returnOrder);

module.exports = router;
