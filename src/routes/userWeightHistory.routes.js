import { Router } from 'express';
import { 
  getCurrentUserWeightHistory,
  createCurrentUserWeightMeasurement, 
  createWeightMeasurement 
} from '../controllers/userWeightHistory.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Endpointy dla zalogowanego użytkownika (pattern /me)
// GET /api/user-weight-history/me - historia wagi zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUserWeightHistory);
// POST /api/user-weight-history/me - dodaj pomiar wagi dla zalogowanego użytkownika
router.post('/me', verifyToken, createCurrentUserWeightMeasurement);

// POST /api/user-weight-history - utworzenie pomiaru wagi (dla admina)
router.post('/', verifyToken, createWeightMeasurement);

export default router;
