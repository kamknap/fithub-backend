import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    pointsForComplete: { type: Number, required: true, min: 0 },
    type: { 
      type: String, 
      required: true,
      enum: ['STREAK', 'MEAL_COUNT', 'WEIGHT_LOSS', 'TRAINING_COUNT']
    },
    targetValue: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

export const Challenge = mongoose.model('Challenge', challengeSchema, 'challenges');
