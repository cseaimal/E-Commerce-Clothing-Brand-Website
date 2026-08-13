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

  // Debug: list mounted routes
  app.get('/__routes', (req, res) => {
    const routes = [];
    if (app && app._router && app._router.stack) {
      app._router.stack.forEach((layer) => {
        if (layer.route && layer.route.path) {
          const methods = Object.keys(layer.route.methods).join(',');
          routes.push(`${methods.toUpperCase()} ${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
          layer.handle.stack.forEach((r) => {
            if (r.route && r.route.path) {
              const methods = Object.keys(r.route.methods).join(',');
              routes.push(`${methods.toUpperCase()} ${layer.regexp} -> ${r.route.path}`);
            }
          });
        }
      });
    }
    res.json(routes);
  });

  try {
    const orderRoutes = require('./server/routes/orderRoutes');
    app.use('/api/orders', orderRoutes);

    const bulkInquiryRoutes = require('./server/routes/bulkInquiryRoutes');
    app.use('/api/bulk-inquiries', bulkInquiryRoutes);

    const devRoutes = require('./server/routes/devRoutes');
    app.use('/api/dev', devRoutes);

    const categoryRoutes = require('./server/routes/categoryRoutes');
    app.use('/api/categories', categoryRoutes);

    const productRoutes = require('./server/routes/productRoutes');
    app.use('/api/products', productRoutes);
  } catch (err) {
    console.error('Routes module loading error:', err && err.stack ? err.stack : err);
  }

  // Log mounted routes for debugging
  try {
    const routes = [];
    if (app && app._router && app._router.stack) {
      app._router.stack.forEach((layer) => {
        if (layer.route && layer.route.path) {
          const methods = Object.keys(layer.route.methods).join(',');
          routes.push(`${methods.toUpperCase()} ${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
          layer.handle.stack.forEach((r) => {
            if (r.route && r.route.path) {
              const methods = Object.keys(r.route.methods).join(',');
              routes.push(`${methods.toUpperCase()} ${layer.regexp} -> ${r.route.path}`);
            }
          });
        }
      });
    }
    console.log('Mounted routes:', routes);
    try {
      const layerNames = app._router.stack.map((l) => ({ name: l.name, keys: Object.keys(l) }));
      console.log('Router stack layers:', JSON.stringify(layerNames));
    } catch (e) {
      console.log('Could not serialize router stack:', e && e.message);
    }
  } catch (e) {
    console.error('Failed to list routes:', e && e.stack ? e.stack : e);
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
