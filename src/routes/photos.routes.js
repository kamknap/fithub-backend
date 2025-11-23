import { Router } from 'express';
import { 
  listPhotos, 
  getPhotoById, 
  createPhoto, 
  updatePhoto, 
  deletePhoto 
} from '../controllers/photos.controller.js';

const router = Router();

router.get('/', listPhotos);
router.get('/:id', getPhotoById);
router.post('/', createPhoto);
router.put('/:id', updatePhoto);
router.delete('/:id', deletePhoto);

export default router;
