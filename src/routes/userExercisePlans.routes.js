import { Router } from 'express';
import { 
  getCurrentUserExercisePlans,
  createCurrentUserExercisePlan,
  getUserExercisePlans, 
  getUserExercisePlanById,
  createUserExercisePlan, 
  updateUserExercisePlan,
  deleteUserExercisePlan,
  addExerciseToPlan,
  removeExerciseFromPlan
} from '../controllers/userExercisePlans.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', verifyToken, getCurrentUserExercisePlans);
router.post('/me', verifyToken, createCurrentUserExercisePlan);

router.get('/', verifyToken, getUserExercisePlans);
router.get('/:id', verifyToken, getUserExercisePlanById);
router.post('/', verifyToken, createUserExercisePlan);
router.put('/:id', verifyToken, updateUserExercisePlan);
router.delete('/:id', verifyToken, deleteUserExercisePlan);

router.post('/:id/exercises', verifyToken, addExerciseToPlan);
router.delete('/:id/exercises/:exercise_id', verifyToken, removeExerciseFromPlan);

export default router;
