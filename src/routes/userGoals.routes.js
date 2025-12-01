import { Router } from 'express';
import { 
  listUserGoals, 
  createUserGoal, 
  getUserGoalsByUserId,
  getUserGoalById,
  updateUserGoal,
  deleteUserGoal
} from '../controllers/userGoals.controller.js';

const router = Router();

router.get('/', listUserGoals);
router.post('/', createUserGoal);
router.get('/user/:userId', getUserGoalsByUserId);
router.get('/:id', getUserGoalById);
router.put('/:id', updateUserGoal);
router.delete('/:id', deleteUserGoal);

export default router;
