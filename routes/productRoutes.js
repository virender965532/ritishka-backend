const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const fs = require('fs');
const mongoose = require('mongoose');
const { generateSlug } = require('../helper/slug');
const { generateSku } = require('../helper/sku');
const nodemailer = require('nodemailer');
require('dotenv').config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'video' ? '../public/videos' : '../public/images';
    cb(null, path.join(__dirname, folder));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const fileUpload = upload.fields([
  { name: 'images', maxCount: 6 },
  { name: 'video', maxCount: 1 },
]);

router.get('/', async (req, res) => {
  const {
    page = 1,
    limit = 25,
    search = '',
    sort = 'createdAt_desc',
    skip = 0
  } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  let sortOption = {};
  switch (sort) {
    case 'alphabetical':
      sortOption = { title: 1 };
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
    case 'price':
      sortOption = { price: 1 };
      break;
    case 'discount':
      sortOption = { discount: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const skipVal = skip ? parseInt(skip) : (parseInt(page) - 1) * parseInt(limit);

  try {
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('tags', 'name')
      .sort(sortOption)
      .skip(skipVal)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .limit(parseInt(limit));
    const totalProducts = await Product.countDocuments(query);
    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});


router.post('/filter', async (req, res) => {
  try {
    const {
      priceMin,
      priceMax,
      category = null,
      collection = null,
      occasion = null,
      tag = null,
      colors = null,
      sort,
      page = 1
    } = req.body;

    const limit = 20;
    const skip = (parseInt(page) - 1) * limit;

    let filter = { isactive: true };

    if (priceMin !== undefined || priceMax !== undefined) {
      filter.discountedPrice = {};
      if (priceMin !== undefined) filter.discountedPrice.$gte = Number(priceMin);
      if (priceMax !== undefined) filter.discountedPrice.$lte = Number(priceMax);
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
    if (colors && Array.isArray(colors) && colors.length > 0) {
      filter.colors = { $in: colors };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'lowToHigh') {
      sortOption = { discountedPrice: 1 };
    } else if (sort === 'highToLow') {
      sortOption = { discountedPrice: -1 };
    } else if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'featured') {
      sortOption = { isfeatured: -1 };
    } else if (sort === 'bestSeller') {
      sortOption = { hotSeller: -1 };
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subcategory', select: 'name' })
      .populate({ path: 'tags', select: 'name' })
      .limit(limit)
      .skip(skip)
      .sort(sortOption)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

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


router.post('/', fileUpload, async (req, res) => {
  try {
    const {
      title, price, discount = 0, colors, description, quantity, category, subcategory, tags,
      collection, occasion, showOnHomepage, isLatest, hotSeller, isTrending, showInGallery,
      isfeatured, isactive, brand, shortDescription, soldOut,
      youtubeLink, facebookLink, instagramLink, blogLink, userId
    } = req.body;

    const images = req?.files?.images ? req.files.images.map(file => `/images/${file.filename}`) : [];
    // Make video optional
    const video = req.file?.video ? `/videos/${req.file.video.filename}` : undefined;

    const slug = generateSlug(title);
    const sku = await generateSku(category);
    const discountedPrice = price - (price * (discount / 100));

    const product = new Product({
      title,
      slug,
      price,
      discount,
      discountedPrice,
      colors: colors ? colors : [],
      brand,
      description,
      shortDescription,
      quantity,
      category,
      subcategory,
      tags: tags ? tags.map(tag => new mongoose.Types.ObjectId(tag.trim())) : [],
      images,
      collection,
      occasion,
      showOnHomepage,
      isLatest,
      hotSeller,
      isTrending,
      showInGallery,
      createdBy: userId,
      isfeatured,
      isactive,
      sku,
      video, // will be undefined if not uploaded
      youtubeLink,
      facebookLink,
      instagramLink,
      blogLink,
      soldOut: soldOut === 'true',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.MAIL_PASS
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://ritishkasilver.com';
    const productUrl = `${frontendUrl}/product/${slug}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Product Created - SKU: ${sku}`,
      html: `
        <div style="font-family:Arial;padding:20px;">
          <h2 style="color:#444;">New Product Added</h2>
          <img src="${images[0] ? frontendUrl + images[0] : ''}" style="max-width:300px;border-radius:8px;" />
          <h3>${title}</h3>
          <p><strong>Price:</strong> ₹${price}</p>
          <p><strong>SKU:</strong> ${sku}</p>
          <p><strong>Discounted Price:</strong> ₹${discountedPrice}</p>
          <p><strong>Brand:</strong> ${brand || ''}</p>
          <p><strong>Short Description:</strong> ${shortDescription || ''}</p>
          <a href="${productUrl}" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">View Product</a>
        </div>
      `
    };
    // transporter.sendMail(mailOptions);

    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

router.put('/:id', fileUpload, async (req, res) => {
  try {
    const {
      title, price, discount, colors, description, quantity, category, subcategory, tags,
      collection, occasion, showOnHomepage, isLatest, hotSeller, isTrending, showInGallery,
      userId, isfeatured, isactive, brand, shortDescription, soldOut,
      youtubeLink, facebookLink, instagramLink, blogLink
    } = req.body;

    const newImages = req.file?.images?.length > 0 ? req.file?.images.map(file => `/images/${file.filename}`) : null;
    // Make video optional
    const newVideo = req.file?.video ? `/videos/${req.file.video.filename}` : undefined;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update slug if title changes
    let slug = product.slug;
    if (title && title !== product.title) {
      slug = generateSlug(title);
    }

    // Update SKU if category changes
    let sku = product.sku;
    if (category && category !== String(product.category)) {
      sku = await generateSku(category);
    }

    // Delete old images if new ones are uploaded
    if (newImages && product.images && product.images.length > 0) {
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '../public', image);
        fs.unlink(imagePath, () => {});
      });
    }

    // Delete old video if new one is uploaded
    if (newVideo && product.video) {
      const videoPath = path.join(__dirname, '../public', product.video);
      fs.unlink(videoPath, () => {});
    }

    // Calculate discountedPrice
    const discountedPrice = price - (price * (discount / 100));

    const updateData = {
      title,
      slug,
      price,
      discount,
      discountedPrice,
      colors: colors ? colors : [],
      brand,
      description,
      shortDescription,
      quantity,
      category,
      subcategory,
      tags: tags ? tags.map(tag => new mongoose.Types.ObjectId(tag.trim())) : [],
      collection,
      occasion,
      showOnHomepage,
      isLatest,
      hotSeller,
      isTrending,
      showInGallery,
      updatedBy: userId,
      isfeatured,
      isactive,
      sku,
      youtubeLink,
      facebookLink,
      instagramLink,
      blogLink,
      soldOut: soldOut === 'true',
      updatedAt: new Date(),
    };
    if (newImages) updateData.images = newImages;
    // Only update video if a new one is uploaded, otherwise keep old or undefined
    if (newVideo !== undefined) updateData.video = newVideo;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images
    product.images.forEach(image => {
      const imagePath = path.join(__dirname, '../public', image);
      fs.unlink(imagePath, () => {});
    });

    // Delete video (optional)
    if (product.video) {
      const videoPath = path.join(__dirname, '../public', product.video);
      fs.unlink(videoPath, () => {});
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product and linked files deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

// POST /by-tags
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
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('tags', 'name')
      .limit(8)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .lean();
      for (const product of products) {
        resultsMap.set(product._id.toString(), product);
      }
    }

    const uniqueResults = Array.from(resultsMap.values());
    res.json(uniqueResults);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by tags' });
  }
});

// POST /by-types
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
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('tags', 'name')
      .limit(18)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .lean();
    results = [...results, ...products];

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by types' });
  }
});

// POST /by-filter
router.post('/by-filter', async (req, res) => {
  try {
    const { filter: filterReq, limit=15, skip=0, sort:sortReq } = req.body;

    var sort = sortReq ? sortReq : { createdAt: -1 };
    var filter = filterReq ? { isactive: true } : { isactive: true };
    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('tags', 'name')
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products by types' });
  }
});

// GET /:slug
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }
  try {
    const product = await Product.findOne({ slug })
      .populate('category')
      .populate('subcategory')
      .populate('tags')
      .lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});
module.exports = router;