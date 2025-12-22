const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');

const formatItem = (item) => ({
  product_id: item.product ? item.product.toString() : null,
  quantity: item.quantity || 1,
  color: item.color || null,
  _id: item._id
});

const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let wish = await Wishlist.findOne({ user: userId });
    if (!wish) return res.json({ items: [] });

    const items = wish.items.map(formatItem);
    res.json({ items });
  } catch (err) {
    console.error('getWishlist error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { product_id, quantity = 1, color } = req.body;
    if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ error: 'Invalid product_id' });
    }

    let wish = await Wishlist.findOne({ user: userId });
    if (!wish) wish = await Wishlist.create({ user: userId, items: [] });

    const exists = wish.items.find(i => i.product.toString() === product_id && ((i.color||'') === (color||'')));
    if (exists) return res.status(200).json({ item: formatItem(exists) });

    wish.items.push({ product: product_id, quantity, color });
    await wish.save();
    const item = wish.items[wish.items.length - 1];
    res.status(201).json({ item: formatItem(item) });
  } catch (err) {
    console.error('addWishlist error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeWishlistItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(itemId)) return res.status(400).json({ error: 'Invalid item id' });

    const wish = await Wishlist.findOne({ user: userId });
    if (!wish) return res.status(404).json({ error: 'Wishlist not found' });

    const items = wish.items;
    if (!items.some(el => el.product.toString() == itemId)) return res.status(404).json({ error: 'Item not found' });

    wish.items = wish.items.filter(el => el.product.toString() != itemId);
    await wish.save();
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('removeWishlistItem error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getWishlist,
  addWishlist,
  removeWishlistItem
};
