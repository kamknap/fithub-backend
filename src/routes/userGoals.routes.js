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

router.get('/me', verifyToken, getCurrentUserGoals);
router.post('/me', verifyToken, createCurrentUserGoal);

router.get('/', verifyToken, listUserGoals);
router.post('/', verifyToken, createUserGoal);
router.get('/:id', verifyToken, getUserGoalById);
router.put('/:id', verifyToken, updateUserGoal);
router.delete('/:id', verifyToken, deleteUserGoal);

export default router;
