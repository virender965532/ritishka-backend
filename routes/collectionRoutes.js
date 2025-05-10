const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

router.get('/', async (req, res) => {
  const collections = await Collection.find();
  res.json(collections);
});

router.post('/', async (req, res) => {
  try {
    const { name, isactive, showonhomepage=false } = req.body;
    const collection = new Collection({ name, isactive, showonhomepage });
    await collection.save();
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, isactive, showonhomepage } = req.body;
    const updatedCollection = await Collection.findByIdAndUpdate(req.params.id, { name, isactive, showonhomepage }, { new: true });
    res.json(updatedCollection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Collection.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting collection', error });
  }
});

module.exports = router;