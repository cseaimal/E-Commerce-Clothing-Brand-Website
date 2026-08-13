const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware - verifies Bearer token and attaches user to req.user
async function protect(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const token = auth.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'dev_secret';
  let payload;
  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }

  if (!payload || !payload.id) return res.status(401).json({ message: 'Not authorized' });

  try {
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authorized' });
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
}

// isAdmin middleware - requires req.user.role === 'admin'
function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  return next();
}

// isWholesale middleware - allows wholesale or admin
function isWholesale(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (req.user.role === 'wholesale' || req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden: wholesale access required' });
}

module.exports = {
  protect,
  isAdmin,
  isWholesale,
  // compatibility alias used elsewhere in the codebase
  admin: isAdmin,
};
