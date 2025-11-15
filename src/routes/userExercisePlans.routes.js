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

// Operacje na planach
router.get('/', getUserExercisePlans);                     // GET /api/user-exercise-plans?user_id=xxx
router.get('/:id', getUserExercisePlanById);               // GET /api/user-exercise-plans/:id
router.post('/', createUserExercisePlan);                  // POST /api/user-exercise-plans
router.put('/:id', updateUserExercisePlan);                // PUT /api/user-exercise-plans/:id
router.delete('/:id', deleteUserExercisePlan);             // DELETE /api/user-exercise-plans/:id

// Operacje na ćwiczeniach w planie
router.post('/:id/exercises', addExerciseToPlan);          // POST /api/user-exercise-plans/:id/exercises
router.delete('/:id/exercises/:exercise_id', removeExerciseFromPlan);  // DELETE /api/user-exercise-plans/:id/exercises/:exercise_id

export default router;
