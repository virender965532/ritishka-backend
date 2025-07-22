const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  color: [String],
  brand: { type: String },
  sku: { type: String, required: true },
  video: { type: String },
  youtubeLink: { type: String },
  facebookLink: { type: String },
  instagramLink: { type: String },
  shortDescription: { type: String },
  description: { type: String },
  quantity: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  images: [{ type: String }],
  collection: { type: String },
  occasion: { type: String },
  showOnHomepage: { type: Boolean, default: false },
  isLatest: { type: Boolean, default: false },
  hotSeller: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  showInGallery: { type: Boolean, default: false },
  isfeatured: { type: Boolean, default: false },
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

module.exports = mongoose.model('Product', ProductSchema);