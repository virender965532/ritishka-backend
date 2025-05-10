const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: String,
  isactive: Boolean,
  showonhomepage: Boolean,
});

module.exports = mongoose.model('Collection', CollectionSchema);