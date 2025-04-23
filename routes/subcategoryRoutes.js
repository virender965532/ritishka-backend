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

module.exports = router;