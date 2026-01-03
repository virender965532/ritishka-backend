const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, enum: ['COD','RAZORPAY','STRIPE'], required: true },
  transactionId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','SUCCESS','FAILED','REFUNDED'], default: 'PENDING' },
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
