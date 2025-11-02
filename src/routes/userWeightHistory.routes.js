import { Router } from 'express';
import { 
  getUserWeightHistory, 
  createWeightMeasurement 
} from '../controllers/userWeightHistory.controller.js';

const router = Router();

router.get('/:userId', getUserWeightHistory);
router.post('/', createWeightMeasurement);

export default router;
