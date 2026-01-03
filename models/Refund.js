const mongoose = require('mongoose');

const RefundSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  reason: String,
  amount: Number,
  status: { type: String, enum: ['INITIATED','PROCESSING','COMPLETED','REJECTED'], default: 'INITIATED' },
  initiatedAt: { type: Date, default: Date.now },
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Refund', RefundSchema);
