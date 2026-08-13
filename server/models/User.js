const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'wholesale', 'admin'],
      default: 'customer',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        label: { type: String },
        street: { type: String },
        city: { type: String },
        phone: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving, only when modified
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
