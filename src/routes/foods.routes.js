import { Router } from 'express';
import { 
  listFoods, 
  getFoodById, 
  createFood, 
  updateFood, 
  deleteFood, 
  getFoodByBarcode 
} from '../controllers/foods.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', verifyToken, listFoods);
router.get('/barcode/:barcode', verifyToken, getFoodByBarcode);
router.get('/:id', verifyToken, getFoodById);
router.post('/', verifyToken, createFood);
router.put('/:id', verifyToken, updateFood);
router.delete('/:id', verifyToken, deleteFood);

export default router;