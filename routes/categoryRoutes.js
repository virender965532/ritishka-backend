const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

router.post('/', async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.json(category);
});

router.put('/:id', async (req, res) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

module.exports = router;