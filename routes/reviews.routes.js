import express from 'express';
import { 
  addReview, 
  getAllReviews, 
  getItemReviews, 
  getPublicReviews 
} from '../controllers/reviews.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Reviews routes
router.post('/items/:itemId/reviews', authenticateToken, addReview);
router.get('/admin/reviews', authenticateToken, getAllReviews); 
router.get('/public/reviews', getPublicReviews); 
router.get('/items/:itemId/reviews', getItemReviews);

export default router;