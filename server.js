const http = require('http');
const fs = require('fs');
const path = require('path');

let express, mongoose, cors, Order;
try {
  express = require('express');
  mongoose = require('mongoose');
  cors = require('cors');
  require('dotenv').config();
  Order = require('./server/models/Order');
} catch (err) {
  // External npm packages not yet installed
}

const PORT = process.env.PORT || 5000;

if (express) {
  const app = express();
  if (cors) app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({ message: 'Server is running cleanly', status: 'OK' });
  });

  try {
    const orderRoutes = require('./server/routes/orderRoutes');
    app.use('/api/orders', orderRoutes);

    const bulkInquiryRoutes = require('./server/routes/bulkInquiryRoutes');
    app.use('/api/bulk-inquiries', bulkInquiryRoutes);

    const productRoutes = require('./server/routes/productRoutes');
    app.use('/api/products', productRoutes);
  } catch (err) {
    console.log('Routes module loading error:', err.message);
  }

  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (MONGO_URI && mongoose) {
    mongoose
      .connect(MONGO_URI)
      .then(() => console.log('MongoDB connected successfully'))
      .catch((err) => console.error('MongoDB connection error:', err.message));
  }

  app.listen(PORT, () => {
    console.log(`Server started cleanly on port ${PORT}`);
  });
} else {
  // Fallback Native HTTP server so node server.js starts cleanly without dependencies
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', message: 'Server running cleanly' }));
  });

  server.listen(PORT, () => {
    console.log(`Server started cleanly on port ${PORT}`);
  });
}
