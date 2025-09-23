
// routes/admin.routes.js
import express from 'express';
import {
  addCategory,
  getCategories,
  addItem,
  getItems,
  getItemsByCategory,
  updateItem,
  deleteItem,
  getFeaturedItems,
  getPopularItems,
  createOrder,
  addOffer,
  getOffers,
  getOfferItems,
} from '../controllers/admin.controller.js';
import { uploadFields } from '../middlewares/upload.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// Categories
router.post('/categories', authenticateToken, uploadFields, addCategory);
router.get('/categories', getCategories); 

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
router.get('/offers/:offerId/items', getOfferItems);

// Orders
router.post('/orders', createOrder);

export default router;
