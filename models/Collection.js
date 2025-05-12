const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: String,
  isactive: Boolean,
  showonhomepage: Boolean,
  subtitle: String,
  description: String,
  link: String,
});

module.exports = mongoose.model('Collection', CollectionSchema);