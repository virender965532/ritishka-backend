const express = require("express");
const User = require("../models/User");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users
router.get("/users", protect, isAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

module.exports = router;
