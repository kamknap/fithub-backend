import { DailyNutrition } from '../models/DailyNutrition.js';
import { Food } from '../models/Foods.js';
import { UserGoal } from '../models/UserGoal.js';
import { User } from '../models/User.js';

export async function getCurrentUserDailyNutrition(req, res, next) {
  try {
    const { date } = req.params;
    
    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
    const currentCalorieGoal = activeGoal?.plan?.calorieTarget || 2000;
    
    const nutrition = await DailyNutrition.findOne({ userId: user._id, date })
      .populate('meals.foods.foodId');
    
    if (!nutrition) {
      return res.json({
        userId: user._id,
        date,
        meals: [],
        dailyTotals: { calorieGoal: currentCalorieGoal, calorieEaten: 0 },
        notes: null
      });
    }
    
    nutrition.dailyTotals.calorieGoal = currentCalorieGoal;
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

export async function addMealForCurrentUser(req, res, next) {
  try {
    const { date } = req.params;
    const { meal } = req.body;

    const firebaseUid = req.user.uid;
    
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
    
    const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
    nutrition.dailyTotals.calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

export async function deleteMealForCurrentUser(req, res, next) {
  try {
    const { date, mealIndex } = req.params;
    
    const firebaseUid = req.user.uid;
    
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
    
    const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
    nutrition.dailyTotals.calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

export async function deleteFoodFromMealForCurrentUser(req, res, next) {
  try {
    const { date, mealIndex, foodIndex } = req.params;
    
    const firebaseUid = req.user.uid;
    
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
    
    const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
    nutrition.dailyTotals.calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
    
    res.json(nutrition);
  } catch (e) { next(e); }
}

export async function deleteFoodByItemIdForCurrentUser(req, res, next) {
  try {
    const { date, itemId } = req.params;
    
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
    
    const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
    nutrition.dailyTotals.calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
    
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
    
    const activeGoal = await UserGoal.findOne({ userId: user._id, status: 'active' });
    nutrition.dailyTotals.calorieGoal = activeGoal?.plan?.calorieTarget || 2000;
    
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