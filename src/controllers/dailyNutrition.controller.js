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

// DELETE /api/nutrition/:userId/:date/meal/:mealIndex/food/:foodIndex
export async function deleteFoodFromMeal(req, res, next) {
  try {
    const { userId, date, mealIndex, foodIndex } = req.params;
    
    const nutrition = await DailyNutrition.findOne({ userId, date });
    if (!nutrition) {
      return res.status(404).json({ message: 'Dziennik nie został znaleziony' });
    }

    if (mealIndex >= nutrition.meals.length) {
      return res.status(404).json({ message: 'Posiłek nie został znaleziony' });
    }

    const meal = nutrition.meals[mealIndex];
    if (foodIndex >= meal.foods.length) {
      return res.status(404).json({ message: 'Pozycja jedzenia nie została znaleziona' });
    }

    // Oblicz kalorie pozycji do usunięcia
    const foodToDelete = meal.foods[foodIndex];
    const foodCalories = await calculateFoodItemCalories(foodToDelete);

    // Usuń pozycję jedzenia z posiłku
    meal.foods.splice(foodIndex, 1);
    
    // Jeśli posiłek jest pusty, usuń go całkowicie
    if (meal.foods.length === 0) {
      nutrition.meals.splice(mealIndex, 1);
    }
    
    // Aktualizuj dzienne sumy
    nutrition.dailyTotals.calorieEaten -= foodCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

export async function deleteFoodByItemId(req, res, next) {
  try {
    const { userId, date, itemId } = req.params;
    
    const nutrition = await DailyNutrition.findOne({ userId, date });
    if (!nutrition) {
      return res.status(404).json({ message: 'Dziennik nie został znaleziony' });
    }

    let foodFound = false;
    let foodCalories = 0;

    // Znajdź i usuń pozycję jedzenia po itemId
    for (let mealIndex = 0; mealIndex < nutrition.meals.length; mealIndex++) {
      const meal = nutrition.meals[mealIndex];
      const foodIndex = meal.foods.findIndex(food => food.itemId.toString() === itemId);
      
      if (foodIndex !== -1) {
        // Oblicz kalorie pozycji do usunięcia
        const foodToDelete = meal.foods[foodIndex];
        foodCalories = await calculateFoodItemCalories(foodToDelete);

        // Usuń pozycję jedzenia z posiłku
        meal.foods.splice(foodIndex, 1);
        
        // Jeśli posiłek jest pusty, usuń go całkowicie
        if (meal.foods.length === 0) {
          nutrition.meals.splice(mealIndex, 1);
        }
        
        foodFound = true;
        break;
      }
    }

    if (!foodFound) {
      return res.status(404).json({ message: 'Pozycja jedzenia nie została znaleziona' });
    }
    
    // Aktualizuj dzienne sumy
    nutrition.dailyTotals.calorieEaten -= foodCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// PUT /api/nutrition/:userId/:date/food/:itemId - edytuj quantity pozycji jedzenia
export async function updateFoodQuantity(req, res, next) {
  try {
    const { userId, date, itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity == null || quantity <= 0) {
      return res.status(400).json({ message: 'quantity jest wymagane i musi być większe od 0' });
    }

    const nutrition = await DailyNutrition.findOne({ userId, date });
    if (!nutrition) {
      return res.status(404).json({ message: 'Dziennik nie został znaleziony' });
    }

    let foodFound = false;
    let oldCalories = 0;
    let newCalories = 0;

    // Znajdź pozycję jedzenia po itemId i zaktualizuj quantity
    for (let mealIndex = 0; mealIndex < nutrition.meals.length; mealIndex++) {
      const meal = nutrition.meals[mealIndex];
      const foodIndex = meal.foods.findIndex(food => food.itemId.toString() === itemId);
      
      if (foodIndex !== -1) {
        const foodItem = meal.foods[foodIndex];
        
        // Oblicz stare kalorie
        oldCalories = await calculateFoodItemCalories(foodItem);
        
        // Zaktualizuj quantity
        foodItem.quantity = quantity;
        
        // Oblicz nowe kalorie
        newCalories = await calculateFoodItemCalories(foodItem);
        
        foodFound = true;
        break;
      }
    }

    if (!foodFound) {
      return res.status(404).json({ message: 'Pozycja jedzenia nie została znaleziona' });
    }
    
    // Aktualizuj dzienne sumy
    nutrition.dailyTotals.calorieEaten = nutrition.dailyTotals.calorieEaten - oldCalories + newCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// Funkcja pomocnicza do obliczania kalorii posiłku
async function calculateMealCalories(foods) {
  let totalCalories = 0;

  for (const foodItem of foods) {
    const calories = await calculateFoodItemCalories(foodItem);
    totalCalories += calories;
  }

  return Math.round(totalCalories * 10) / 10;
}

// Funkcja pomocnicza do obliczania kalorii pojedynczej pozycji jedzenia
async function calculateFoodItemCalories(foodItem) {
  const food = await Food.findById(foodItem.foodId);
  if (food) {
    const multiplier = foodItem.quantity / 100; // quantity w gramach, nutrition na 100g
    return food.nutritionPer100g.calories * multiplier;
  }
  return 0;
}