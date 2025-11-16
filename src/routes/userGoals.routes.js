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

router.get('/', listUserGoals);                        // GET /api/user-goals
router.post('/', createUserGoal);                      // POST /api/user-goals
router.get('/user/:userId', getUserGoalsByUserId);     // GET /api/user-goals/user/:userId
router.get('/:id', getUserGoalById);                   // GET /api/user-goals/:id
router.put('/:id', updateUserGoal);                    // PUT /api/user-goals/:id
router.delete('/:id', deleteUserGoal);                 // DELETE /api/user-goals/:id

export default router;
