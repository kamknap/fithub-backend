import { Router } from 'express';
import { listUserGoals, createUserGoal, getUserGoalsByUserId } from '../controllers/userGoals.controller.js';

const router = Router();

router.get('/', listUserGoals);
router.post('/', createUserGoal);
router.get('/user/:userId', getUserGoalsByUserId);

export default router;
