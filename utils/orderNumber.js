const Order = require('../models/Order');

async function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0,10).replace(/-/g,''); // YYYYMMDD
  // count today's orders to generate suffix
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
  const count = await Order.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } });
  const suffix = String(count + 1).padStart(4, '0');
  return `ORD-${datePart}-${suffix}`;
}

module.exports = { generateOrderNumber };
