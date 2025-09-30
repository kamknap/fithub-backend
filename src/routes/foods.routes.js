import { Router } from 'express';
import { 
  listFoods, 
  getFoodById, 
  createFood, 
  updateFood, 
  deleteFood, 
  getFoodByBarcode 
} from '../controllers/foods.controller.js';

const router = Router();

router.get('/', listFoods);
router.get('/barcode/:barcode', getFoodByBarcode);
router.get('/:id', getFoodById);
router.post('/', createFood);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

export default router;