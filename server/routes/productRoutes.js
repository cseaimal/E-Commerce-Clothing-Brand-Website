const express = require('express');
console.log('Loading productRoutes');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware');

// GET / - list products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, search } = req.query;
    const filter = {};

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (color) {
      // match products having at least one variant with the given color
      filter['variants.color'] = color;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (mongoose.connection.readyState !== 1) {
      // No DB connected: return empty array for testing on empty DB
      return res.json([]);
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /:id - single product by id
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST / - create a product (protected + admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      fabricType,
      price,
      wholesalePrice,
      moq,
      images,
      variants,
    } = req.body;

    const product = new Product({
      name,
      description,
      category,
      fabricType,
      price,
      wholesalePrice,
      moq,
      images,
      variants,
    });

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const created = await product.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
