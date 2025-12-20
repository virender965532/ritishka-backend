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
const heroPageRoutes = require('./routes/heroPageRoutes');
const packingBoxRoutes = require('./routes/packingBoxRoutes');
const threeDynamicRoutes = require('./routes/threeDynamicRoutes');
const dynamicCardRoutes = require('./routes/dynamicCardRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const sendEmailRoutes = require('./routes/sendEmailRoutes');
const userRoutes = require('./routes/userRoutes');

connectDB();
const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' })); // Increase limit as needed
app.use(express.urlencoded({ limit: '100mb', extended: true }));

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
app.use('/api/pages/hero', heroPageRoutes);
app.use('/api/pages/packing-box', packingBoxRoutes);
app.use('/api/pages/three-dynamic', threeDynamicRoutes);
app.use('/api/pages/dynamic-card', dynamicCardRoutes);
app.use('/api/pages/banner', bannerRoutes);
app.use('/api/send-email', sendEmailRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});