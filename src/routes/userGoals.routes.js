import { Router } from 'express';
import { 
  listUserGoals, 
  createUserGoal, 
  getCurrentUserGoals,
  getUserGoalById,
  updateUserGoal,
  deleteUserGoal
} from '../controllers/userGoals.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/user-goals/me - cele zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUserGoals);

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, listUserGoals);
router.post('/', verifyToken, createUserGoal);
router.get('/:id', verifyToken, getUserGoalById);
router.put('/:id', verifyToken, updateUserGoal);
router.delete('/:id', verifyToken, deleteUserGoal);

export default router;
