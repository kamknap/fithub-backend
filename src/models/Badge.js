import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['STREAK', 'MEAL_COUNT', 'WEIGHT_LOSS', 'TRAINING_COUNT', 'TRAINING_PLAN_COUNT']
    }
  },
  { timestamps: true }
);

export const Badge = mongoose.model('Badge', badgeSchema, 'badges');
