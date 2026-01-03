const Razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createOrder({ amount, currency = 'INR', receipt }) {
  const options = {
    amount: Math.round(amount * 100), // rupees to paise
    currency,
    receipt,
    payment_capture: 1,
  };
  const order = await instance.orders.create(options);
  return order;
}

function verifySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  return expected === razorpaySignature;
}

module.exports = { createOrder, verifySignature };
