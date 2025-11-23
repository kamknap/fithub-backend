import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    iconUrl: { type: String, required: true },
    unlockedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Badge = mongoose.model('Badge', badgeSchema, 'badges');
