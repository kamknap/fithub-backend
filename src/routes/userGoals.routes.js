import { Router } from 'express';
import { 
  listUserGoals, 
  createUserGoal,
  createCurrentUserGoal, 
  getCurrentUserGoals,
  getUserGoalById,
  updateUserGoal,
  deleteUserGoal
} from '../controllers/userGoals.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Endpointy dla zalogowanego użytkownika (pattern /me)
// GET /api/user-goals/me - cele zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUserGoals);
// POST /api/user-goals/me - utworzenie celu dla zalogowanego użytkownika
router.post('/me', verifyToken, createCurrentUserGoal);

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, listUserGoals);
router.post('/', verifyToken, createUserGoal);
router.get('/:id', verifyToken, getUserGoalById);
router.put('/:id', verifyToken, updateUserGoal);
router.delete('/:id', verifyToken, deleteUserGoal);

export default router;
