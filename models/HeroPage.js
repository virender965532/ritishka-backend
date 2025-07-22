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

module.exports = mongoose.model('HeroPage', HeroPageSchema);