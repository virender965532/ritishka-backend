const User = require('../models/User');
const Address = require('../models/Address');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req?.user?.id || "688e34675396869894c85af5";
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, mobile, email, dob } = req.body;

    const update = {};
    if (name) update.name = name;
    if (mobile) update.phone = mobile;
    if (email) update.email = email;
    if (dob) update.dob = dob;

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Addresses
const fetchAddresses = async (req, res) => {
  try {
    const userId = req?.user?.id || "688e34675396869894c85af5";
    const addrs = await Address.find({ user: userId }).sort({ isPrimary: -1, createdAt: -1 });
    res.json(addrs);
  } catch (err) {
    console.error('fetchAddresses error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createAddress = async (req, res) => {
  try {
    const userId = req?.user?.id || "688e34675396869894c85af5";
    const data = { ...req.body, user: userId };

    // if incoming address isPrimary, unset others
    if (data.isPrimary) {
      await Address.updateMany({ user: userId }, { isPrimary: false });
    }

    const addr = await Address.create(data);
    res.status(201).json({ message: 'Address created', address: addr });
  } catch (err) {
    console.error('createAddress error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req?.user?.id || "688e34675396869894c85af5";
    const { id } = req.params;
    const data = req.body;

    const addr = await Address.findById(id);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    if (addr.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

    if (data.isPrimary) {
      await Address.updateMany({ user: userId }, { isPrimary: false });
    }

    Object.assign(addr, data);
    await addr.save();
    res.json({ message: 'Address updated', address: addr });
  } catch (err) {
    console.error('updateAddress error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req?.user?.id || "688e34675396869894c85af5";
    const { id } = req.params;
    const addr = await Address.findById(id);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    if (addr.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

    await addr.remove();
    res.json({ message: 'Address deleted' });
  } catch (err) {
    console.error('deleteAddress error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const markPrimaryAddress = async (req, res) => {
  try {
    const userId = req?.user?.id || "688e34675396869894c85af5";
    const { id } = req.params;
    const addr = await Address.findById(id);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    if (addr.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });

    await Address.updateMany({ user: userId }, { isPrimary: false });
    addr.isPrimary = true;
    await addr.save();
    res.json({ message: 'Marked as primary', address: addr });
  } catch (err) {
    console.error('markPrimaryAddress error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  updateProfile,
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  markPrimaryAddress,
};
