const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  name: String,
  isactive: Boolean,
  showonhomepage: Boolean,
});

module.exports = mongoose.model('Tag', TagSchema);