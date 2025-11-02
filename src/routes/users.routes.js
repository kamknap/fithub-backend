import { Router } from 'express';
import { listUsers, createUser, getUserById } from '../controllers/users.controller.js';

const router = Router();

router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;