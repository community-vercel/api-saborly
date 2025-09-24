
// models/slider.model.js
import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model('Slider', sliderSchema);