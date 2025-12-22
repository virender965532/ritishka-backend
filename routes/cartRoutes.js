const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addOrUpdateCart,
  updateCartItem,
  deleteCartItem
} = require('../controllers/cartController');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, addOrUpdateCart);
router.put('/:itemId', protect, updateCartItem);
router.delete('/:itemId', protect, deleteCartItem);

module.exports = router;
