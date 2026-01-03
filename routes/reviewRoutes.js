const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { createReview, getProductReviews, markHelpful, approveReview } = require('../controllers/reviewController');

router.post('/create', protect, createReview);
router.get('/product/:productId', getProductReviews);
router.put('/:id/helpful', protect, markHelpful);
router.put('/:id/approve', protect, isAdmin, approveReview);

module.exports = router;
