const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  image: String,
  purity: String,
  weight: Number,
  quantity: { type: Number, default: 1 },
  price: Number,
  makingCharge: Number,
  discount: Number,
  finalPrice: Number,
});

const CheckoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [ItemSchema],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// TTL index - auto remove when expiresAt passes
CheckoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Checkout', CheckoutSchema);
