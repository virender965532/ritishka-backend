const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  image: String,
  category_id: String,
  isactive: Boolean,
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);