const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const defaultSampleProducts = [
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a1',
    name: 'Royal Velvet Embroidered Abaya',
    price: 4500,
    category: 'Abayas',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80',
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a2',
    name: 'Silk Chiffon Premium Hijab',
    price: 1200,
    category: 'Hijabs',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',
  },
  {
    _id: '64f1a2b3c4d5e6f7a8b9c0a3',
    name: 'Arabian Royal Amber Perfume Oud',
    price: 3800,
    category: 'Fragrances',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=500&q=80',
  },
];

// @route   GET /
// @desc    Get all products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({});
      if (products.length > 0) {
        return res.json(products);
      }
    }
    return res.json(defaultSampleProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

module.exports = router;
