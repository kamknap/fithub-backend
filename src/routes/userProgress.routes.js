import { Router } from 'express';
import { 
  getUserProgress, 
  createUserProgress, 
  updateUserProgress, 
  deleteUserProgress 
} from '../controllers/userProgress.controller.js';

const router = Router();

router.get('/:userId', getUserProgress);
router.post('/', createUserProgress);
router.put('/:userId', updateUserProgress);
router.delete('/:userId', deleteUserProgress);

export default router;
