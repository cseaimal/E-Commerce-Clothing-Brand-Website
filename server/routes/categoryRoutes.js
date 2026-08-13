const express = require('express');
console.log('Loading categoryRoutes');
const router = express.Router();
const Category = require('../models/Category');
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware');

// In-memory fallback for when MongoDB is not connected
const inMemoryCategories = [];

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET / - list all categories
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(inMemoryCategories);
    }
    const cats = await Category.find({});
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST / - create category (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const genSlug = slug ? String(slug) : slugify(name);

    if (mongoose.connection.readyState !== 1) {
      // in-memory uniqueness check
      if (inMemoryCategories.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
        return res.status(409).json({ message: 'Category already exists' });
      }
      const newCat = { _id: String(new mongoose.Types.ObjectId()), name, slug: genSlug };
      inMemoryCategories.push(newCat);
      return res.status(201).json(newCat);
    }

    // DB-connected path
    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = new Category({ name, slug: genSlug });
    const created = await category.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
