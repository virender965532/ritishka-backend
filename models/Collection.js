const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: String,
  isactive: Boolean,
  showonhomepage: Boolean,
  subtitle: String,
  description: String,
  link: String,
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

module.exports = mongoose.model('Collection', CollectionSchema);