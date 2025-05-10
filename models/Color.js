const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: String,
  isactive: Boolean,
});

module.exports = mongoose.model('Color', ColorSchema);