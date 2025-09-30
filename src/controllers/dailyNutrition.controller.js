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
        dailyTotals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        calorieGoal,
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

    // Oblicz wartości odżywcze dla posiłku
    const mealTotals = await calculateMealNutrition(meal.foods);

    // Pobierz lub stwórz dziennik na dany dzień
    let nutrition = await DailyNutrition.findOne({ userId, date });
    
    if (!nutrition) {
      const activeGoal = await UserGoal.findOne({ userId, status: 'active' });
      const calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
      
      nutrition = new DailyNutrition({
        userId,
        date,
        meals: [],
        dailyTotals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        calorieGoal
      });
    }

    // Dodaj posiłek
    nutrition.meals.push(meal);
    
    // Aktualizuj dzienne sumy
    nutrition.dailyTotals.calories += mealTotals.calories;
    nutrition.dailyTotals.protein += mealTotals.protein;
    nutrition.dailyTotals.fat += mealTotals.fat;
    nutrition.dailyTotals.carbs += mealTotals.carbs;

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

    // Oblicz wartości do odjęcia
    const mealToDelete = nutrition.meals[mealIndex];
    const mealTotals = await calculateMealNutrition(mealToDelete.foods);

    // Usuń posiłek
    nutrition.meals.splice(mealIndex, 1);
    
    // Aktualizuj dzienne sumy
    nutrition.dailyTotals.calories -= mealTotals.calories;
    nutrition.dailyTotals.protein -= mealTotals.protein;
    nutrition.dailyTotals.fat -= mealTotals.fat;
    nutrition.dailyTotals.carbs -= mealTotals.carbs;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// Funkcja pomocnicza do obliczania wartości odżywczych posiłku
async function calculateMealNutrition(foods) {
  let totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };

  for (const foodItem of foods) {
    const food = await Food.findById(foodItem.foodId);
    if (food) {
      const multiplier = foodItem.quantity / 100; // quantity w gramach, nutrition na 100g
      totals.calories += food.nutritionPer100g.calories * multiplier;
      totals.protein += food.nutritionPer100g.protein * multiplier;
      totals.fat += food.nutritionPer100g.fat * multiplier;
      totals.carbs += food.nutritionPer100g.carbs * multiplier;
    }
  }

  return {
    calories: Math.round(totals.calories * 10) / 10,
    protein: Math.round(totals.protein * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10
  };
}