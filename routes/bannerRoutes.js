const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const multer = require('multer');
const { uploadImageToS3ReturnKey, deleteImageFromS3 } = require('../helper/s3Helper');

const upload = multer({ storage: multer.memoryStorage() });

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Create a new banner
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { price, title, link, isactive } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'banners');
      imageUrl = uploadResult.Key;
    }
    
    const banner = new Banner({
      price,
      title,
      link,
      image: imageUrl,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// Update a banner
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { price, title, link, isactive } = req.body;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    let imageUrl = banner.image;
    if (req.file) {
      if (banner.image) await deleteImageFromS3(banner.image);
      const uploadResult = await uploadImageToS3ReturnKey(req.file, 'banners');
      imageUrl = uploadResult.Key;
    }

    const updateData = { 
      price, 
      title, 
      link, 
      isactive, 
      image: imageUrl,
      updatedAt: new Date() 
    };

    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// Delete a banner
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Delete the linked image if it exists
    if (banner.image) {
      await deleteImageFromS3(banner.image);
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router;