
// models/admin.setting.model.js
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  openingHours: {
    type: String,
    required: true,
  },
  paymentGateway: {
    type: {
      type: String,
      enum: ['stripe', 'paypal', 'none'],
      default: 'none',
    },
    apiKey: String,
    secretKey: String,
  },
}, { timestamps: true });

settingSchema.index({ restaurantName: 1 }, { unique: true });

export default mongoose.model('Setting', settingSchema);