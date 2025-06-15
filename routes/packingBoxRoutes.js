const express = require('express');
const router = express.Router();
const PackingBox = require('../models/PackingBox');
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

// Get all packing boxes
router.get('/', async (req, res) => {
  try {
    const boxes = await PackingBox.find();
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packing boxes' });
  }
});

// Create a new packing box
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, title, desc, isactive } = req.body;
    const img = req.file ? `/images/${req.file.filename}` : null;
    const box = new PackingBox({
      link,
      img,
      alt,
      title,
      desc,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await box.save();
    res.json(box);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create packing box' });
  }
});

// Update a packing box
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, title, desc, isactive } = req.body;
    const img = req.file ? `/images/${req.file.filename}` : null;

    const box = await PackingBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Packing box not found' });
    }

    // If a new image is provided, delete the old image
    if (img && box.img) {
      const oldImagePath = path.join(__dirname, '../public', box.img);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = {
      link,
      alt,
      title,
      desc,
      isactive,
      updatedAt: new Date()
    };
    if (img) {
      updateData.img = img;
    }

    const updatedBox = await PackingBox.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBox);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update packing box' });
  }
});

// Delete a packing box
router.delete('/:id', async (req, res) => {
  try {
    const box = await PackingBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Packing box not found' });
    }

    // Delete the linked image if it exists
    if (box.img) {
      const imagePath = path.join(__dirname, '../public', box.img);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    await PackingBox.findByIdAndDelete(req.params.id);
    res.json({ message: 'Packing box and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete packing box' });
  }
});

module.exports = router;