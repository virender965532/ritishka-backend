const Checkout = require('../models/Checkout');
const Product = require('../models/Product');

async function createCheckout(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { items, addressId, shippingCharge = 0, tax = 0, discount = 0 } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items provided' });

    // build items and compute subtotal
    let subtotal = 0;
    const built = [];
    for (const it of items) {
      const product = await Product.findById(it.product).lean();
      if (!product) return res.status(400).json({ error: 'Invalid product ' + it.product });
      const price = product.discountedPrice || product.price;
      subtotal += product.discountedPrice;
      built.push({
        product: it.product,
        title: product.title,
        image: (product.images || [])[0],
        purity: it.purity || '',
        weight: it.weight || 0,
        quantity: it.quantity || 1,
        price: product.price || 0,
        makingCharge: it.makingCharge || 0,
        discount: product.price - product.discountedPrice || 0,
        finalPrice: product.discountedPrice || product.price,
      });
    }

    const grandTotal = subtotal + shippingCharge - discount;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // upsert checkout for user
    const checkout = await Checkout.findOneAndUpdate(
      { user: userId },
      { user: userId, items: built, subtotal, tax, shippingCharge, discount, grandTotal, address: addressId, expiresAt },
      { upsert: true, new: true }
    );

    res.json({ checkout });
  } catch (err) { next(err); }
}

async function myCheckout(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const checkout = await Checkout.findOne({ user: userId }).populate('items.product').lean();
    res.json({ checkout });
  } catch (err) { next(err); }
}

async function expireCheckout(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    await Checkout.deleteOne({ user: userId });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = { createCheckout, myCheckout, expireCheckout };
