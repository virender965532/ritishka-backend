const mongoose = require('mongoose');

const DynamicCardSchema = new mongoose.Schema({
  alt: String,
  link: String,
  img: String, // image file path
  type: { type: String, enum: ['main', 'side'], required: true },
  isactive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('DynamicCard', DynamicCardSchema);