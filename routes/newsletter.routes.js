import express from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter
} from '../controllers/newsletter.controller.js';
import {
  getSubscribers,
  sendNewsletter,
  getNewsletterStats
} from '../controllers/admin.newsletter.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();
 


// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin routes (protected)
router.get('/admin/subscribers', authenticateToken, getSubscribers);
router.post('/admin/send', authenticateToken, sendNewsletter);
router.get('/admin/stats', authenticateToken, getNewsletterStats);

export default router;