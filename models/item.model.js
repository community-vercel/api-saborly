// models/item.model.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    trim: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  // ✅ ADD REVIEWS ARRAY HERE
  reviews: [reviewSchema],
  
  // Calculate average rating automatically
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  
  sizes: [{
    name: { 
      type: String, 
      required: false,
      trim: true,
    },
    price: { 
      type: Number, 
      required: false,
      min: 0,
    },
  }],
  
  temperatures: [{
    name: { 
      type: String, 
      required: false,
      trim: true,
    },
    price: { 
      type: Number, 
      required: false,
      min: 0,
    },
  }],
  
  addons: [{
    name: { 
      type: String, 
      required: false,
      trim: true,
    },
    image: { 
      type: String 
    },
    price: { 
      type: Number, 
      required: false,
      min: 0,
    },
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
    min: 0,
  },
  
  type: { 
    type: String,
    enum: ['veg', 'non-veg'],
    required: false,
  },
  
}, { 
  timestamps: true 
});

// ✅ AUTO-CALCULATE AVERAGE RATING WHEN REVIEWS CHANGE
itemSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = (totalRating / this.reviews.length).toFixed(1);
  this.reviewCount = this.reviews.length;
};

// ✅ UPDATE AVERAGE RATING BEFORE SAVING
itemSchema.pre('save', function(next) {
  this.calculateAverageRating();
  next();
});

export default mongoose.model('Item', itemSchema);