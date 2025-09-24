
// routes/auth.routes.js
import express from 'express';
import { signup, login, verifyEmail, forgotPassword, resetPassword } from '../controllers/userauth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
