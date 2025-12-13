import { Router } from 'express';
import { listBadges, getBadgeById } from '../controllers/badges.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, listBadges);
router.get('/:id', verifyToken, getBadgeById);

export default router;
