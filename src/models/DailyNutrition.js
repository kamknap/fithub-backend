import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true }
});

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  foods: [foodItemSchema]
});

const dailyNutritionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meals: [mealSchema],
  dailyTotals: {
    calorieGoal: { type: Number, required: true },
    calorieEaten: { type: Number, default: 0 }
  },
  notes: { type: String, default: null }
}, { timestamps: true });

dailyNutritionSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyNutrition = mongoose.model('DailyNutrition', dailyNutritionSchema, 'daily_nutrition');