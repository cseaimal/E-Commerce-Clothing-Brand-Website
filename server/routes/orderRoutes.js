const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// In-memory array fallback for testing when MongoDB is not connected
const inMemoryOrders = [];

// @route   POST /
// @desc    Create a new order for req.user
// @access  Protected
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      return res.status(400).json({ message: 'Shipping address (street, city, phone) is required' });
    }

    // Security: Recalculate total server-side from actual product/item prices
    let calculatedTotal = 0;
    const mongoose = require('mongoose');

    for (let item of items) {
      let itemPrice = Number(item.price) || 0;
      if (mongoose.connection.readyState === 1 && mongoose.models.Product && item.product) {
        try {
          const dbProduct = await mongoose.models.Product.findById(item.product);
          if (dbProduct && typeof dbProduct.price === 'number') {
            itemPrice = dbProduct.price;
          }
        } catch (e) {}
      }
      const qty = Number(item.qty) || 1;
      calculatedTotal += itemPrice * qty;
    }

    const total = calculatedTotal;
    const userId = req.user._id || req.user.id;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const order = new Order({
        user: userId,
        items,
        shippingAddress,
        paymentMethod: paymentMethod || 'COD',
        total,
        status: 'pending',
      });
      const createdOrder = await order.save();
      return res.status(201).json(createdOrder);
    } else {
      // In-memory fallback response when running without MongoDB instance
      const newOrder = {
        _id: new mongoose.Types.ObjectId(),
        user: userId,
        items,
        shippingAddress,
        paymentMethod: paymentMethod || 'COD',
        total,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryOrders.push(newOrder);
      return res.status(201).json(newOrder);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// @route   GET /my
// @desc    Get logged in user orders
// @access  Protected
router.get('/my', protect, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = String(req.user._id || req.user.id);

    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const userOrders = inMemoryOrders
        .filter((o) => String(o.user) === userId)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return res.json(userOrders);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
});

// @route   GET /
// @desc    Get all orders
// @access  Admin Only
router.get('/', protect, admin, async (req, res) => {
  try {
    const mongoose = require('mongoose');

    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      return res.json(inMemoryOrders);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
});

// @route   PUT /:id/status
// @desc    Update order status
// @access  Admin Only
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) {
      const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
      }
      order.status = status;
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// @route   GET /:id
// @desc    Get single order details by ID
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = String(req.user._id || req.user.id);
    const orderId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(order);
    } else {
      const order = inMemoryOrders.find((o) => String(o._id) === String(orderId));
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(order);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order details', error: error.message });
  }
});

module.exports = router;
