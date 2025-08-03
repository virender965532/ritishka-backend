const express = require('express');
const router = express.Router();
const ThreeDynamic = require('../models/ThreeDynamic');
const multer = require('multer');
const { uploadImageToS3ReturnKey, deleteImageFromS3 } = require('../helper/s3Helper');

const upload = multer({ storage: multer.memoryStorage() });

// Get all threeDynamic entries
router.get('/', async (req, res) => {
  try {
    const items = await ThreeDynamic.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threeDynamic items' });
  }
});

// Create a new threeDynamic entry
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, isactive } = req.body;
    
    let imgUrl = null;
    if (req.file) {
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'three-dynamic');
      imgUrl = uploadResult.Key;
    }
    
    const item = new ThreeDynamic({
      link,
      img: imgUrl,
      alt,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create threeDynamic item' });
  }
});

// Update a threeDynamic entry
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, isactive } = req.body;

    const item = await ThreeDynamic.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'ThreeDynamic item not found' });
    }

    let imgUrl = item.img;
    if (req.file) {
      if (item.img) await deleteImageFromS3(item.img);
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'three-dynamic');
      imgUrl = uploadResult.Key;
    }

    const updateData = {
      link,
      alt,
      isactive,
      img: imgUrl,
      updatedAt: new Date()
    };

    const updatedItem = await ThreeDynamic.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update threeDynamic item' });
  }
});

// Delete a threeDynamic entry
router.delete('/:id', async (req, res) => {
  try {
    const item = await ThreeDynamic.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'ThreeDynamic item not found' });
    }

    // Delete the linked image if it exists
    if (item.img) {
      await deleteImageFromS3(item.img);
    }

    await ThreeDynamic.findByIdAndDelete(req.params.id);
    res.json({ message: 'ThreeDynamic item and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete threeDynamic item' });
  }
});

module.exports = router;