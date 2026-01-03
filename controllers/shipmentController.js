const Shipment = require('../models/Shipment');
const Order = require('../models/Order');

async function createShipment(req, res, next) {
  try {
    const { orderId, courier, trackingNumber, shippedAt } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const ship = await Shipment.create({ order: order._id, courier, trackingNumber, shippedAt: shippedAt || new Date(), trackingHistory: [{ status: 'SHIPPED', location: '', timestamp: new Date() }] });
    order.status = 'SHIPPED';
    await order.save();
    res.json({ shipment: ship });
  } catch (err) { next(err); }
}

async function getShipment(req, res, next) {
  try {
    const orderId = req.params.orderId || req.params.id;
    const ship = await Shipment.findOne({ order: orderId }).lean();
    if (!ship) return res.status(404).json({ error: 'Shipment not found' });
    res.json({ shipment: ship });
  } catch (err) { next(err); }
}

async function updateShipmentStatus(req, res, next) {
  try {
    const orderId = req.params.orderId || req.params.id;
    const { status, location, timestamp } = req.body;
    let ship = await Shipment.findOne({ order: orderId });
    if (!ship) return res.status(404).json({ error: 'Shipment not found' });
    ship.trackingHistory.push({ status, location, timestamp: timestamp ? new Date(timestamp) : new Date() });
    if (status === 'DELIVERED') {
      ship.deliveredAt = new Date();
      const order = await Order.findById(orderId);
      if (order) { order.status = 'DELIVERED'; await order.save(); }
    }
    await ship.save();
    res.json({ shipment: ship });
  } catch (err) { next(err); }
}

module.exports = { createShipment, getShipment, updateShipmentStatus };
