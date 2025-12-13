import { Router } from 'express';
import { listChallenges, getChallengeById } from '../controllers/challenges.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, listChallenges);
router.get('/:id', verifyToken, getChallengeById);

export default router;
