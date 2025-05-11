require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const occasionRoutes = require('./routes/occasionRoutes');
const colorRoutes = require('./routes/colorRoutes');
const productRoutes = require('./routes/productRoutes');

connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/occasions', occasionRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/products', productRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));