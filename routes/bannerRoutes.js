const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
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

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Create a new banner
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { price, title, link, isactive } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const banner = new Banner({
      price,
      title,
      link,
      image,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// Update a banner
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { price, title, link, isactive } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // If a new image is provided, delete the old image
    if (image && banner.image) {
      const oldImagePath = path.join(__dirname, '../public', banner.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = { price, title, link, isactive, updatedAt: new Date() };
    if (image) {
      updateData.image = image;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// Delete a banner
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Delete the linked image if it exists
    if (banner.image) {
      const imagePath = path.join(__dirname, '../public', banner.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router;