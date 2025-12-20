const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// Profile
router.put('/profile', userController.updateProfile);

// Addresses
router.get('/addresses', userController.fetchAddresses);
router.post('/addresses', userController.createAddress);
router.put('/addresses/:id', userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);
router.patch('/addresses/:id/primary', userController.markPrimaryAddress);
module.exports = router;
