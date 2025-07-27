const mongoose = require('mongoose');

const HeroPageSchema = new mongoose.Schema({
  name: String,
  title: String,
  subtitle: String,
  image: String, // image file path
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