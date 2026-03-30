const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User with email or username already exists' });
    }

    // Create new user
    user = new User({ fullName, username, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = { id: user.id };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, categories: user.categories } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for user (by username or email)
    const user = await User.findOne({ $or: [{ email: username }, { username: username }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = { id: user.id };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, categories: user.categories } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/categories
// Add a custom category for the user
const auth = require('../middleware/auth');
router.post('/categories', auth, async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ message: 'Category name is required' });

    const user = await User.findById(req.user.id);
    if (!user.categories.includes(category)) {
      user.categories.push(category);
      await user.save();
    }
    res.json({ categories: user.categories });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
