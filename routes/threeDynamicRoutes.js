const express = require('express');
const router = express.Router();
const ThreeDynamic = require('../models/ThreeDynamic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get all threeDynamic entries
router.get('/', async (req, res) => {
  try {
    const items = await ThreeDynamic.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threeDynamic items' });
  }
});

// Create a new threeDynamic entry
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, isactive } = req.body;
    const img = req.file ? `/images/${req.file.filename}` : null;
    const item = new ThreeDynamic({
      link,
      img,
      alt,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create threeDynamic item' });
  }
});

// Update a threeDynamic entry
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, isactive } = req.body;
    const img = req.file ? `/images/${req.file.filename}` : null;

    const item = await ThreeDynamic.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'ThreeDynamic item not found' });
    }

    // If a new image is provided, delete the old image
    if (img && item.img) {
      const oldImagePath = path.join(__dirname, '../public', item.img);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = {
      link,
      alt,
      isactive,
      updatedAt: new Date()
    };
    if (img) {
      updateData.img = img;
    }

    const updatedItem = await ThreeDynamic.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update threeDynamic item' });
  }
});

// Delete a threeDynamic entry
router.delete('/:id', async (req, res) => {
  try {
    const item = await ThreeDynamic.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'ThreeDynamic item not found' });
    }

    // Delete the linked image if it exists
    if (item.img) {
      const imagePath = path.join(__dirname, '../public', item.img);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    await ThreeDynamic.findByIdAndDelete(req.params.id);
    res.json({ message: 'ThreeDynamic item and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete threeDynamic item' });
  }
});

module.exports = router;