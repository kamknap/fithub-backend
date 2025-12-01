import { Router } from 'express';
import { 
  getUserExercisePlans, 
  getUserExercisePlanById,
  createUserExercisePlan, 
  updateUserExercisePlan,
  deleteUserExercisePlan,
  addExerciseToPlan,
  removeExerciseFromPlan
} from '../controllers/userExercisePlans.controller.js';

const router = Router();

router.get('/', getUserExercisePlans);
router.get('/:id', getUserExercisePlanById);
router.post('/', createUserExercisePlan);
router.put('/:id', updateUserExercisePlan);
router.delete('/:id', deleteUserExercisePlan);

router.post('/:id/exercises', addExerciseToPlan);
router.delete('/:id/exercises/:exercise_id', removeExerciseFromPlan);

export default router;
