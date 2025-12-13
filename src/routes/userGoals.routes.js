import { Router } from 'express';
import { 
  listUserGoals, 
  createUserGoal, 
  getUserGoalsByUserId,
  getUserGoalById,
  updateUserGoal,
  deleteUserGoal
} from '../controllers/userGoals.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { autoResolveUserId } from '../middleware/userIdResolver.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, listUserGoals);
router.post('/', verifyToken, createUserGoal);
router.get('/user/:userId', verifyToken, autoResolveUserId, getUserGoalsByUserId);
router.get('/:id', verifyToken, getUserGoalById);
router.put('/:id', verifyToken, updateUserGoal);
router.delete('/:id', verifyToken, deleteUserGoal);

export default router;
