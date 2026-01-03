const Order = require('../models/Order');
const Checkout = require('../models/Checkout');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

async function placeOrder(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    // allow creating order from checkout or from body
    const checkout = await Checkout.findOne({ user: userId }).lean();
    const payload = req.body;
    let items, subtotal, tax, shippingCharge, discount, grandTotal, address;
    if (checkout) {
      items = checkout.items;
      subtotal = checkout.subtotal;
      tax = checkout.tax;
      shippingCharge = checkout.shippingCharge;
      discount = checkout.discount;
      grandTotal = checkout.grandTotal;
      address = checkout.address;
    } else {
      items = payload.items;
      subtotal = payload.subtotal;
      tax = payload.tax;
      shippingCharge = payload.shippingCharge;
      discount = payload.discount;
      grandTotal = payload.grandTotal;
      address = payload.address;
    }

    if (!items || !items.length) return res.status(400).json({ error: 'No items to place order' });

    const order = await Order.create({ user: userId, items, subtotal, tax, shippingCharge, discount, grandTotal, address });

    // optionally clear checkout
    if (checkout) await Checkout.deleteOne({ user: userId });

    res.status(201).json({ order });
  } catch (err) { next(err); }
}

async function myOrders(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).populate('items.product payment').lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // ownership check
    if (String(order.user) !== String(req.user._id || req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    res.json({ order });
  } catch (err) { next(err); }
}

async function cancelOrder(req, res, next) {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user._id || req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    if (['SHIPPED','DELIVERED'].includes(order.status)) return res.status(400).json({ error: 'Cannot cancel at this stage' });
    order.status = 'CANCELLED';
    await order.save();
    res.json({ order });
  } catch (err) { next(err); }
}

async function returnOrder(req, res, next) {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.user) !== String(req.user._id || req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    if (order.status !== 'DELIVERED') return res.status(400).json({ error: 'Only delivered orders can be returned' });
    order.status = 'RETURNED';
    await order.save();
    res.json({ order });
  } catch (err) { next(err); }
}

module.exports = { placeOrder, myOrders, getOrder, cancelOrder, returnOrder };
