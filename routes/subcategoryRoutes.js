const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Subcategory = require('../models/Subcategory');
const fs = require('fs');
const { generateSlug } = require('../helper/slug');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); // Save images in the public/images folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage });

// GET with pagination, search, sorting, filter by category and isactive
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = 'createdAt_desc',
      category_id,
      isactive
    } = req.query;

    const query = {
      $and: []
    };

    // Search
    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Filter by category
    if (category_id) {
      query.$and.push({ category_id });
    }

    // Filter by isactive
    if (typeof isactive !== 'undefined') {
      query.$and.push({ isactive: isactive === 'true' });
    }

    if (query.$and.length === 0) delete query.$and;

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'alphabetical':
        sortOption = { name: 1 };
        break;
      case 'createdAt_asc':
        sortOption = { createdAt: 1 };
        break;
      case 'createdAt_desc':
        sortOption = { createdAt: -1 };
        break;
      case 'updatedAt_asc':
        sortOption = { updatedAt: 1 };
        break;
      case 'updatedAt_desc':
        sortOption = { updatedAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subcategories = await Subcategory.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category_id', '_id')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    const total = await Subcategory.countDocuments(query);

    const subcategoriesWithUserNames = subcategories.map(sub => ({
      _id: sub._id,
      name: sub.name,
      title: sub.title,
      description: sub.description,
      isactive: sub.isactive,
      image: sub.image,
      slug: sub.slug,
      category_id: sub?.category_id?.id,
      createdBy: sub.createdBy?.name,
      updatedBy: sub.updatedBy?.name,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt
    }));
    
    res.json({
      subcategories: subcategoriesWithUserNames,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

// POST: create subcategory with unique slug, createdBy, createdAt
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive, category_id, userId } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const slug = generateSlug(name);

    // Check for unique slug in subcategory
    const existingSubcategory = await Subcategory.findOne({ slug });
    if (existingSubcategory) {
      return res.status(400).json({ error: 'Subcategory slug must be unique' });
    }

    const subcategory = new Subcategory({
      name,
      title,
      description,
      isactive,
      category_id,
      image,
      slug,
      createdBy: userId
    });

    await subcategory.save();
    res.json({
      _id: subcategory._id,
      name: subcategory.name,
      title: subcategory.title,
      description: subcategory.description,
      isactive: subcategory.isactive,
      image: subcategory.image,
      slug: subcategory.slug,
      category: subcategory.category_id,
      createdBy: subcategory.createdBy,
      createdAt: subcategory.createdAt,
      updatedAt: subcategory.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
});

// PUT: update subcategory, update slug if name changes, updatedBy
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive, category_id, userId } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    let slug = subcategory.slug;
    if (name && name !== subcategory.name) {
      slug = generateSlug(name);
      // Check for unique slug, excluding current subcategory
      const existingSubcategory = await Subcategory.findOne({ slug, _id: { $ne: subcategory._id } });
      if (existingSubcategory) {
        return res.status(400).json({ error: 'Subcategory slug must be unique' });
      }
    }

    // If a new image is provided, delete the old image
    if (image && subcategory.image) {
      const oldImagePath = path.join(__dirname, '../public', subcategory.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = {
      name,
      title,
      description,
      isactive,
      category_id,
      slug,
      updatedBy: userId
    };
    if (image) {
      updateData.image = image;
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('category_id', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    res.json({
      _id: updatedSubcategory._id,
      name: updatedSubcategory.name,
      title: updatedSubcategory.title,
      description: updatedSubcategory.description,
      isactive: updatedSubcategory.isactive,
      image: updatedSubcategory.image,
      slug: updatedSubcategory.slug,
      category: updatedSubcategory.category_id?.name,
      createdBy: updatedSubcategory.createdBy?.name,
      updatedBy: updatedSubcategory.updatedBy?.name,
      createdAt: updatedSubcategory.createdAt,
      updatedAt: updatedSubcategory.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Delete the linked image if it exists
    if (subcategory.image) {
      const imagePath = path.join(__dirname, '../public', subcategory.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    // Delete the subcategory
    await Subcategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subcategory and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error });
  }
});

module.exports = router;