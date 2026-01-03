const { createOrder: createRazorOrder, verifySignature } = require('../services/razorpayService');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');

async function createRazorpayOrder(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const razor = await createRazorOrder({ amount: order.grandTotal, receipt: order._id.toString() });
    res.json({ razor });
  } catch (err) { next(err); }
}

async function verifyRazorpay(req, res, next) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    if (!verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) return res.status(400).json({ error: 'Invalid signature' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // create payment record
    const payment = await Payment.create({
      order: order._id,
      user: req.user._id || req.user.id,
      method: 'RAZORPAY',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: order.grandTotal,
      status: 'SUCCESS',
      paidAt: new Date(),
    });

    order.payment = payment._id;
    order.status = 'CONFIRMED';
    await order.save();

    // deduct stock
    for (const it of order.items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { quantity: - (it.quantity || 1) } });
    }

    res.json({ ok: true, payment });
  } catch (err) { next(err); }
}

async function codPayment(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const payment = await Payment.create({ order: order._id, user: req.user._id || req.user.id, method: 'COD', amount: order.grandTotal, status: 'PENDING' });
    order.payment = payment._id;
    order.status = 'CONFIRMED';
    await order.save();
    res.json({ payment });
  } catch (err) { next(err); }
}

async function getPaymentByOrder(req, res, next) {
  try {
    const orderId = req.params.orderId;
    const payment = await Payment.findOne({ order: orderId }).lean();
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    // ensure ownership
    if (String(payment.user) !== String(req.user._id || req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    res.json({ payment });
  } catch (err) { next(err); }
}

module.exports = { createRazorpayOrder, verifyRazorpay, codPayment, getPaymentByOrder };
