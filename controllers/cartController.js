const mongoose = require('mongoose');
const Cart = require('../models/Cart');

const formatItem = (item) => ({
  product_id: item.product ? item.product.toString() : null,
  quantity: item.quantity || 1,
  color: item.color || null,
  _id: item._id
});

const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.json({ items: [] });

    const items = cart.items.map(formatItem);
    res.json({ items });
  } catch (err) {
    console.error('getCart error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addOrUpdateCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { product_id, quantity = 1, color } = req.body;
    if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ error: 'Invalid product_id' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // match existing item by product and color (color may be undefined)
    const existing = cart.items.find(i => i.product.toString() === product_id && ((i.color||'') === (color||'')));

    if (existing) {
      existing.quantity = quantity;
      existing.color = color;
    } else {
      cart.items.push({ product: product_id, quantity, color });
    }

    await cart.save();

    const item = existing ? existing : cart.items[cart.items.length - 1];
    res.status(200).json({ item: formatItem(item) });
  } catch (err) {
    console.error('addOrUpdateCart error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { itemId:product_id } = req.params;
    const { quantity, color } = req.body;

    if (!mongoose.Types.ObjectId.isValid(product_id)) return res.status(400).json({ error: 'Invalid item id' });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    // const item = cart.items.id(product_id);
    // if (!product_id) return res.status(404).json({ error: 'Item not found' });
    const item = cart.items.find(i => i.product.toString() === product_id && ((i.color||'') === (color||'')));

    if (quantity !== undefined) item.quantity = quantity;
    if (color !== undefined) item.color = color;

    await cart.save();
    res.json({ item: formatItem(item) });
  } catch (err) {
    console.error('updateCartItem error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { itemId:product_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(product_id)) return res.status(400).json({ error: 'Invalid item id' });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    // const item = cart.items.id(product_id);
    // if (!item) return res.status(404).json({ error: 'Item not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== product_id);

    // item.remove();
    await cart.save();
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('deleteCartItem error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCart,
  addOrUpdateCart,
  updateCartItem,
  deleteCartItem
};
