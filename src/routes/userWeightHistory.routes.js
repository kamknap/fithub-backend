import { Router } from 'express';
import { 
  getCurrentUserWeightHistory,
  createCurrentUserWeightMeasurement, 
  createWeightMeasurement 
} from '../controllers/userWeightHistory.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();


router.get('/me', verifyToken, getCurrentUserWeightHistory);
router.post('/me', verifyToken, createCurrentUserWeightMeasurement);

router.post('/', verifyToken, createWeightMeasurement);

export default router;
