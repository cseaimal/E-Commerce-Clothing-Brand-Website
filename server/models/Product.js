const mongoose = require('mongoose');
const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    size: { type: String },
    color: { type: String },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    // allow either a plain string (category name) or an ObjectId reference
    category: { type: Schema.Types.Mixed },
    fabricType: { type: String },
    price: { type: Number, required: true },
    wholesalePrice: { type: Number },
    moq: { type: Number, default: 1 },
    images: [{ type: String }],
    variants: [variantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
