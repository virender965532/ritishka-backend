const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

router.get('/', async (req, res) => {
  const tags = await Tag.find();
  res.json(tags);
});

router.post('/', async (req, res) => {
  try {
    const { name, isactive, showonhomepage=false } = req.body;
    const tag = new Tag({ name, isactive, showonhomepage });
    await tag.save();
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, isactive, showonhomepage } = req.body;
    const updatedTag = await Tag.findByIdAndUpdate(req.params.id, { name, isactive, showonhomepage }, { new: true });
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tag.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tag', error });
  }
});

module.exports = router;