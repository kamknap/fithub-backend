import { Router } from 'express';
import { 
  getDailyNutrition, 
  addMeal, 
  deleteMeal,
  deleteFoodFromMeal
} from '../controllers/dailyNutrition.controller.js';

const router = Router();

router.get('/:userId/:date', getDailyNutrition);
router.post('/:userId/:date/meal', addMeal);
router.delete('/:userId/:date/meal/:mealIndex', deleteMeal);
router.delete('/:userId/:date/meal/:mealIndex/food/:foodIndex', deleteFoodFromMeal);

export default router;