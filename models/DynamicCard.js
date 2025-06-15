const mongoose = require('mongoose');

const DynamicCardSchema = new mongoose.Schema({
  alt: String,
  link: String,
  img: String, // image file path
  type: { type: String, enum: ['main', 'side'], required: true },
  isactive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DynamicCard', DynamicCardSchema);