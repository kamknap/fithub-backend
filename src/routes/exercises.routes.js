import { Router } from 'express';
import { 
  listExercises, 
  getExerciseById, 
  createExercise, 
  updateExercise, 
  deleteExercise 
} from '../controllers/exercises.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, listExercises);
router.get('/:id', verifyToken, getExerciseById);
router.post('/', verifyToken, createExercise);
router.put('/:id', verifyToken, updateExercise);
router.delete('/:id', verifyToken, deleteExercise);

export default router;
