const Refund = require('../models/Refund');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

async function initiateRefund(req, res, next) {
  try {
    const { orderId, reason, amount } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user._id || req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    const payment = await Payment.findOne({ order: orderId });
    const refund = await Refund.create({ order: order._id, payment: payment ? payment._id : undefined, reason, amount, status: 'INITIATED' });
    res.json({ refund });
  } catch (err) { next(err); }
}

async function getRefundByOrder(req, res, next) {
  try {
    const orderId = req.params.orderId;
    const refund = await Refund.findOne({ order: orderId }).lean();
    if (!refund) return res.status(404).json({ error: 'Refund not found' });
    // ownership
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user._id || req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    res.json({ refund });
  } catch (err) { next(err); }
}

module.exports = { initiateRefund, getRefundByOrder };
