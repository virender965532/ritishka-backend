const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getWishlist,
  addWishlist,
  removeWishlistItem
} = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/', protect, addWishlist);
router.delete('/:itemId', protect, removeWishlistItem);

module.exports = router;
