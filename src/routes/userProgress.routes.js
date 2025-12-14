import { Router } from 'express';
import { 
  getCurrentUserProgress,
  createCurrentUserProgress, 
  createUserProgress, 
  updateCurrentUserProgress, 
  deleteCurrentUserProgress 
} from '../controllers/userProgress.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', verifyToken, getCurrentUserProgress);
router.post('/me', verifyToken, createCurrentUserProgress);
router.put('/me', verifyToken, updateCurrentUserProgress);
router.delete('/me', verifyToken, deleteCurrentUserProgress);

router.post('/', verifyToken, createUserProgress);

export default router;
