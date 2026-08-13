const express = require('express');
const router = express.Router();

const sampleProducts = [
  {
    _id: 'p1',
    name: 'Embroidered Lawn Suit',
    category: 'Women',
    description: '3-piece unstitched lawn',
    fabricType: 'Lawn',
    price: 4500,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'M', color: 'Blue', stock: 20 }],
  },
  {
    _id: 'p2',
    name: 'Silk Chiffon Dupatta',
    category: 'Women',
    description: 'Lightweight chiffon dupatta',
    fabricType: 'Chiffon',
    price: 1200,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'One', color: 'Beige', stock: 50 }],
  },
  {
    _id: 'p3',
    name: 'Premium Cotton Kurta',
    category: 'Men',
    description: 'Breathable cotton kurta',
    fabricType: 'Cotton',
    price: 2200,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'L', color: 'White', stock: 30 }],
  },
  {
    _id: 'p4',
    name: 'Silk Hijab',
    category: 'Women',
    description: 'Premium silk hijab',
    fabricType: 'Silk',
    price: 1800,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'One', color: 'Black', stock: 100 }],
  },
  {
    _id: 'p5',
    name: 'Oud Attar',
    category: 'Fragrances',
    description: 'Concentrated oud attar',
    fabricType: '',
    price: 3800,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: '30ml', color: '', stock: 15 }],
  },
];

// GET /api/dev/products - return sample products with optional filters
router.get('/products', (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, search } = req.query;
    let results = sampleProducts.slice();

    if (category) {
      results = results.filter((p) => String(p.category).toLowerCase() === String(category).toLowerCase());
    }
    if (minPrice) {
      results = results.filter((p) => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice) {
      results = results.filter((p) => Number(p.price) <= Number(maxPrice));
    }
    if (color) {
      results = results.filter((p) => (p.variants || []).some((v) => String(v.color).toLowerCase() === String(color).toLowerCase()));
    }
    if (search) {
      const rx = new RegExp(search, 'i');
      results = results.filter((p) => rx.test(p.name));
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
