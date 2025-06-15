const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  price: String,
  title: String,
  link: String,
  image: String,
  isactive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', BannerSchema);