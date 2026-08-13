const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
