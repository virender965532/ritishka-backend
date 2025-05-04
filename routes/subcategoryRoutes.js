const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Subcategory = require('../models/Subcategory');
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
  const subcategories = await Subcategory.find().populate('category_id');
  res.json(subcategories);
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive, category_id } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; // Save the image path

    const subcategory = new Subcategory({
      name,
      title,
      description,
      isactive,
      category_id,
      image,
    });

    await subcategory.save();
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive, category_id } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null; // Save the new image path if provided

    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // If a new image is provided, delete the old image
    if (image && subcategory.image) {
      const oldImagePath = path.join(__dirname, '../public', subcategory.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = { name, title, description, isactive, category_id };
    if (image) {
      updateData.image = image; // Include new image in update if provided
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedSubcategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Delete the linked image if it exists
    if (subcategory.image) {
      const imagePath = path.join(__dirname, '../public', subcategory.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    // Delete the subcategory
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subcategory and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error });
  }
});

module.exports = router;