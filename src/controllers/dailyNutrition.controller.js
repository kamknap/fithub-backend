import { DailyNutrition } from '../models/DailyNutrition.js';
import { Food } from '../models/Foods.js';
import { UserGoal } from '../models/UserGoal.js';
import { User } from '../models/User.js';

// GET /api/daily-nutrition/me/:date - dzienna dieta zalogowanego użytkownika
export async function getCurrentUserDailyNutrition(req, res, next) {
  try {
    const { date } = req.params;
    
    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    const nutrition = await DailyNutrition.findOne({ userId: user._id, date })
      .populate('meals.foods.foodId');
    
    if (!nutrition) {
      const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
      const calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
      
      return res.json({
        userId: user._id,
        date,
        meals: [],
        dailyTotals: { calorieGoal, calorieEaten: 0 },
        notes: null
      });
    }
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// POST /api/daily-nutrition/me/:date/meal - dodaj posiłek dla zalogowanego użytkownika
export async function addMealForCurrentUser(req, res, next) {
  try {
    const { date } = req.params;
    const { meal } = req.body;

    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const mealCalories = await calculateMealCalories(meal.foods);

    let nutrition = await DailyNutrition.findOne({ userId: user._id, date });
    
    if (!nutrition) {
      const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
      const calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
      
      nutrition = new DailyNutrition({
        userId: user._id,
        date,
        meals: [],
        dailyTotals: { calorieGoal, calorieEaten: 0 }
      });
    }

    nutrition.meals.push(meal);
    
    nutrition.dailyTotals.calorieEaten += mealCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// DELETE /api/daily-nutrition/me/:date/meal/:mealIndex - usuń posiłek dla zalogowanego użytkownika
export async function deleteMealForCurrentUser(req, res, next) {
  try {
    const { date, mealIndex } = req.params;
    
    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    const nutrition = await DailyNutrition.findOne({ userId: user._id, date });
    if (!nutrition) {
      return res.status(404).json({ message: 'Dziennik nie został znaleziony' });
    }

    if (mealIndex >= nutrition.meals.length) {
      return res.status(404).json({ message: 'Posiłek nie został znaleziony' });
    }

    const mealToDelete = nutrition.meals[mealIndex];
    const mealCalories = await calculateMealCalories(mealToDelete.foods);

    nutrition.meals.splice(mealIndex, 1);
    
    nutrition.dailyTotals.calorieEaten -= mealCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// DELETE /api/daily-nutrition/me/:date/meal/:mealIndex/food/:foodIndex
export async function deleteFoodFromMealForCurrentUser(req, res, next) {
  try {
    const { date, mealIndex, foodIndex } = req.params;
    
    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    const nutrition = await DailyNutrition.findOne({ userId: user._id, date });
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

    const foodToDelete = meal.foods[foodIndex];
    const foodCalories = await calculateFoodItemCalories(foodToDelete);

    meal.foods.splice(foodIndex, 1);
    
    if (meal.foods.length === 0) {
      nutrition.meals.splice(mealIndex, 1);
    }
    
    nutrition.dailyTotals.calorieEaten -= foodCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

// DELETE /api/daily-nutrition/me/:date/food/:itemId
export async function deleteFoodByItemIdForCurrentUser(req, res, next) {
  try {
    const { date, itemId } = req.params;
    
    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    const nutrition = await DailyNutrition.findOne({ userId: user._id, date });
    if (!nutrition) {
      return res.status(404).json({ message: 'Dziennik nie został znaleziony' });
    }

    let foodFound = false;
    let foodCalories = 0;

    for (let mealIndex = 0; mealIndex < nutrition.meals.length; mealIndex++) {
      const meal = nutrition.meals[mealIndex];
      const foodIndex = meal.foods.findIndex(food => food.itemId.toString() === itemId);
      
      if (foodIndex !== -1) {
        const foodToDelete = meal.foods[foodIndex];
        foodCalories = await calculateFoodItemCalories(foodToDelete);

        meal.foods.splice(foodIndex, 1);
        
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
    
    nutrition.dailyTotals.calorieEaten -= foodCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

export async function updateFoodQuantityForCurrentUser(req, res, next) {
  try {
    const { date, itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity == null || quantity <= 0) {
      return res.status(400).json({ message: 'quantity jest wymagane i musi być większe od 0' });
    }

    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const nutrition = await DailyNutrition.findOne({ userId: user._id, date });
    if (!nutrition) {
      return res.status(404).json({ message: 'Dziennik nie został znaleziony' });
    }

    let foodFound = false;
    let oldCalories = 0;
    let newCalories = 0;

    for (let mealIndex = 0; mealIndex < nutrition.meals.length; mealIndex++) {
      const meal = nutrition.meals[mealIndex];
      const foodIndex = meal.foods.findIndex(food => food.itemId.toString() === itemId);
      
      if (foodIndex !== -1) {
        const foodItem = meal.foods[foodIndex];
        
        oldCalories = await calculateFoodItemCalories(foodItem);
        
        foodItem.quantity = quantity;
        
        newCalories = await calculateFoodItemCalories(foodItem);
        
        foodFound = true;
        break;
      }
    }

    if (!foodFound) {
      return res.status(404).json({ message: 'Pozycja jedzenia nie została znaleziona' });
    }
    
    nutrition.dailyTotals.calorieEaten = nutrition.dailyTotals.calorieEaten - oldCalories + newCalories;

    await nutrition.save();
    await nutrition.populate('meals.foods.foodId');
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

async function calculateMealCalories(foods) {
  let totalCalories = 0;

  for (const foodItem of foods) {
    const calories = await calculateFoodItemCalories(foodItem);
    totalCalories += calories;
  }

  return Math.round(totalCalories * 10) / 10;
}

async function calculateFoodItemCalories(foodItem) {
  const food = await Food.findById(foodItem.foodId);
  if (food) {
    const multiplier = foodItem.quantity / 100; // quantity w gramach (na 100)
    return food.nutritionPer100g.calories * multiplier;
  }
  return 0;
}