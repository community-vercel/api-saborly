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
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// Categories
router.post('/categories', upload.single('image'), addCategory);
router.get('/categories', getCategories);

// Items
router.post('/items', upload.single('image'), addItem);
router.get('/items', getItems);
router.get('/items/category/:categoryId', getItemsByCategory);
router.put('/items/:id', upload.single('image'), updateItem);
router.delete('/items/:id', deleteItem);

// Homepage specifics
router.get('/featured', getFeaturedItems);
router.get('/popular', getPopularItems);

// Offers
router.post('/offers', upload.single('image'), addOffer);
router.get('/offers', getOffers);
router.get('/offers/:offerId/items', getOfferItems);

// Orders
router.post('/orders', createOrder);

export default router;