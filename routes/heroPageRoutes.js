const express = require('express');
const router = express.Router();
const HeroPage = require('../models/HeroPage');
const multer = require('multer');
const { uploadImageToS3ReturnKey, deleteImageFromS3 } = require('../helper/s3Helper');

const upload = multer({ storage: multer.memoryStorage() });

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
    
    let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'hero-pages');
      imageUrl = uploadResult.Key;
    }
    
    const page = new HeroPage({ name, title, subtitle, image: imageUrl, link, isactive, createdAt: new Date() });
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
    const item = await HeroPage.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Hero page not found' });
    }

    let imageUrl = item.image;
    if (req.file) {
      if (item.image) await deleteImageFromS3(item.image);
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'hero-pages');
      imageUrl = uploadResult.Key;
    }
    
    const updatedPage = await HeroPage.findByIdAndUpdate(
      req.params.id,
      { name, title, subtitle, image: imageUrl, link, isactive, updatedAt: new Date() },
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
      await deleteImageFromS3(item.image);
    }
    await HeroPage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hero page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hero page' });
  }
});

module.exports = router;