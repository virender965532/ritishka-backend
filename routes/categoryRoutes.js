const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Category = require('../models/Category');
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

const upload = multer({ storage });

router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// POST route to create a category with an image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; // Save the image path

    const category = new Category({
      name,
      title,
      description,
      isactive,
      image,
    });

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; // Save the new image path if provided

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If a new image is provided, delete the old image
    if (image && category.image) {
      const oldImagePath = path.join(__dirname, '../public', category.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = { name, title, description, isactive };
    if (image) {
      updateData.image = image; // Include new image in update if provided
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the linked image if it exists
    if (category.image) {
      const imagePath = path.join(__dirname, '../public', category.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
});

module.exports = router;