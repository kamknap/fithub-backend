import { Router } from 'express';
import { listUsers, createUser, getCurrentUser, updateCurrentUser } from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', verifyToken, getCurrentUser);

router.put('/me', verifyToken, updateCurrentUser);

router.get('/', verifyToken, listUsers);

router.post('/', verifyToken, createUser);

export default router;