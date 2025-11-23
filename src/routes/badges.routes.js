import { Router } from 'express';
import { listBadges, getBadgeById } from '../controllers/badges.controller.js';

const router = Router();

router.get('/', listBadges);
router.get('/:id', getBadgeById);

export default router;
