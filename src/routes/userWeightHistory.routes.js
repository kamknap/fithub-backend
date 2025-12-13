import { Router } from 'express';
import { 
  getUserWeightHistory, 
  createWeightMeasurement 
} from '../controllers/userWeightHistory.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { autoResolveUserId } from '../middleware/userIdResolver.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji + auto-resolve userId
router.get('/:userId', verifyToken, autoResolveUserId, getUserWeightHistory);
router.post('/', verifyToken, createWeightMeasurement);

export default router;
