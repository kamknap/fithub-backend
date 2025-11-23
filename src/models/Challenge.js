import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    durationDays: { type: Number, required: true, min: 1 },
    pointsForComplete: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export const Challenge = mongoose.model('Challenge', challengeSchema, 'challenges');
