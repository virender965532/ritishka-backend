const express = require('express');
const router = express.Router();
const DynamicCard = require('../models/DynamicCard');
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

// Get all dynamic cards
router.get('/', async (req, res) => {
  try {
    const cards = await DynamicCard.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dynamic cards' });
  }
});

// Create a new dynamic card
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { alt, link, type, isactive } = req.body;
    const img = req.file ? `/images/${req.file.filename}` : null;
    const card = new DynamicCard({
      alt,
      link,
      img,
      type,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create dynamic card' });
  }
});

// Update a dynamic card
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { alt, link, type, isactive } = req.body;
    const img = req.file ? `/images/${req.file.filename}` : null;

    const card = await DynamicCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Dynamic card not found' });
    }

    // If a new image is provided, delete the old image
    if (img && card.img) {
      const oldImagePath = path.join(__dirname, '../public', card.img);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = {
      alt,
      link,
      type,
      isactive,
      updatedAt: new Date()
    };
    if (img) {
      updateData.img = img;
    }

    const updatedCard = await DynamicCard.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dynamic card' });
  }
});

// Delete a dynamic card
router.delete('/:id', async (req, res) => {
  try {
    const card = await DynamicCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Dynamic card not found' });
    }

    // Delete the linked image if it exists
    if (card.img) {
      const imagePath = path.join(__dirname, '../public', card.img);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    await DynamicCard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dynamic card and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete dynamic card' });
  }
});

module.exports = router;