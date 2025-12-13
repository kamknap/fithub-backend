import { Router } from 'express';
import { 
  getCurrentUserProgress,
  createCurrentUserProgress, 
  createUserProgress, 
  updateCurrentUserProgress, 
  deleteCurrentUserProgress 
} from '../controllers/userProgress.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Endpointy dla zalogowanego użytkownika (pattern /me)
// GET /api/user-progress/me - postęp zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUserProgress);
// POST /api/user-progress/me - utworzenie postępu dla zalogowanego użytkownika
router.post('/me', verifyToken, createCurrentUserProgress);
// PUT /api/user-progress/me - aktualizacja postępu zalogowanego użytkownika
router.put('/me', verifyToken, updateCurrentUserProgress);
// DELETE /api/user-progress/me - usunięcie postępu zalogowanego użytkownika
router.delete('/me', verifyToken, deleteCurrentUserProgress);

// POST /api/user-progress - utworzenie postępu (dla admina)
router.post('/', verifyToken, createUserProgress);

export default router;
