const express = require('express');
const router = express.Router();
const Occasion = require('../models/Occasion');

router.get('/', async (req, res) => {
  const occasions = await Occasion.find();
  res.json(occasions);
});

router.post('/', async (req, res) => {
  try {
    const { name, isactive, showonhomepage=false } = req.body;
    const occasion = new Occasion({ name, isactive, showonhomepage });
    await occasion.save();
    res.json(occasion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create occasion' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, isactive, showonhomepage } = req.body;
    const updatedOccasion = await Occasion.findByIdAndUpdate(req.params.id, { name, isactive, showonhomepage }, { new: true });
    res.json(updatedOccasion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update occasion' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Occasion.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Occasion not found' });
    }
    res.json({ message: 'Occasion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting occasion', error });
  }
});

module.exports = router;