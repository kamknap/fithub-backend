import mongoose from 'mongoose';

const userExercisePlanSchema = new mongoose.Schema(
  {
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    plan_name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    plan_exercises: [
      {
        exercise_id: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Exercise', 
          required: true 
        }
      }
    ]
  },
  { timestamps: true }
);

// Indeks do szybszego wyszukiwania po user_id
userExercisePlanSchema.index({ user_id: 1 });

export const UserExercisePlan = mongoose.model('UserExercisePlan', userExercisePlanSchema, 'user_exercise_plans');
