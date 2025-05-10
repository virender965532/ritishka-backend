const mongoose = require('mongoose');

const OccasionSchema = new mongoose.Schema({
  name: String,
  isactive: Boolean,
  showonhomepage: Boolean,
});

module.exports = mongoose.model('Occasion', OccasionSchema);