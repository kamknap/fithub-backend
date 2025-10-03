import { DailyNutrition } from '../models/DailyNutrition.js';
import { Food } from '../models/Foods.js';
import { UserGoal } from '../models/UserGoal.js';

// GET /api/nutrition/:userId/:date
export async function getDailyNutrition(req, res, next) {
  try {
    const { userId, date } = req.params;
    
    const nutrition = await DailyNutrition.findOne({ userId, date })
      .populate('meals.foods.foodId');
    
    if (!nutrition) {
      // Pobierz cel kaloryczny z aktywnego celu użytkownika
      const activeGoal = await UserGoal.findOne({ userId, status: 'active' });
      const calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
      
      return res.json({
        userId,
        date,
        meals: [],
        dailyTotals: { calorieGoal, calorieEaten: 0 },
        notes: null
      });
    }
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// POST /api/nutrition/:userId/:date/meal
export async function addMeal(req, res, next) {
  try {
    const { userId, date } = req.params;
    const { meal } = req.body;

    // Oblicz kalorie dla posiłku
    const mealCalories = await calculateMealCalories(meal.foods);

    // Pobierz lub stwórz dziennik na dany dzień
    let nutrition = await DailyNutrition.findOne({ userId, date });
    
    if (!nutrition) {
      const activeGoal = await UserGoal.findOne({ userId, status: 'active' });
      const calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
      
      nutrition = new DailyNutrition({
        userId,
        date,
        meals: [],
        dailyTotals: { calorieGoal, calorieEaten: 0 }
      });
    }

    // Dodaj posiłek
    nutrition.meals.push(meal);
    
    // Aktualizuj dzienne sumy
    nutrition.dailyTotals.calorieEaten += mealCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// DELETE /api/nutrition/:userId/:date/meal/:mealIndex
export async function deleteMeal(req, res, next) {
  try {
    const { userId, date, mealIndex } = req.params;
    
    const nutrition = await DailyNutrition.findOne({ userId, date });
    if (!nutrition) {
      return res.status(404).json({ message: 'Dziennik nie został znaleziony' });
    }

    if (mealIndex >= nutrition.meals.length) {
      return res.status(404).json({ message: 'Posiłek nie został znaleziony' });
    }

    // Oblicz kalorie do odjęcia
    const mealToDelete = nutrition.meals[mealIndex];
    const mealCalories = await calculateMealCalories(mealToDelete.foods);

    // Usuń posiłek
    nutrition.meals.splice(mealIndex, 1);
    
    // Aktualizuj dzienne sumy
    nutrition.dailyTotals.calorieEaten -= mealCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// Funkcja pomocnicza do obliczania kalorii posiłku
async function calculateMealCalories(foods) {
  let totalCalories = 0;

  for (const foodItem of foods) {
    const food = await Food.findById(foodItem.foodId);
    if (food) {
      const multiplier = foodItem.quantity / 100; // quantity w gramach, nutrition na 100g
      totalCalories += food.nutritionPer100g.calories * multiplier;
    }
  }

  return Math.round(totalCalories * 10) / 10;
}