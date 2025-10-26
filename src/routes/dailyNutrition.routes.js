import { Router } from 'express';
import { 
  getDailyNutrition, 
  addMeal, 
  deleteMeal,
  deleteFoodFromMeal,
  deleteFoodByItemId,
  updateFoodQuantity
} from '../controllers/dailyNutrition.controller.js';

const router = Router();

router.get('/:userId/:date', getDailyNutrition);
router.post('/:userId/:date/meal', addMeal);
router.delete('/:userId/:date/meal/:mealIndex', deleteMeal);
router.delete('/:userId/:date/meal/:mealIndex/food/:foodIndex', deleteFoodFromMeal);
router.delete('/:userId/:date/food/:itemId', deleteFoodByItemId);
router.put('/:userId/:date/food/:itemId', updateFoodQuantity);


export default router;