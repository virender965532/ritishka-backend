const express = require('express');
const router = express.Router();
const DynamicCard = require('../models/DynamicCard');
const multer = require('multer');
const { uploadImageToS3ReturnKey, deleteImageFromS3 } = require('../helper/s3Helper');

const upload = multer({ storage: multer.memoryStorage() });

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
    
    let imgUrl = null;
    if (req.file) {
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'dynamic-cards');
      imgUrl = uploadResult.Key;
    }
    
    const card = new DynamicCard({
      alt,
      link,
      img: imgUrl,
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

    const card = await DynamicCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Dynamic card not found' });
    }

    let imgUrl = card.img;
    if (req.file) {
      if (card.img) await deleteImageFromS3(card.img);
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'dynamic-cards');
      imgUrl = uploadResult.Key;
    }

    const updateData = {
      alt,
      link,
      type,
      isactive,
      img: imgUrl,
      updatedAt: new Date()
    };

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
      await deleteImageFromS3(card.img);
    }

    await DynamicCard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dynamic card and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete dynamic card' });
  }
});

module.exports = router;