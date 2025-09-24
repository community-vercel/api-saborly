
// routes/admin.setting.routes.js
import express from 'express';
import {
  createOrUpdateSetting,
  getSettings,
  updateSettings,
  deleteSettings,
} from '../controllers/admin.setting.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/settings', authenticateToken, createOrUpdateSetting);
router.get('/settings', getSettings);
router.put('/settings', authenticateToken, updateSettings);
router.delete('/settings', authenticateToken, deleteSettings);

export default router;