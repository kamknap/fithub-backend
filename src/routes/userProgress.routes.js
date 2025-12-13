import { Router } from 'express';
import { 
  getUserProgress, 
  createUserProgress, 
  updateUserProgress, 
  deleteUserProgress 
} from '../controllers/userProgress.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { autoResolveUserId } from '../middleware/userIdResolver.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji + auto-resolve userId
router.get('/:userId', verifyToken, autoResolveUserId, getUserProgress);
router.post('/', verifyToken, createUserProgress);
router.put('/:userId', verifyToken, autoResolveUserId, updateUserProgress);
router.delete('/:userId', verifyToken, autoResolveUserId, deleteUserProgress);

export default router;
