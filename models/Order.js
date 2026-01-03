const mongoose = require('mongoose');
const { generateOrderNumber } = require('../utils/orderNumber');

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

const AddressSnapshot = new mongoose.Schema({
  name: String,
  phone: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  pincode: String,
  country: String,
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [ItemSchema],
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  address: AddressSnapshot,
  subtotal: Number,
  tax: Number,
  shippingCharge: Number,
  discount: Number,
  grandTotal: Number,
  status: { type: String, enum: ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED','RETURNED'], default: 'PENDING' },
}, { timestamps: true });

OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    this.orderNumber = await generateOrderNumber();
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
