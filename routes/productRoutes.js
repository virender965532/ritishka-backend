const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const fs = require('fs');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images')); // Save images in the public/images folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage, limits: { files: 6 } }); // Allow a maximum of 6 images

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 25;
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find().skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments();
    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// ...existing code...

router.post('/filter', async (req, res) => {
  try {
    const {
      priceMin,
      priceMax,
      category = null,
      collection = null,
      occasion = null,
      tag = null,
      color = null,
      sort,
      page = 1
    } = req.body;

    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;

    // Build filter
    let filter = { isactive: true };

    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = Number(priceMin);
      if (priceMax !== undefined) filter.price.$lte = Number(priceMax);
    }
    if (category && Array.isArray(category) && category.length > 0) {
      filter.category = { $in: category };
    }
    if (collection && Array.isArray(collection) && collection.length > 0) {
      filter.collection = { $in: collection };
    }
    if (occasion && Array.isArray(occasion) && occasion.length > 0) {
      filter.occasion = { $in: occasion };
    }
    if (tag && Array.isArray(tag) && tag.length > 0) {
      filter.tags = { $in: tag };
    }
    if (color && Array.isArray(color) && color.length > 0) {
      filter.color = { $in: color };
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === 'latest') {
      // filter.isLatest = true;
      sortOption = { createdAt: -1 };
    } else if (sort === 'featured') {
      // filter.isfeatured = true;
      sortOption = { isfeatured: -1 };
    } else if (sort === 'bestSeller') {
      // filter.hotSeller = true;
      sortOption = { hotSeller: -1 };
    } else if (sort === 'lowToHigh') {
      sortOption = { price: 1 };
    } else if (sort === 'highToLow') {
      sortOption = { price: -1 };
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subcategory', select: 'name' })
      .populate({ path: 'tags', select: 'name' })
      .limit(limit)
      .skip(skip)
      .sort(sortOption);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalProducts: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by filter', details: error.message });
  }
});


router.post('/', upload.array('images', 6), async (req, res) => {
  try {
    const { title, price, discount, color, description, quantity, category, subcategory, tags, collection, occasion, showOnHomepage, isLatest, hotSeller, isTrending, showInGallery, createdBy, isfeatured, isactive } = req.body;
    const images = req.files ? req.files.map(file => `/images/${file.filename}`) : []; // Save the image paths

    // Generate slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let slugExists = await Product.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await Product.findOne({ slug });
      counter++;
    }

    // If slug already exists for the base title, return validation error
    if (counter > 2) {
      return res.status(400).json({ error: 'A product with a similar title already exists. Please use a different title.' });
    }

    const product = new Product({
      title,
      slug : counter > 1 ? `${baseSlug}-${counter}` : baseSlug,
      price,
      discount,
      color,
      description,
      quantity,
      category,
      subcategory,
      tags: tags ? tags.split(',').map(tag => new mongoose.Types.ObjectId(tag?.trim())) : [],
      images,
      collection,
      occasion,
      showOnHomepage,
      isLatest,
      hotSeller,
      isTrending,
      showInGallery,
      createdBy,
      isfeatured,
      isactive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', upload.array('images', 6), async (req, res) => {
  try {
    const { title, price, discount, color, description, quantity, category, subcategory, tags, collection, occasion, showOnHomepage, isLatest, hotSeller, isTrending, showInGallery, updatedBy, isfeatured, isactive } = req.body;
    const newImages = req.files?.length > 0 ? req.files.map(file => `/images/${file.filename}`) : null; // Save the new image paths if provided

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    var productslug = slugify(title);
    if(product.title !== title) {
      // Generate slug
      let baseSlug = slugify(title);
      let slug = baseSlug;
      productslug = slug
      let slugExists = await Product.findOne({ slug });
      let counter = 1;
      while (slugExists) {
        slug = `${baseSlug}-${counter}`;
        productslug = slug;
        slugExists = await Product.findOne({ slug });
        counter++;
      }
      // If slug already exists for the base title, return validation error
      if (counter > 2) {
        return res.status(400).json({ error: 'A product with a similar title already exists. Please use a different title.' });
      }
    }

    // If new images are provided, delete the old images
    if (newImages) {
      product.images.forEach(image => {
        const oldImagePath = path.join(__dirname, '../public', image);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Error deleting old image:', err);
          }
        });
      });
    }

    const updateData = {
      title,
      slug: productslug,
      price,
      discount,
      color,
      description,
      quantity,
      category,
      subcategory,
      tags: tags ? tags.split(',').map(tag => new mongoose.Types.ObjectId(tag?.trim())) : [],
      updatedAt: new Date(),
      updatedBy,
      isfeatured,
      isactive,
      collection,
      occasion,
      showOnHomepage,
      isLatest,
      hotSeller,
      isTrending,
      showInGallery,
    };
    if (newImages) {
      updateData.images = newImages; // Include new images in update if provided
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the linked images if they exist
    product.images.forEach(image => {
      const imagePath = path.join(__dirname, '../public', image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        }
      });
    });

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product and linked images deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

router.post('/by-tags', async (req, res) => {
  try {
    const { tagIds } = req.body; // Expecting { tagIds: [id1, id2, ...] }
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({ error: 'tagIds must be a non-empty array' });
    }

    var resultsMap = new Map();

    for (const tagId of tagIds) {
      var objectTagId = new mongoose.Types.ObjectId(tagId);
      const products = await Product.find({
        tags: { $in: [objectTagId] },
        isactive: true
      })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subcategory', select: 'name' })
      .limit(8)
      .sort({ createdAt: -1 });
      for (const product of products) {
        resultsMap.set(product._id.toString(), product);
      }
    }

    const uniqueResults = Array.from(resultsMap.values());
    res.json(uniqueResults);
  } catch (error) {
    console.log('Error fetching products by tags:', error);
    res.status(500).json({ error: 'Failed to fetch products by tags' });
  }
});

router.post('/by-types', async (req, res) => {
  try {
    const { types } = req.body; // Expecting { type: [isLatest, hotSeller, isTrending, showInGallery, isfeatured] }
    if (!Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ error: 'types must be a non-empty array' });
    }

    var results = [];
    var filter = { isactive: true };
    if (types.includes('isLatest')) {
      filter.isLatest = true;
    }
    if (types.includes('hotSeller')) {
      filter.hotSeller = true;
    }
    if (types.includes('isTrending')) {
      filter.isTrending = true;
    }
    if (types.includes('showInGallery')) {
      filter.showInGallery = true;
    }
    if (types.includes('isfeatured')) {
      filter.isfeatured = true;
    }
    const products = await Product.find(filter)
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subcategory', select: 'name' })
      .limit(18)
      .sort({ createdAt: -1 });
      results = [...results, ...products];


    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by types' });
  }
});

router.post('/by-filter', async (req, res) => {
  try {
    const { filter: filterReq, limit=15, skip=0, sort:sortReq } = req.body;

    var results = [];
    var sort = sortReq ? sortReq : { createdAt: -1 };
    var filter = filterReq ? { isactive: true } : { isactive: true };
    const products = await Product.find(filter)
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subcategory', select: 'name' })
      .limit(limit).
      skip(skip)
      .sort(sort);
      // results = [...results, ...products];


    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by types' });
  }
});

router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }
  try {
    const product = await Product.findOne({ slug })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subcategory', select: 'name' })
      .populate({ path: 'tags', select: 'name' }); 
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }     
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});
module.exports = router;