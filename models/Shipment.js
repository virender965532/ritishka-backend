const mongoose = require('mongoose');

const TrackingSchema = new mongoose.Schema({
  status: String,
  location: String,
  timestamp: { type: Date, default: Date.now },
});

const ShipmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  courier: String,
  trackingNumber: String,
  shippedAt: Date,
  deliveredAt: Date,
  trackingHistory: [TrackingSchema],
}, { timestamps: true });

module.exports = mongoose.model('Shipment', ShipmentSchema);
