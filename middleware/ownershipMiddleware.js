const Order = require('../models/Order');

async function verifyOrderOwnership(req, res, next) {
  try {
    const orderId = req.params.orderId || req.params.id || req.body.orderId;
    if (!orderId) return res.status(400).json({ error: 'order id required' });
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user._id || req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    req.order = order;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyOrderOwnership };
