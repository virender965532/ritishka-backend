require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
