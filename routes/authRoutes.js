const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Config
const JWT_SECRET = process.env.JWT_SECRET || "RITISHKA";
const ALLOW_ADMIN_CREATION = process.env.ALLOW_ADMIN_CREATION || true; // Toggle this flag to allow or disallow admin creation

// Signup
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = "USER",
      createdBy,
      isConfirmed = false,
      isBlocked = false,
      isTempAccount = false
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const existingUserWithEmail = await User.findOne({ email });
    const existingUserWithPhone = await User.findOne({ phone});

    if (existingUserWithEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (existingUserWithPhone) {
      return res.status(400).json({ error: "Phone Number already exists" });
    }

    if (["ADMIN", "SUPERADMIN"].includes(role) && !ALLOW_ADMIN_CREATION) {
      return res.status(403).json({ error: "Admin creation is not allowed" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      createdBy,
      isConfirmed,
      isBlocked,
      isTempAccount,
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    if (user.isBlocked) return res.status(403).json({ error: "Account is blocked" });

    if(!user.isConfirmed) return res.status(403).json({ error: "Account is not confirmed" });

    if(user.isTempAccount) return res.status(403).json({ error: "Please create a New Permanent Account" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

