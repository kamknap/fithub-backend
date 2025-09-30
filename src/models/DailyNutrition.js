import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  quantity: { type: Number, required: true } // w gramach
});

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, required: true },
  foods: [foodItemSchema]
});

const dailyNutritionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meals: [mealSchema],
  dailyTotals: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 }
  },
  calorieGoal: { type: Number, required: true },
  notes: { type: String, default: null }
}, { timestamps: true });

dailyNutritionSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyNutrition = mongoose.model('DailyNutrition', dailyNutritionSchema, 'daily_nutrition');