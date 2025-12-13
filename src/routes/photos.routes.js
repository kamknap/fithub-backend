import { Router } from 'express';
import { 
  listPhotos, 
  getPhotoById, 
  createPhoto, 
  updatePhoto, 
  deletePhoto 
} from '../controllers/photos.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji
router.get('/', verifyToken, listPhotos);
router.get('/:id', verifyToken, getPhotoById);
router.post('/', verifyToken, createPhoto);
router.put('/:id', verifyToken, updatePhoto);
router.delete('/:id', verifyToken, deletePhoto);

export default router;
