const express = require('express');
const router = express.Router();
const PackingBox = require('../models/PackingBox');
const multer = require('multer');
const { uploadImageToS3ReturnKey, deleteImageFromS3 } = require('../helper/s3Helper');

const upload = multer({ storage: multer.memoryStorage() });

// Get all packing boxes
router.get('/', async (req, res) => {
  try {
    const boxes = await PackingBox.find();
    res.json(boxes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packing boxes' });
  }
});

// Create a new packing box
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, title, desc, isactive } = req.body;
    
    let imgUrl = null;
    if (req.file) {
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'packing-boxes');
      imgUrl = uploadResult.Key;
    }
    
    const box = new PackingBox({
      link,
      img: imgUrl,
      alt,
      title,
      desc,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await box.save();
    res.json(box);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create packing box' });
  }
});

// Update a packing box
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { link, alt, title, desc, isactive } = req.body;

    const box = await PackingBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Packing box not found' });
    }

    let imgUrl = box.img;
    if (req.file) {
      if (box.img) await deleteImageFromS3(box.img);
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'packing-boxes');
      imgUrl = uploadResult.Key;
    }

    const updateData = {
      link,
      alt,
      title,
      desc,
      isactive,
      img: imgUrl,
      updatedAt: new Date()
    };

    const updatedBox = await PackingBox.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBox);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update packing box' });
  }
});

// Delete a packing box
router.delete('/:id', async (req, res) => {
  try {
    const box = await PackingBox.findById(req.params.id);
    if (!box) {
      return res.status(404).json({ message: 'Packing box not found' });
    }

    // Delete the linked image if it exists
    if (box.img) {
      await deleteImageFromS3(box.img);
    }

    await PackingBox.findByIdAndDelete(req.params.id);
    res.json({ message: 'Packing box and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete packing box' });
  }
});

module.exports = router;