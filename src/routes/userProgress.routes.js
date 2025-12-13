import { Router } from 'express';
import { 
  getCurrentUserProgress, 
  createUserProgress, 
  updateCurrentUserProgress, 
  deleteCurrentUserProgress 
} from '../controllers/userProgress.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/user-progress/me - postęp zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUserProgress);

// PUT /api/user-progress/me - aktualizacja postępu zalogowanego użytkownika
router.put('/me', verifyToken, updateCurrentUserProgress);

// DELETE /api/user-progress/me - usunięcie postępu zalogowanego użytkownika
router.delete('/me', verifyToken, deleteCurrentUserProgress);

// POST /api/user-progress - utworzenie postępu (może być dla dowolnego użytkownika - admin?)
router.post('/', verifyToken, createUserProgress);

export default router;
