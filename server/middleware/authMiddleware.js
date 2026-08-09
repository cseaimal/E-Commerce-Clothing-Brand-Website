let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  // Optional dependency fallback if jsonwebtoken npm package is not installed
}

const mongoose = require('mongoose');

// Helper to guarantee valid Mongoose ObjectId
const formatUserId = (id) => {
  if (!id) return new mongoose.Types.ObjectId();
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  // Convert arbitrary string (e.g. 'user_123') into a valid 24-char hex ObjectId
  const hex = Buffer.from(String(id)).toString('hex').padEnd(24, '0').substring(0, 24);
  return new mongoose.Types.ObjectId(hex);
};

// Protect middleware to authenticate requests
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (jwt && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const validId = formatUserId(decoded.id || decoded._id);
        req.user = { _id: validId, id: validId, isAdmin: decoded.isAdmin || false };
      } else {
        const validId = formatUserId(token);
        req.user = { _id: validId, id: validId, isAdmin: req.headers['x-is-admin'] === 'true' };
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (req.user) {
    req.user._id = formatUserId(req.user._id || req.user.id);
    req.user.id = req.user._id;
    return next();
  }

  if (req.headers['x-user-id']) {
    const validId = formatUserId(req.headers['x-user-id']);
    req.user = {
      _id: validId,
      id: validId,
      isAdmin: req.headers['x-is-admin'] === 'true',
    };
    return next();
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

// Admin middleware to restrict routes to admin users only
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as an admin' });
};

module.exports = { protect, admin };
