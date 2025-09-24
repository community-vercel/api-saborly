
// controllers/auth.controller.js
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import transporter from '../config/email.config.js';
import { emailTemplates } from '../config/email-templates.js';

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
