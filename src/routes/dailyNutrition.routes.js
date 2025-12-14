import { Router } from 'express';
import { 
  getCurrentUserDailyNutrition, 
  addMealForCurrentUser, 
  deleteMealForCurrentUser,
  deleteFoodFromMealForCurrentUser,
  deleteFoodByItemIdForCurrentUser,
  updateFoodQuantityForCurrentUser
} from '../controllers/dailyNutrition.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me/:date', verifyToken, getCurrentUserDailyNutrition);

router.post('/me/:date/meal', verifyToken, addMealForCurrentUser);

router.delete('/me/:date/meal/:mealIndex', verifyToken, deleteMealForCurrentUser);

router.delete('/me/:date/meal/:mealIndex/food/:foodIndex', verifyToken, deleteFoodFromMealForCurrentUser);

router.delete('/me/:date/food/:itemId', verifyToken, deleteFoodByItemIdForCurrentUser);

router.put('/me/:date/food/:itemId', verifyToken, updateFoodQuantityForCurrentUser);

export default router;