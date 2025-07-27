const express = require('express');
const router = express.Router();
const HeroPage = require('../models/HeroPage');
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

// Get all hero pages
router.get('/', async (req, res) => {
  try {
    const pages = await HeroPage.find();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hero pages' });
  }
});

// Create a new hero page
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, title, subtitle, link, isactive } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const page = new HeroPage({ name, title, subtitle, image, link, isactive, createdAt: new Date() });
    await page.save();
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hero page' });
  }
});

// Update a hero page
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, title, subtitle, link, isactive } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const item = await HeroPage.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Hero page not found' });
    }

    // If a new image is provided, delete the old image
    if (image && item.image) {
      const oldImagePath = path.join(__dirname, '../public', item.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }
    const updatedPage = await HeroPage.findByIdAndUpdate(
      req.params.id,
      { name, title, subtitle, image, link, isactive, updatedAt: new Date() },
      { new: true }
    );
    res.json(updatedPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hero page' });
  }
});

// Delete a hero page
router.delete('/:id', async (req, res) => {
  try {
    const item = await HeroPage.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Hero page not found' });
    }

    // Delete the linked image if it exists
    if (item.image) {
      const imagePath = path.join(__dirname, '../public', item.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }
    await HeroPage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hero page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hero page' });
  }
});

module.exports = router;