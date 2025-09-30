import { Router } from 'express';
import { 
  getDailyNutrition, 
  addMeal, 
  deleteMeal 
} from '../controllers/dailyNutrition.controller.js';

const router = Router();

router.get('/:userId/:date', getDailyNutrition);
router.post('/:userId/:date/meal', addMeal);
router.delete('/:userId/:date/meal/:mealIndex', deleteMeal);

export default router;