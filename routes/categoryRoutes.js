const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Category = require('../models/Category');
const fs = require('fs');
const { generateSlug } = require('../helper/slug'); // Import the slug generation utility

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

// GET with pagination, search, and sorting
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10  ,
      search = '',
      sort = 'createdAt_desc'
    } = req.query;

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };

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

    const categories = await Category.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    const total = await Category.countDocuments(query);

    // Map categories to send only user name for createdBy and updatedBy
    const categoriesWithUserNames = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      title: cat.title,
      description: cat.description,
      isactive: cat.isactive,
      image: cat.image,
      slug: cat.slug,
      createdBy: cat.createdBy?.name,
      updatedBy: cat.updatedBy?.name,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }));

    res.json({
      categories: categoriesWithUserNames,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST route to create a category with createdBy as userId
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive, userId } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;
    const slug = generateSlug(name);

    // Check for unique slug
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category slug must be unique' });
    }

    const category = new Category({
      name,
      title,
      description,
      isactive,
      image,
      slug,
      createdBy: userId
    });

    await category.save();
    res.json({
      _id: category._id,
      name: category.name,
      title: category.title,
      description: category.description,
      isactive: category.isactive,
      image: category.image,
      slug: category.slug,
      createdBy: category.createdBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT route to update category and updatedBy as userId
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, title, description, isactive, userId } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    let slug = category.slug;
    if (name && name !== category.name) {
      slug = generateSlug(name);
      // Check for unique slug, excluding current category
      const existingCategory = await Category.findOne({ slug, _id: { $ne: category._id } });
      if (existingCategory) {
        return res.status(400).json({ error: 'Category slug must be unique' });
      }
    }

    // If a new image is provided, delete the old image
    if (image && category.image) {
      const oldImagePath = path.join(__dirname, '../public', category.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Error deleting old image:', err);
        }
      });
    }

    const updateData = { name, title, description, isactive, slug, updatedBy: userId };
    if (image) {
      updateData.image = image;
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({
      _id: updatedCategory._id,
      name: updatedCategory.name,
      title: updatedCategory.title,
      description: updatedCategory.description,
      isactive: updatedCategory.isactive,
      image: updatedCategory.image,
      slug: updatedCategory.slug,
      updatedBy: updatedCategory.updatedBy,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the linked image if it exists
    if (category.image) {
      const imagePath = path.join(__dirname, '../public', category.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category and linked image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
});

module.exports = router;