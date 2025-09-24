// controllers/auth.controller.js
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import transporter from '../config/email.config.js';
import { emailTemplates } from '../config/email-templates.js';
import Item from '../models/item.model.js';
import Order from '../models/order.model.js';
import Offer from '../models/offer.model.js';
import Category from '../models/category.model.js';

import { put, del } from '@vercel/blob';


const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationEmail = async (user, code, templateType) => {
  const template = emailTemplates[templateType];
  const emailContent = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    text: template.text.replace('{{firstName}}', user.firstName).replace('{{lastName}}', user.lastName).replace('{{code}}', code),
    html: template.html.replace('{{firstName}}', user.firstName).replace('{{lastName}}', user.lastName).replace('{{code}}', code),
  };

  await transporter.sendMail(emailContent);
};

// Signup
export const signup = async (req, res) => {
  try {
    const { phoneNo, email, firstName, lastName, password } = req.body;

    if (!phoneNo || !email || !firstName || !lastName || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ phoneNo }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number or email already registered' });
    }

    const user = new User({
      phoneNo,
      email,
      firstName,
      lastName,
      password,
    });

    const verificationCode = generateVerificationCode();
    user.emailVerificationCode = verificationCode;
    await user.save();

    await sendVerificationEmail(user, verificationCode, 'signup');

    res.status(201).json({ message: 'User registered. Please verify your email with the code sent.', user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerificationCode !== code || user.isVerified) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.emailVerificationCode = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });

    res.json({ message: 'Email verified successfully', token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetCode = generateVerificationCode();
    user.resetPasswordCode = resetCode;
    await user.save();

    await sendVerificationEmail(user, resetCode, 'forgotPassword');

    res.json({ message: 'Password reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetPasswordCode = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });

    res.json({ message: 'Login successful', token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -emailVerificationCode -resetPasswordCode');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNo } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle email update
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      user.email = email;
    }

    // Handle phone number update
    if (phoneNo && phoneNo !== user.phoneNo) {
      const existingUser = await User.findOne({ phoneNo });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
      user.phoneNo = phoneNo;
    }

    // Update first name and last name
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    // Handle profile image upload
    if (req.files?.profileImage?.[0]) {
      const file = req.files.profileImage[0];
      const blobFile = new File([file.buffer], file.originalname, { type: file.mimetype });

      // Delete old image if it exists
      if (user.profileImage) {
        await del(user.profileImage);
      }

      // Upload new image
      const blob = await put(`profiles/${Date.now()}-${file.originalname}`, blobFile, {
        access: 'public',
      });
      user.profileImage = blob.url;
    }

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNo: user.phoneNo,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Create New Address
export const createAddress = async (req, res) => {
  try {
    const { label, address } = req.body;
    
    // Validation
    if (!label || !address) {
      return res.status(400).json({ message: 'Label and address are required' });
    }
    
    if (!['home', 'office', 'others'].includes(label)) {
      return res.status(400).json({ message: 'Invalid address label. Must be home, office, or others' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if address with this label already exists
    const existingAddress = user.addresses.find(a => a.label === label);
    if (existingAddress) {
      return res.status(400).json({ 
        message: 'Address with this label already exists. Use update instead.' 
      });
    }

    // Add new address
    user.addresses.push({ label, address });
    await user.save();

    res.status(201).json({ 
      message: 'Address created successfully', 
      addresses: user.addresses 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get All Addresses
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Address
export const updateAddress = async (req, res) => {
  try {
    const { label, address } = req.body;
    if (!label || !address) {
      return res.status(400).json({ message: 'Label and address are required' });
    }
    if (!['home', 'office', 'others'].includes(label)) {
      return res.status(400).json({ message: 'Invalid address label' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const existingAddress = user.addresses.find(a => a.label === label);
    if (!existingAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }
    existingAddress.address = address;
    await user.save();
    res.json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { label } = req.body;
    if (!label) {
      return res.status(400).json({ message: 'Label is required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(a => a.label !== label);
    if (user.addresses.length === initialLength) {
      return res.status(404).json({ message: 'Address not found' });
    }
    await user.save();
    res.json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Language
export const changeLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ message: 'Language is required' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.language = language;
    await user.save();
    res.json({ message: 'Language updated successfully', language: user.language });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Orders
// Get Orders
export const getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ orders: user.orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Order Details
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user = await User.findById(req.user.id).select('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const order = user.orders.find(o => o.orderId === orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    req.logout();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query, categoryId, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Escape regex for safety
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexQuery = new RegExp(escapedQuery, 'i'); // Case-insensitive partial match

    // Search for exact matches first (full match)
    const exactItems = await Item.find({
      $or: [
        { name: { $eq: query } },
        { description: { $eq: query } },
      ],
      ...(categoryId && { category: categoryId }),
    })
    .populate('category', 'name')
    .sort({ sellCount: -1 });

    // Search for partial matches
    const partialItems = await Item.find({
      $or: [
        { name: regexQuery },
        { description: regexQuery },
      ],
      ...(categoryId && { category: categoryId }),
      _id: { $nin: exactItems.map(item => item._id) }, // Exclude exact matches
    })
    .populate('category', 'name')
    .sort({ sellCount: -1 })
    .limit(parseInt(limit) - exactItems.length); // Adjust limit based on exact matches

    // Combine exact and partial matches
    const items = [...exactItems, ...partialItems].slice(0, parseInt(limit));

    // Search for categories (both exact and partial)
    const categories = await Category.find({
      name: regexQuery,
    }).limit(5);

    res.json({
      items,
      categories,
      totalResults: items.length + categories.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};