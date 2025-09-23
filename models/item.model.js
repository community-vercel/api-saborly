// models/item.model.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  sizes: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
  }],
  addons: [{
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isDeal: {
    type: Boolean,
    default: false,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);