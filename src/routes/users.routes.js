import { Router } from 'express';
import { listUsers, createUser, getUserById, getUserByFirebaseUid, updateUser } from '../controllers/users.controller.js';

const router = Router();

router.get('/', listUsers);
router.get('/firebase/:firebaseUid', getUserByFirebaseUid);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);

export default router;