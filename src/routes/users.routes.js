import { Router } from 'express';
import { listUsers, createUser, getCurrentUser, updateCurrentUser } from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/users/me - dane zalogowanego użytkownika
router.get('/me', verifyToken, getCurrentUser);

// PUT /api/users/me - aktualizacja danych zalogowanego użytkownika
router.put('/me', verifyToken, updateCurrentUser);

// Lista użytkowników - wymaga autentykacji (np. dla adminów)
router.get('/', verifyToken, listUsers);

// Utworzenie użytkownika - wymaga autentykacji (podczas rejestracji)
router.post('/', verifyToken, createUser);

export default router;