// routes/auth.routes.js
import express from 'express';
import { 
  signup, login, verifyEmail, forgotPassword, resetPassword, getProfile, updateProfile, 
  getAddresses, updateAddress, deleteAddress, changePassword, changeLanguage, getOrders, getOrderDetails,createAddress,searchItems
} from '../controllers/userauth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/addresses', authenticateToken, getAddresses);
router.post('/addresses', authenticateToken, createAddress);
router.put('/addresses', authenticateToken, updateAddress);
router.delete('/addresses', authenticateToken, deleteAddress);
router.put('/password', authenticateToken, changePassword);
router.put('/language', authenticateToken, changeLanguage);
router.get('/orders', authenticateToken, getOrders);
router.get('/orders/:orderId', authenticateToken, getOrderDetails);
router.get("/search",searchItems)

export default router;
