
// models/order.model.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: false },
    size: { type: String },
    temperature: { type: String },
    addons: [{ name: String, price: Number }],
    specialInstructions: { type: String, default: '' },
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accept', 'preparing', 'prepared', 'out for delivery', 'delivered', 'returned'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid',
  },  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryType: { type: String,
     enum: ['delivery', 'takeaway'], 
     required: false }, 
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
