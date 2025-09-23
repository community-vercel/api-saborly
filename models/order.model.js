// models/order.model.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    size: {
      type: String, // e.g., "Small", "Regular", "Large"
    },
    temperature: {
      type: String, // e.g., Rare, Medium, Well
    },
    addons: [{
      name: String,
      price: Number,
    }],
    specialInstructions: {
      type: String, // For special instructions input
      default: '',
    },
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Order', orderSchema);