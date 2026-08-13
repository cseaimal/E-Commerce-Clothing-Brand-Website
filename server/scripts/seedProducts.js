const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const sampleProducts = [
  {
    name: 'Embroidered Lawn Suit',
    category: 'Women',
    description: '3-piece unstitched lawn',
    fabricType: 'Lawn',
    price: 4500,
    wholesalePrice: 3200,
    moq: 12,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'M', color: 'Blue', stock: 20 }],
  },
  {
    name: 'Silk Chiffon Dupatta',
    category: 'Women',
    description: 'Lightweight chiffon dupatta',
    fabricType: 'Chiffon',
    price: 1200,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'One', color: 'Beige', stock: 50 }],
  },
  {
    name: 'Premium Cotton Kurta',
    category: 'Men',
    description: 'Breathable cotton kurta',
    fabricType: 'Cotton',
    price: 2200,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'L', color: 'White', stock: 30 }],
  },
  {
    name: 'Silk Hijab',
    category: 'Women',
    description: 'Premium silk hijab',
    fabricType: 'Silk',
    price: 1800,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: 'One', color: 'Black', stock: 100 }],
  },
  {
    name: 'Oud Attar',
    category: 'Fragrances',
    description: 'Concentrated oud attar',
    fabricType: '',
    price: 3800,
    images: ['https://placehold.co/400x500'],
    variants: [{ size: '30ml', color: '', stock: 15 }],
  },
];

async function seed() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set. Set it in your .env and retry.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB. Seeding products...');

    const res = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${res.length} products.`);
  } catch (err) {
    console.error('Seeding failed:', err && err.message ? err.message : err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
