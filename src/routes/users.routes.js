import { Router } from 'express';
import { listUsers, createUser, getUserById, getUserByFirebaseUid, updateUser } from '../controllers/users.controller.js';
import { verifyToken, checkResourceOwnership } from '../middleware/auth.middleware.js';

const router = Router();

// Lista użytkowników - wymaga autentykacji (np. dla adminów)
router.get('/', verifyToken, listUsers);

// WAŻNE: Bardziej specyficzne trasy MUSZĄ być przed ogólnymi!
// Pobranie użytkownika po Firebase UID - wymaga autentykacji
// checkResourceOwnership sprawdza czy zalogowany użytkownik = żądany użytkownik
router.get('/firebase/:firebaseUid', verifyToken, checkResourceOwnership, getUserByFirebaseUid);

// Pobranie użytkownika po MongoDB ID - wymaga autentykacji
// UWAGA: Ta trasa musi być na końcu, bo łapie wszystko co pasuje do /:id
router.get('/:id', verifyToken, getUserById);

// Utworzenie użytkownika - wymaga autentykacji (podczas rejestracji)
router.post('/', verifyToken, createUser);

// Aktualizacja użytkownika - wymaga autentykacji i własności zasobu
router.put('/:id', verifyToken, updateUser);

export default router;