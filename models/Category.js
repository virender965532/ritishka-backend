const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  image: String,
  isactive: Boolean,
});

module.exports = mongoose.model('Category', CategorySchema);