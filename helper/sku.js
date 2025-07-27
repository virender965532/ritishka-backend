const Product = require('../models/Product');
const Category = require('../models/Category');

async function generateSku(categoryId) {
  const prefix = 'SKU-RS';
  if (!categoryId) {
    throw new Error('Category ID is required to generate SKU');
  }
  const category = await Category.findById(categoryId);
  const catChar = category?.name?.charAt(0)?.toUpperCase() || 'X';
  const regex = new RegExp(`^${prefix}${catChar}-\\d{3}$`);
  const lastProduct = await Product.find({ sku: { $regex: regex } })
    .sort({ sku: -1 })
    .limit(1);
  let nextId = 1;
  if (lastProduct.length > 0) {
    const lastSku = lastProduct[0].sku;
    const num = parseInt(lastSku.split('-')[2]);
    nextId = num + 1;
  }
  return `${prefix}${catChar}-${String(nextId).padStart(3, '0')}`;
}

module.exports = { generateSku };