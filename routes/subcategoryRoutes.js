const express = require('express');
const router = express.Router();
const Subcategory = require('../models/Subcategory');

router.get('/', async (req, res) => {
  const subcategories = await Subcategory.find().populate('category_id');
  res.json(subcategories);
});

router.post('/', async (req, res) => {
  const subcategory = new Subcategory(req.body);
  await subcategory.save();
  res.json(subcategory);
});

router.put('/:id', async (req, res) => {
  const updated = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Subcategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error });
  }
});

module.exports = router;