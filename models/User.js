const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^\S+@\S+\.\S+$/ 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^[0-9]{10}$/ // Adjust regex as needed
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN", "SUPERADMIN"], default: "USER" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isConfirmed: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isTempAccount: { type: Boolean, default: false },
  deletedAt: { type: Date },
  password: String,
  googleId: String,
  facebookId: String,
  loginHistory: [{ timestamp: { type: Date, default: Date.now } }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
