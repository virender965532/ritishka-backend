const express = require('express');
const router = express.Router();
const HeroPage = require('../models/HeroPage');

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
router.post('/', async (req, res) => {
  try {
    const { name, title, subtitle, modelPath, defaultColor, colors, link, isactive } = req.body;
    const page = new HeroPage({ name, title, subtitle, modelPath, defaultColor, colors, link, isactive });
    await page.save();
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hero page' });
  }
});

// Update a hero page
router.put('/:id', async (req, res) => {
  try {
    const { name, title, subtitle, modelPath, defaultColor, colors, link, isactive } = req.body;
    const updatedPage = await HeroPage.findByIdAndUpdate(
      req.params.id,
      { name, title, subtitle, modelPath, defaultColor, colors, link, isactive },
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
    await HeroPage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hero page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hero page' });
  }
});

module.exports = router;