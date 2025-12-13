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

// Endpointy dla zalogowanego użytkownika (pattern /me)
// GET /api/user-exercise-plans/me - plany treningowe zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUserExercisePlans);
// POST /api/user-exercise-plans/me - utworzenie planu dla zalogowanego użytkownika
router.post('/me', verifyToken, createCurrentUserExercisePlan);

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, getUserExercisePlans);
router.get('/:id', verifyToken, getUserExercisePlanById);
router.post('/', verifyToken, createUserExercisePlan);
router.put('/:id', verifyToken, updateUserExercisePlan);
router.delete('/:id', verifyToken, deleteUserExercisePlan);

router.post('/:id/exercises', verifyToken, addExerciseToPlan);
router.delete('/:id/exercises/:exercise_id', verifyToken, removeExerciseFromPlan);

export default router;
