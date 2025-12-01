import { Router } from 'express';
import { 
  listExercises, 
  getExerciseById, 
  createExercise, 
  updateExercise, 
  deleteExercise 
} from '../controllers/exercises.controller.js';

const router = Router();

router.get('/', listExercises);
router.get('/:id', getExerciseById);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

export default router;
