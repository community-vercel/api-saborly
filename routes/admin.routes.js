
// routes/admin.routes.js
import express from 'express';
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  addItem,
  getItems,
  getItemsByCategory,
  updateItem,
  deleteItem,
  getFeaturedItems,
  getPopularItems,
  addOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  getOfferItems,
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from '../controllers/admin.controller.js';
import { uploadFields } from '../middlewares/upload.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Categories
router.post('/categories', authenticateToken, uploadFields, addCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', authenticateToken, uploadFields, updateCategory);
router.delete('/categories/:id', authenticateToken, deleteCategory);

// Items
router.post('/items', authenticateToken, uploadFields, addItem);
router.get('/items', getItems);
router.get('/items/category/:categoryId', getItemsByCategory);
router.put('/items/:id', authenticateToken, uploadFields, updateItem);
router.delete('/items/:id', authenticateToken, deleteItem);

// Homepage specifics
router.get('/featured', getFeaturedItems);
router.get('/popular', getPopularItems);

// Offers
router.post('/offers', authenticateToken, uploadFields, addOffer);
router.get('/offers', getOffers);
router.get('/offers/:id', getOfferById);
router.put('/offers/:id', authenticateToken, uploadFields, updateOffer);
router.delete('/offers/:id', authenticateToken, deleteOffer);
router.get('/offers/:offerId/items', getOfferItems);

// Orders
router.post('/orders', createOrder);
router.get('/orders', authenticateToken, getOrders);
router.get('/orders/:id', authenticateToken, getOrderById);
router.put('/orders/:id', authenticateToken, updateOrder);
router.delete('/orders/:id', authenticateToken, deleteOrder);

export default router;
