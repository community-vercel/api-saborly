
// controllers/auth.controller.js
import Admin from '../models/admin.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Signup controller (email and password only)
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ 
        message: 'Admin with this email already exists' 
      });
    }

    // Create new admin with just email and password
    const admin = new Admin({
      email,
      password
    });

    // Save admin to database
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '4h' }
    );

    // Return success response
    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        createdAt: admin.createdAt
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: Object.values(err.errors).map(error => error.message).join(', ') 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating admin account',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: '4h',
    });

    res.json({
        message: 'Login successful',
        admin: { id: admin._id, email: admin.email },
         token
         });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
