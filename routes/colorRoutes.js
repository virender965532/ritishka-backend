const express = require('express');
const router = express.Router();
const Color = require('../models/Color');

router.get('/', async (req, res) => {
  const colors = await Color.find();
  res.json(colors);
});

router.post('/', async (req, res) => {
  try {
    const { name, isactive } = req.body;
    const color = new Color({ name, isactive });
    await color.save();
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create color' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, isactive } = req.body;
    const updatedColor = await Color.findByIdAndUpdate(req.params.id, { name, isactive }, { new: true });
    res.json(updatedColor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update color' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Color.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Color not found' });
    }
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting color', error });
  }
});

module.exports = router;