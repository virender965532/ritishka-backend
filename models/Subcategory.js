const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  title: String,
  description: String,
  image: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isactive: Boolean,
  createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }, { timestamps: true });

module.exports = mongoose.model('Subcategory', SubcategorySchema);