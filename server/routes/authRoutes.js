const express = require('express');
console.log('Loading authRoutes');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'A user with that email already exists' });

    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), password });
    await user.save();

    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, secret, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    console.error('Register error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Invalid credentials' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password || '');
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, secret, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    console.error('Login error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// TEMP: protected test route — can be used to verify `protect` middleware
router.get('/test-protected', require('../middleware/authMiddleware').protect, (req, res) => {
  return res.json({ ok: true, user: req.user ? { id: req.user._id || req.user.id, role: req.user.role } : null });
});

// GET /api/auth/me - return current authenticated user (sanitized)
router.get('/me', require('../middleware/authMiddleware').protect, (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const u = req.user;
  return res.json({
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      addresses: u.addresses || [],
    },
  });
});

module.exports = router;

