const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); // Save images in the public/images folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage, limits: { files: 6 } }); // Allow a maximum of 6 images

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find().skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments();
    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// POST route to create a product with images
router.post('/', upload.array('images', 6), async (req, res) => {
  try {
    const { title, price, discount, color, description, quantity, subcategory, tags, collection, occasion, showOnHomepage, isLatest, hotSeller, isTrending, showInGallery, createdBy, isfeatured, isactive } = req.body;
    const images = req.files ? req.files.map(file => `/images/${file.filename}`) : []; // Save the image paths

    const product = new Product({
      title,
      price,
      discount,
      color,
      description,
      quantity,
      subcategory,
      tags,
      images,
      collection,
      occasion,
      showOnHomepage,
      isLatest,
      hotSeller,
      isTrending,
      showInGallery,
      createdBy,
      isfeatured,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', upload.array('images', 6), async (req, res) => {
  try {
    const { title, price, discount, color, description, quantity, subcategory, tags, collection, occasion, showOnHomepage, isLatest, hotSeller, isTrending, showInGallery, updatedBy, isfeatured, isactive } = req.body;
    const newImages = req.files ? req.files.map(file => `/images/${file.filename}`) : null; // Save the new image paths if provided

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If new images are provided, delete the old images
    if (newImages) {
      product.images.forEach(image => {
        const oldImagePath = path.join(__dirname, '../public', image);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Error deleting old image:', err);
          }
        });
      });
    }

    const updateData = {
      title,
      price,
      discount,
      color,
      description,
      quantity,
      subcategory,
      tags,
      updatedAt: new Date(),
      updatedBy,
      isfeatured,
      isactive,
      collection,
      occasion,
      showOnHomepage,
      isLatest,
      hotSeller,
      isTrending,
      showInGallery,
    };
    if (newImages) {
      updateData.images = newImages; // Include new images in update if provided
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the linked images if they exist
    product.images.forEach(image => {
      const imagePath = path.join(__dirname, '../public', image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    });

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product and linked images deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

module.exports = router;