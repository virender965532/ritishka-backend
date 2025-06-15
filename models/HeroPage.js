const mongoose = require('mongoose');

const HeroPageSchema = new mongoose.Schema({
  name: String,
  title: String,
  subtitle: String,
  modelPath: String,
  defaultColor: String,
  colors: [String],
  link: String,
  isactive: Boolean, // <-- Added isactive field
});

module.exports = mongoose.model('HeroPage', HeroPageSchema);