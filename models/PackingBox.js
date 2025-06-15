const mongoose = require('mongoose');

const PackingBoxSchema = new mongoose.Schema({
  link: String,
  img: String, // image file path
  alt: String,
  title: String,
  desc: String,
  isactive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PackingBox', PackingBoxSchema);