import { Router } from 'express';
import { 
  getDailyNutrition, 
  addMeal, 
  deleteMeal,
  deleteFoodFromMeal,
  deleteFoodByItemId,
  updateFoodQuantity
} from '../controllers/dailyNutrition.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { autoResolveUserId } from '../middleware/userIdResolver.middleware.js';

const router = Router();

// Wszystkie endpointy wymagają autentykacji + auto-resolve userId
router.get('/:userId/:date', verifyToken, autoResolveUserId, getDailyNutrition);
router.post('/:userId/:date/meal', verifyToken, autoResolveUserId, addMeal);
router.delete('/:userId/:date/meal/:mealIndex', verifyToken, autoResolveUserId, deleteMeal);
router.delete('/:userId/:date/meal/:mealIndex/food/:foodIndex', verifyToken, autoResolveUserId, deleteFoodFromMeal);
router.delete('/:userId/:date/food/:itemId', verifyToken, autoResolveUserId, deleteFoodByItemId);
router.put('/:userId/:date/food/:itemId', verifyToken, autoResolveUserId, updateFoodQuantity);


export default router;