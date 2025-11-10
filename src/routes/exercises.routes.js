import { Router } from 'express';
import { 
  listExercises, 
  getExerciseById, 
  createExercise, 
  updateExercise, 
  deleteExercise 
} from '../controllers/exercises.controller.js';

const router = Router();

router.get('/', listExercises);           // GET /api/exercises lub /api/exercises?name=pompki
router.get('/:id', getExerciseById);      // GET /api/exercises/:id
router.post('/', createExercise);         // POST /api/exercises
router.put('/:id', updateExercise);       // PUT /api/exercises/:id
router.delete('/:id', deleteExercise);    // DELETE /api/exercises/:id

export default router;
