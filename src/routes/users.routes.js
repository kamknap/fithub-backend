import { Router } from 'express';
import { listUsers, createUser, getUserById, updateUser } from '../controllers/users.controller.js';

const router = Router();

router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);

export default router;