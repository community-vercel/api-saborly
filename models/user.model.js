
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['home', 'office', 'others'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    image: String,
    addons: [String],
  }],
  total: Number,
  subTotal: Number,
  discount: Number,
  deliveryCharge: Number,
  status: {
    type: String,
    enum: ['pending', 'accept', 'preparing', 'prepared', 'out for delivery', 'delivered', 'returned'],
    default: 'pending',
  },
  time: { type: Date, default: Date.now },
  deliveryTime: Date,
  paymentInfo: {
    method: String,
    amount: Number,
    status: String,
  },
});

const userSchema = new mongoose.Schema({
  phoneNo: {
    type: String,
    required: true,
    unique: true,
    match: [/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  emailVerificationCode: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordCode: {
    type: String,
    default: null,
  },
  addresses: [addressSchema],
  language: {
    type: String,
    default: 'en', // e.g., 'en', 'es', 'fr'
  },
  orders: [orderSchema],
  profileImage: {
    type: String,
    default: null,
  },
  emailVerificationCode: String,
  emailVerificationCodeExpires: Date, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);