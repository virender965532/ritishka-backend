const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { createShipment, getShipment, updateShipmentStatus } = require('../controllers/shipmentController');

router.post('/create', protect, isAdmin, createShipment);
router.get('/:orderId', protect, getShipment);
router.put('/:orderId/update-status', protect, isAdmin, updateShipmentStatus);

module.exports = router;
