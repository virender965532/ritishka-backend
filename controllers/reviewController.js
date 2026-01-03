const Review = require('../models/Review');
const Order = require('../models/Order');

async function createReview(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { product, order: orderId, title, rating, comment, images } = req.body;
    if (!product || !rating) return res.status(400).json({ error: 'product and rating required' });

    // verify delivered order contains product
    if (orderId) {
      const order = await Order.findById(orderId).lean();
      if (!order) return res.status(400).json({ error: 'Invalid order' });
      if (String(order.user) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });
      if (order.status !== 'DELIVERED') return res.status(400).json({ error: 'Only delivered orders can be used for reviews' });
      const found = (order.items || []).find(i => String(i.product) === String(product));
      if (!found) return res.status(400).json({ error: 'Product not found in order' });
    } else {
      return res.status(400).json({ error: 'order id required for verified review' });
    }

    const review = await Review.create({ product, user: userId, order: orderId, title, rating, comment, images, isVerifiedPurchase: true });
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'You have already reviewed this product' });
    next(err);
  }
}

async function getProductReviews(req, res, next) {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId, isApproved: true }).populate('user', 'name').lean();
    res.json({ reviews });
  } catch (err) { next(err); }
}

async function markHelpful(req, res, next) {
  try {
    const id = req.params.id;
    const review = await Review.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

async function approveReview(req, res, next) {
  try {
    const id = req.params.id;
    const review = await Review.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

module.exports = { createReview, getProductReviews, markHelpful, approveReview };
