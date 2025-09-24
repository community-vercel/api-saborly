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
    name: { type: String, required: false },
    price: { type: Number, required: false },
  }],
  temperatures: [{
    name: { type: String, required: false }, // e.g., Rare, Medium, Well
    price: { type: Number, required: false },
  }],
  addons: [{
    name: { type: String, required: false },
    image: { type: String },
    price: { type: Number, required: false },
    imageName: String,
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isDeal: {
    type: Boolean,
    default: false,
  },
 sellCount: {  
    type: Number,
    default: 0,
  },
  type: { type: String,
     enum: ['veg', 'non-veg'],
      required: false }, 
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);