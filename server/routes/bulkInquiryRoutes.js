const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BulkInquiry = require('../models/BulkInquiry');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// In-memory store fallback for offline testing
const inMemoryInquiries = [];
const inMemoryUserRoles = {};

// @route   POST /
// @desc    Public endpoint to submit a bulk inquiry (no auth required)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { businessName, contactPerson, phone, city, requestedItems, userEmail } = req.body;

    if (!businessName || !contactPerson || !phone) {
      return res.status(400).json({ message: 'businessName, contactPerson, and phone are required' });
    }

    const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : undefined;

    if (mongoose.connection.readyState === 1) {
      const inquiry = new BulkInquiry({
        businessName,
        contactPerson,
        phone,
        city,
        requestedItems: requestedItems || [],
        userEmail: cleanEmail,
        status: 'pending',
      });
      const createdInquiry = await inquiry.save();
      return res.status(201).json(createdInquiry);
    } else {
      const newInquiry = {
        _id: new mongoose.Types.ObjectId(),
        businessName,
        contactPerson,
        phone,
        city,
        requestedItems: requestedItems || [],
        userEmail: cleanEmail,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryInquiries.push(newInquiry);
      return res.status(201).json(newInquiry);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bulk inquiry', error: error.message });
  }
});

// @route   GET /
// @desc    List all bulk inquiries
// @access  Admin Only
router.get('/', protect, admin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const inquiries = await BulkInquiry.find({})
        .populate('requestedItems.product', 'name price')
        .sort({ createdAt: -1 });
      return res.json(inquiries);
    } else {
      const sorted = [...inMemoryInquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(sorted);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bulk inquiries', error: error.message });
  }
});

// @route   PUT /:id/approve
// @desc    Approve bulk inquiry & update user role to 'wholesale' if user exists
// @access  Admin Only
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const inquiryId = req.params.id;
    let inquiry;
    let roleUpdated = false;

    if (mongoose.connection.readyState === 1) {
      inquiry = await BulkInquiry.findById(inquiryId);
      if (!inquiry) {
        return res.status(404).json({ message: 'Bulk inquiry not found' });
      }

      inquiry.status = 'approved';
      await inquiry.save();

      // If userEmail matches a registered User, update that User's role to 'wholesale'
      if (inquiry.userEmail) {
        const user = await User.findOne({ email: inquiry.userEmail.toLowerCase() });
        if (user) {
          user.role = 'wholesale';
          await user.save();
          roleUpdated = true;
        }
      }

      return res.json({
        message: 'Bulk inquiry approved successfully',
        roleUpdated,
        inquiry,
      });
    } else {
      inquiry = inMemoryInquiries.find((i) => String(i._id) === String(inquiryId));
      if (!inquiry) {
        return res.status(404).json({ message: 'Bulk inquiry not found' });
      }

      inquiry.status = 'approved';
      inquiry.updatedAt = new Date();

      if (inquiry.userEmail) {
        inMemoryUserRoles[inquiry.userEmail.toLowerCase()] = 'wholesale';
        roleUpdated = true;
      }

      return res.json({
        message: 'Bulk inquiry approved successfully',
        roleUpdated,
        inquiry,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve bulk inquiry', error: error.message });
  }
});

// @route   PUT /:id/reject
// @desc    Reject a bulk inquiry
// @access  Admin Only
router.put('/:id/reject', protect, admin, async (req, res) => {
  try {
    const inquiryId = req.params.id;
    let inquiry;

    if (mongoose.connection.readyState === 1) {
      inquiry = await BulkInquiry.findById(inquiryId);
      if (!inquiry) {
        return res.status(404).json({ message: 'Bulk inquiry not found' });
      }

      inquiry.status = 'rejected';
      await inquiry.save();
      return res.json({ message: 'Bulk inquiry rejected successfully', inquiry });
    } else {
      inquiry = inMemoryInquiries.find((i) => String(i._id) === String(inquiryId));
      if (!inquiry) {
        return res.status(404).json({ message: 'Bulk inquiry not found' });
      }

      inquiry.status = 'rejected';
      inquiry.updatedAt = new Date();
      return res.json({ message: 'Bulk inquiry rejected successfully', inquiry });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject bulk inquiry', error: error.message });
  }
});

module.exports = router;
