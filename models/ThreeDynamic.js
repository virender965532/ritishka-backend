const mongoose = require('mongoose');

const ThreeDynamicSchema = new mongoose.Schema({
  link: String,
  img: String, // image file path
  alt: String,
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

module.exports = mongoose.model('ThreeDynamic', ThreeDynamicSchema);