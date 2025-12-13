import { Router } from 'express';
import { 
  getCurrentUserWeightHistory, 
  createWeightMeasurement 
} from '../controllers/userWeightHistory.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/user-weight-history/me - historia wagi zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUserWeightHistory);

// POST /api/user-weight-history - utworzenie pomiaru wagi
router.post('/', verifyToken, createWeightMeasurement);

export default router;
