import { Router } from 'express';
import { listChallenges, getChallengeById } from '../controllers/challenges.controller.js';

const router = Router();

router.get('/', listChallenges);
router.get('/:id', getChallengeById);

export default router;
