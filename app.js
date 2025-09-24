// index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js'; 
import settingRoutes from './routes/admin.setting.routes.js';
import { connectDB } from './config/db.config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/auth', authRoutes);


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running',
    endpoints: {
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Export for Vercel serverless function
export default app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}