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

// Wszystkie endpointy dla zalogowanego użytkownika (pattern /me)
// GET /api/daily-nutrition/me/:date
router.get('/me/:date', verifyToken, getCurrentUserDailyNutrition);

// POST /api/daily-nutrition/me/:date/meal
router.post('/me/:date/meal', verifyToken, addMealForCurrentUser);

// DELETE /api/daily-nutrition/me/:date/meal/:mealIndex
router.delete('/me/:date/meal/:mealIndex', verifyToken, deleteMealForCurrentUser);

// DELETE /api/daily-nutrition/me/:date/meal/:mealIndex/food/:foodIndex
router.delete('/me/:date/meal/:mealIndex/food/:foodIndex', verifyToken, deleteFoodFromMealForCurrentUser);

// DELETE /api/daily-nutrition/me/:date/food/:itemId
router.delete('/me/:date/food/:itemId', verifyToken, deleteFoodByItemIdForCurrentUser);

// PUT /api/daily-nutrition/me/:date/food/:itemId
router.put('/me/:date/food/:itemId', verifyToken, updateFoodQuantityForCurrentUser);

export default router;